import { Contact, ContactsState } from '../types';
import { supabase } from './supabase';

export const LEGACY_STORAGE_KEY = 'huayu-contacts-v2';
const USER_CACHE_PREFIX = 'huayu-contacts-cloud-v1:';

interface ContactRow {
  id: string;
  user_id: string;
  province_id: string;
  name: string;
  city: string;
  note: string;
  category: Contact['category'] | null;
  added_at: number;
}

export const emptyContacts = (): ContactsState => ({});

export const countContacts = (contacts: ContactsState) =>
  Object.values(contacts).reduce((total, provinceContacts) => total + provinceContacts.length, 0);

export const readStoredContacts = (key = LEGACY_STORAGE_KEY): ContactsState => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyContacts();
    return validateContacts(JSON.parse(raw));
  } catch {
    return emptyContacts();
  }
};

export const writeStoredContacts = (contacts: ContactsState, userId?: string) => {
  const key = userId ? `${USER_CACHE_PREFIX}${userId}` : LEGACY_STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(contacts));
};

export const readUserCache = (userId: string) => readStoredContacts(`${USER_CACHE_PREFIX}${userId}`);

export const validateContacts = (value: unknown): ContactsState => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('备份文件格式不正确');
  }

  const result: ContactsState = {};
  for (const [provinceId, provinceContacts] of Object.entries(value)) {
    if (!Array.isArray(provinceContacts)) throw new Error('备份文件格式不正确');
    result[provinceId] = provinceContacts.map((candidate) => {
      if (!candidate || typeof candidate !== 'object') throw new Error('备份文件格式不正确');
      const contact = candidate as Partial<Contact>;
      if (typeof contact.id !== 'string' || typeof contact.name !== 'string') {
        throw new Error('备份文件缺少必要的联系人字段');
      }
      return {
        id: contact.id,
        name: contact.name,
        city: typeof contact.city === 'string' ? contact.city : '',
        note: typeof contact.note === 'string' ? contact.note : '',
        category: contact.category,
        addedAt: typeof contact.addedAt === 'number' ? contact.addedAt : Date.now(),
      };
    });
  }
  return result;
};

export const mergeContacts = (current: ContactsState, incoming: ContactsState): ContactsState => {
  const merged: ContactsState = { ...current };
  for (const [provinceId, provinceContacts] of Object.entries(incoming)) {
    const byId = new Map((merged[provinceId] || []).map((contact) => [contact.id, contact]));
    provinceContacts.forEach((contact) => byId.set(contact.id, contact));
    merged[provinceId] = Array.from(byId.values());
  }
  return merged;
};

const toRow = (userId: string, provinceId: string, contact: Contact): ContactRow => ({
  id: contact.id,
  user_id: userId,
  province_id: provinceId,
  name: contact.name,
  city: contact.city || '',
  note: contact.note || '',
  category: contact.category || null,
  added_at: contact.addedAt,
});

export const loadCloudContacts = async (userId: string): Promise<ContactsState> => {
  if (!supabase) return emptyContacts();
  const { data, error } = await supabase
    .from('contacts')
    .select('id,user_id,province_id,name,city,note,category,added_at')
    .eq('user_id', userId)
    .order('added_at', { ascending: true });
  if (error) throw error;

  return (data as ContactRow[]).reduce<ContactsState>((state, row) => {
    const contact: Contact = {
      id: row.id,
      name: row.name,
      city: row.city,
      note: row.note,
      category: row.category || undefined,
      addedAt: row.added_at,
    };
    state[row.province_id] = [...(state[row.province_id] || []), contact];
    return state;
  }, {});
};

export const uploadContacts = async (userId: string, contacts: ContactsState) => {
  if (!supabase) throw new Error('云端尚未配置');
  const rows = Object.entries(contacts).flatMap(([provinceId, provinceContacts]) =>
    provinceContacts.map((contact) => toRow(userId, provinceId, contact)),
  );
  if (rows.length === 0) return;
  const { error } = await supabase.from('contacts').upsert(rows, { onConflict: 'user_id,id' });
  if (error) throw error;
};

export const upsertCloudContact = async (userId: string, provinceId: string, contact: Contact) => {
  if (!supabase) return;
  const { error } = await supabase.from('contacts').upsert(toRow(userId, provinceId, contact), {
    onConflict: 'user_id,id',
  });
  if (error) throw error;
};

export const deleteCloudContact = async (userId: string, contactId: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('user_id', userId)
    .eq('id', contactId);
  if (error) throw error;
};

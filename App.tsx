
import React, { useState, useEffect, useRef } from 'react';
import { ChinaMap } from './components/ChinaMap';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ContactsState, Contact } from './types';
import { MapPin } from 'lucide-react';
import BrandWordmark from "./components/BrandWordmark";
import { DataControls } from './components/DataControls';
import { isCloudConfigured, supabase } from './lib/supabase';
import {
  countContacts,
  deleteCloudContact,
  LEGACY_STORAGE_KEY,
  loadCloudContacts,
  mergeContacts,
  readStoredContacts,
  readUserCache,
  uploadContacts,
  upsertCloudContact,
  validateContacts,
  writeStoredContacts,
} from './lib/contacts';

const PROVINCES_LIST = [
  "北京市", "天津市", "河北省", "山西省", "内蒙古自治区", "辽宁省", "吉林省", "黑龙江省",
  "上海市", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省",
  "湖北省", "湖南省", "广东省", "广西壮族自治区", "海南省", "重庆市", "四川省",
  "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区",
  "新疆维吾尔自治区", "香港特别行政区", "澳门特别行政区", "台湾省"
];

const App: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactsState>(() => readStoredContacts());
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [syncMessage, setSyncMessage] = useState(isCloudConfigured ? '等待登录' : '仅保存在本机');
  const activeUserRef = useRef<string | null>(null);

  const showUserContacts = async (userId: string) => {
    activeUserRef.current = userId;
    const cached = readUserCache(userId);
    if (countContacts(cached) > 0) setContacts(cached);
    setSyncMessage('正在读取云端联系人…');
    const cloudContacts = await loadCloudContacts(userId);
    if (activeUserRef.current !== userId) return;
    if (countContacts(cloudContacts) > 0) {
      setContacts(cloudContacts);
      writeStoredContacts(cloudContacts, userId);
      setMigrationNeeded(false);
      setSyncMessage('云端数据已同步');
      return;
    }

    const legacyContacts = readStoredContacts(LEGACY_STORAGE_KEY);
    setContacts(legacyContacts);
    setMigrationNeeded(countContacts(legacyContacts) > 0);
    setSyncMessage(countContacts(legacyContacts) > 0 ? '检测到本机数据，等待迁移确认' : '云端暂时没有联系人');
  };

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted || !data.session?.user) return;
      const sessionUser = data.session.user;
      setUser({ id: sessionUser.id, email: sessionUser.email || null });
      void showUserContacts(sessionUser.id).catch(() => setSyncMessage('云端读取失败，本机数据仍安全保留'));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || null });
        void showUserContacts(session.user.id).catch(() => setSyncMessage('云端读取失败，本机数据仍安全保留'));
      } else {
        activeUserRef.current = null;
        setUser(null);
        setMigrationNeeded(false);
        setContacts(readStoredContacts(LEGACY_STORAGE_KEY));
        setSyncMessage('已退出，当前显示本机数据');
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const persistCurrent = (next: ContactsState) => {
    writeStoredContacts(next, user?.id);
  };

  const handleProvinceSelect = (provinceId: string) => {
    setSelectedProvince(provinceId || null);
  };

  const addContact = (provinceId: string, contact: Omit<Contact, 'id' | 'addedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };
    const next = {
      ...contacts,
      [provinceId]: [...(contacts[provinceId] || []), newContact],
    };
    setContacts(next);
    persistCurrent(next);
    if (user) {
      setSyncMessage('正在同步…');
      void upsertCloudContact(user.id, provinceId, newContact)
        .then(() => setSyncMessage('云端数据已同步'))
        .catch(() => setSyncMessage('同步失败，本机副本已保留'));
    }
  };

  const removeContact = (provinceId: string, contactId: string) => {
    const next = {
      ...contacts,
      [provinceId]: (contacts[provinceId] || []).filter((c) => c.id !== contactId),
    };
    setContacts(next);
    persistCurrent(next);
    if (user) {
      setSyncMessage('正在同步…');
      void deleteCloudContact(user.id, contactId)
        .then(() => setSyncMessage('云端数据已同步'))
        .catch(() => setSyncMessage('同步失败，本机副本已保留'));
    }
  };

  const exportContacts = () => {
    const blob = new Blob([`${JSON.stringify(contacts, null, 2)}\n`], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkmap-contacts-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const importContacts = async (file: File) => {
    const imported = validateContacts(JSON.parse(await file.text()));
    const next = mergeContacts(contacts, imported);
    setContacts(next);
    persistCurrent(next);
    if (user) {
      await uploadContacts(user.id, next);
      setMigrationNeeded(false);
      setSyncMessage('导入内容已同步到云端');
    }
  };

  const migrateLegacyContacts = async () => {
    if (!user) throw new Error('请先登录');
    const legacyContacts = readStoredContacts(LEGACY_STORAGE_KEY);
    await uploadContacts(user.id, legacyContacts);
    const cloudContacts = await loadCloudContacts(user.id);
    const cloudIds = new Set(Object.values(cloudContacts).flat().map((contact) => contact.id));
    const allLegacyContactsPresent = Object.values(legacyContacts).flat().every((contact) => cloudIds.has(contact.id));
    if (!allLegacyContactsPresent) {
      throw new Error('迁移数量核对失败；本机原数据未改动');
    }
    setContacts(cloudContacts);
    writeStoredContacts(cloudContacts, user.id);
    setMigrationNeeded(false);
    setSyncMessage(`已同步 ${countContacts(cloudContacts)} 位联系人`);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('云端服务尚未配置');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('云端服务尚未配置');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const totalContacts = Object.values(contacts).reduce<number>((acc, curr) => acc + (curr as Contact[]).length, 0);
  const activeProvincesCount = Object.keys(contacts).filter(id => (contacts[id] as Contact[]).length > 0).length;

return (
  <div className="h-screen overflow-hidden px-5 py-5 md:px-7 md:py-6">
    <div className="glass relative mx-auto flex h-full w-full max-w-[1480px] overflow-hidden rounded-[36px] border border-white/60 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">

      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="relative flex min-h-0 flex-1 px-4 py-5 md:px-5 md:py-6">
          <section className="relative min-w-0 flex-1">
            <div className="flex h-full min-h-0 flex-col gap-4 px-2">
              <div className="z-20 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-4 px-3 pt-3">
                <div className="max-w-[520px] self-start pt-2">
                  <h1 className="flex items-baseline gap-2 text-[31px] font-semibold leading-none tracking-[-0.05em] text-[#1f2329]">
                    <span>欢迎来到</span>
                    <BrandWordmark text="城市朋友" />
                  </h1>

                  <p className="mt-3 text-[20px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#2a2f36]">
                    以地图为中心记录你的全国联络网
                  </p>

                  <p className="mt-2 text-[15px] leading-7 text-[#70757f]">
                    让人与人的连接重新回到空间之中，让每一座城市都有属于你的故事。
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <StatsCards total={totalContacts} provinces={activeProvincesCount} />
                  <div className="flex items-center gap-2">
                    <div className="relative w-[260px]">
                      <select
                      value={selectedProvince || ''}
                      onChange={(e) => handleProvinceSelect(e.target.value)}
                      className="w-full appearance-none rounded-full border border-black/5 bg-white/84 pl-10 pr-10 py-3 text-sm font-medium text-[#2b3037] shadow-[0_8px_20px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition-all duration-200 focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15"
                    >
                      <option value="">快速跳转省份...</option>
                      {PROVINCES_LIST.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      </select>
                      <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9099]" />
                    </div>
                    <DataControls
                      cloudConfigured={isCloudConfigured}
                      email={user?.email || null}
                      migrationNeeded={migrationNeeded}
                      syncMessage={syncMessage}
                      onExport={exportContacts}
                      onImport={importContacts}
                      onMigrate={migrateLegacyContacts}
                      onSignIn={signIn}
                      onSignUp={signUp}
                      onSignOut={signOut}
                    />
                  </div>
                </div>
              </div>

                <div className="min-h-0 flex-1">
                  <div className="h-full w-full overflow-hidden rounded-[26px] border border-black/5 bg-[#f7f9fc] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                    <ChinaMap
                      onProvinceSelect={handleProvinceSelect}
                      selectedProvince={selectedProvince}
                      contacts={contacts}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Sidebar
              provinceId={selectedProvince}
              contacts={selectedProvince ? contacts[selectedProvince] || [] : []}
              onAddContact={(contact) => selectedProvince && addContact(selectedProvince, contact)}
              onRemoveContact={(id) => selectedProvince && removeContact(selectedProvince, id)}
              onClose={() => setSelectedProvince(null)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { ChinaMap } from './components/ChinaMap';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ContactsState, Contact } from './types';
import { MapPin } from 'lucide-react';
import BrandWordmark from "./components/BrandWordmark";

const PROVINCES_LIST = [
  "北京市", "天津市", "河北省", "山西省", "内蒙古自治区", "辽宁省", "吉林省", "黑龙江省",
  "上海市", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省",
  "湖北省", "湖南省", "广东省", "广西壮族自治区", "海南省", "重庆市", "四川省",
  "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区",
  "新疆维吾尔自治区", "香港特别行政区", "澳门特别行政区", "台湾省"
];

const App: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactsState>(() => {
    const saved = localStorage.getItem('huayu-contacts-v2');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('huayu-contacts-v2', JSON.stringify(contacts));
  }, [contacts]);

  const handleProvinceSelect = (provinceId: string) => {
    setSelectedProvince(provinceId || null);
  };

  const addContact = (provinceId: string, contact: Omit<Contact, 'id' | 'addedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };
    setContacts((prev) => ({
      ...prev,
      [provinceId]: [...(prev[provinceId] || []), newContact],
    }));
  };

  const removeContact = (provinceId: string, contactId: string) => {
    setContacts((prev) => ({
      ...prev,
      [provinceId]: (prev[provinceId] || []).filter((c) => c.id !== contactId),
    }));
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

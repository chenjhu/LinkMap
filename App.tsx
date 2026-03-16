
import React, { useState, useEffect } from 'react';
import { ChinaMap } from './components/ChinaMap';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ContactsState, Contact } from './types';
import { MapPin } from 'lucide-react';

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

  const totalContacts = Object.values(contacts).reduce((acc, curr) => acc + (curr as Contact[]).length, 0);
  const activeProvincesCount = Object.keys(contacts).filter(id => (contacts[id] as Contact[]).length > 0).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#1f2329]">
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden transition-all duration-500 ease-out">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 to-transparent" />

        <header className="px-5 pt-5 pb-3 md:px-8 md:pt-7 md:pb-4 sticky top-0 z-30">
          <div className="glass mx-auto w-full max-w-7xl rounded-[28px] px-5 py-4 shadow-[0_18px_45px_rgba(18,24,40,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8a9099]">China Contact Map</p>
                <div className="flex items-end gap-3">
                  <h1 className="text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">联络图</h1>
                  <p className="hidden md:block text-sm text-[#7d828c] pb-0.5">以更安静、清晰的方式管理全国联络关系</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative min-w-[220px] group">
                  <select
                    value={selectedProvince || ''}
                    onChange={(e) => handleProvinceSelect(e.target.value)}
                    className="w-full appearance-none rounded-full border border-black/5 bg-white/80 pl-10 pr-10 py-3 text-sm font-medium text-[#2b3037] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-all duration-200 focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15"
                  >
                    <option value="">快速跳转省份...</option>
                    {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9099]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 md:px-8 md:pb-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px] xl:items-start">
              <div className="glass relative overflow-hidden rounded-[36px] border border-white/55 px-6 py-6 shadow-[0_28px_80px_rgba(18,24,40,0.10)] md:px-8 md:py-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/60 to-transparent" />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8a9099]">Overview</p>
                      <h2 className="text-[34px] leading-[1.02] font-semibold tracking-[-0.045em] text-[#1f2329]">
                        让中国地图成为你的联络关系主视图
                      </h2>
                      <p className="text-[15px] leading-7 text-[#70757f]">
                        选择省份、查看覆盖范围，并用更轻盈的界面节奏管理每一位本地联系人。
                      </p>
                    </div>
                    <div className="rounded-[26px] border border-white/60 bg-white/62 px-4 py-3 shadow-[0_14px_36px_rgba(18,24,40,0.08)] backdrop-blur-md">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a9099]">当前焦点</div>
                      <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#1f2329]">
                        {selectedProvince || '全国视图'}
                      </div>
                    </div>
                  </div>

                  <div
                    className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#f8f9fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_60px_rgba(18,24,40,0.10)]"
                    style={{ height: 'calc(100vh - 310px)', minHeight: '560px' }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-white/75 to-transparent" />
                    <ChinaMap
                      onProvinceSelect={handleProvinceSelect}
                      selectedProvince={selectedProvince}
                      contacts={contacts}
                    />
                  </div>
                </div>
              </div>

              <StatsCards total={totalContacts} provinces={activeProvincesCount} />
            </section>

            <div className="text-center py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a8] opacity-70">
              个人联络地图工具
            </div>
          </div>
        </div>
      </main>

      <Sidebar 
        provinceId={selectedProvince} 
        contacts={selectedProvince ? contacts[selectedProvince] || [] : []}
        onAddContact={(contact) => selectedProvince && addContact(selectedProvince, contact)}
        onRemoveContact={(id) => selectedProvince && removeContact(selectedProvince, id)}
        onClose={() => setSelectedProvince(null)}
      />
    </div>
  );
};

export default App;

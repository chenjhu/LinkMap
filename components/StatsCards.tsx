
import React from 'react';
import { Users, Map as MapIcon, Globe } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  provinces: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, provinces }) => {
  return (
    <aside className="grid grid-cols-2 gap-4 xl:grid-cols-1">
      <div className="glass rounded-[30px] border border-white/60 p-5 shadow-[0_18px_40px_rgba(18,24,40,0.08)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_24px_45px_rgba(18,24,40,0.10)]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[18px] bg-[#5b8def]/12 flex items-center justify-center text-[#5b8def]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.22em]">联络总数</p>
            <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">{total}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-[30px] border border-white/60 p-5 shadow-[0_18px_40px_rgba(18,24,40,0.08)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_24px_45px_rgba(18,24,40,0.10)]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[18px] bg-[#1f2329]/6 flex items-center justify-center text-[#1f2329]">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.22em]">覆盖省份</p>
            <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">{provinces}</p>
          </div>
        </div>
      </div>

      <div className="glass col-span-2 xl:col-span-1 rounded-[30px] border border-white/60 p-5 shadow-[0_18px_40px_rgba(18,24,40,0.08)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_24px_45px_rgba(18,24,40,0.10)]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[18px] bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.22em]">版图比例</p>
            <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">
              {Math.round((provinces / 34) * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-2 xl:col-span-1 rounded-[28px] border border-black/5 bg-white/55 px-5 py-4 text-sm leading-6 text-[#70757f] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        联系人数与省份覆盖会随着地图和侧边栏中的操作实时更新。
      </div>
    </aside>
  );
};

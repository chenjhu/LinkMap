
import React from 'react';
import { Users, Map as MapIcon, Globe } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  provinces: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, provinces }) => {
  return (
    <aside className="grid grid-cols-3 gap-2.5">
      <div className="glass min-w-[128px] rounded-[20px] border border-white/70 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#5b8def]/12 text-[#5b8def]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9099]">联络总数</p>
            <p className="mt-1 text-[22px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">{total}</p>
          </div>
        </div>
      </div>

      <div className="glass min-w-[128px] rounded-[20px] border border-white/70 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#1f2329]/6 text-[#1f2329]">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9099]">覆盖省份</p>
            <p className="mt-1 text-[22px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">{provinces}</p>
          </div>
        </div>
      </div>

      <div className="glass min-w-[128px] rounded-[20px] border border-white/70 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] text-emerald-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9099]">版图比例</p>
            <p className="mt-1 text-[22px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329]">
              {Math.round((provinces / 34) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

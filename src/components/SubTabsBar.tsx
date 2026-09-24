import React from 'react';

export type SubTabType = 'Firms' | 'Challenges' | 'Offers' | 'Reviews';

interface SubTabsBarProps {
  activeSubTab: SubTabType;
  setActiveSubTab: (tab: SubTabType) => void;
}

export const SubTabsBar: React.FC<SubTabsBarProps> = ({ activeSubTab, setActiveSubTab }) => {
  const tabs: SubTabType[] = ['Firms', 'Challenges', 'Offers', 'Reviews'];

  return (
    <div className="flex justify-center mt-8 px-4">
      <div className="inline-flex p-1 rounded-full bg-[#121422] border border-slate-800 shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};

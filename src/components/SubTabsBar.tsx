import React from 'react';

export type SubTabType = 'Firms' | 'Challenges' | 'Offers' | 'Reviews';

interface SubTabsBarProps {
  activeSubTab: SubTabType;
  setActiveSubTab: (tab: SubTabType) => void;
}

export const SubTabsBar: React.FC<SubTabsBarProps> = ({ activeSubTab, setActiveSubTab }) => {
  const tabs: SubTabType[] = ['Firms', 'Challenges', 'Offers', 'Reviews'];

  return (
    <div className="mx-auto mt-9 max-w-[1240px] overflow-x-auto px-6 sm:px-8">
      <div className="inline-flex min-w-max items-center gap-7 border-b border-[#2b2e2c]">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`border-b-2 px-0.5 pb-3 pt-1 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'border-[#3ecf8e] text-[#f1f3f2]'
                  : 'border-transparent text-[#9a9e9b] hover:text-[#f1f3f2]'
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

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
      <div className="inline-flex rounded-lg border border-[#2b2e2c] bg-[#1d1f1e] p-1">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`rounded-md px-5 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-[#f1f3f2] text-[#171918] font-semibold'
                  : 'text-[#9a9e9b] hover:text-[#f1f3f2] hover:bg-[#222522]'
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

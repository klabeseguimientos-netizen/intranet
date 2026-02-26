// resources/js/components/ui/Tabs.tsx
import React, { useState } from 'react';

interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    items: TabItem[];
    defaultTab?: string;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

    const handleTabClick = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault(); // Prevenir cualquier comportamiento por defecto
        e.stopPropagation(); // Detener propagación del evento
        setActiveTab(tabId);
    };

    return (
        <div className={className} onClick={(e) => e.stopPropagation()}>
            {/* Tab Headers - Scrollable en mobile */}
            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex min-w-max sm:min-w-0 sm:flex-wrap gap-1" aria-label="Tabs">
                    {items.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={(e) => handleTabClick(e, tab.id)}
                            className={`
                                px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg
                                flex items-center gap-1.5 sm:gap-2 whitespace-nowrap
                                transition-colors duration-200
                                ${activeTab === tab.id
                                    ? 'bg-white text-local border-l border-t border-r border-gray-200 -mb-px'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                {items.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};
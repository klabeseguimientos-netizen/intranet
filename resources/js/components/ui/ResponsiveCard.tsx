// resources/js/components/ui/ResponsiveCard.tsx
import React from 'react';

interface ResponsiveCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    titleClassName?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
    title,
    children,
    className = '',
    actions,
    titleClassName = ''
}) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className={`text-base sm:text-lg font-semibold text-gray-900 ${titleClassName}`}>
                        {title}
                    </h2>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

export default ResponsiveCard;
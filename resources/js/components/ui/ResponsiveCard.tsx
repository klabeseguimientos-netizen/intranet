// resources/js/components/ui/ResponsiveCard.tsx
import React from 'react';

interface ResponsiveCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    titleClassName?: string;
    icon?: React.ReactNode;  // ← NUEVA PROP OPCIONAL
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
    title,
    children,
    className = '',
    actions,
    titleClassName = '',
    icon  // ← NUEVA PROP
}) => {
    return (
        <div className={`bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
            <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className={`text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 ${titleClassName}`}>
                        {icon && <span className="text-local">{icon}</span>}
                        {title}
                    </h2>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-5">
                {children}
            </div>
        </div>
    );
};

export default ResponsiveCard;
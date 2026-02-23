// resources/js/components/ui/DataCard.tsx
import React from 'react';

interface DataCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

export const DataCard: React.FC<DataCardProps> = ({
    title,
    children,
    className = '',
    icon
}) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-gray-500">{icon}</div>}
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
                </div>
            </div>
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

// resources/js/components/ui/InfoRow.tsx
interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    className = '',
    labelClassName = '',
    valueClassName = ''
}) => {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0 ${className}`}>
            <span className={`text-xs sm:text-sm text-gray-600 sm:w-1/3 ${labelClassName}`}>{label}</span>
            <span className={`text-sm sm:text-base font-medium text-gray-900 sm:w-2/3 ${valueClassName}`}>{value}</span>
        </div>
    );
};

// resources/js/components/ui/StatusBadge.tsx
interface StatusBadgeProps {
    status?: string;
    color?: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status = 'Sin estado',
    color = 'gray',
    className = ''
}) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}>
            {status}
        </span>
    );
};

// resources/js/components/ui/Amount.tsx
interface AmountProps {
    value: number;
    className?: string;
    showSymbol?: boolean;
}

export const Amount: React.FC<AmountProps> = ({
    value,
    className = '',
    showSymbol = true
}) => {
    const formatMoney = (val: number) => {
        if (isNaN(val)) return showSymbol ? '$ 0,00' : '0,00';
        const formatted = val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return showSymbol ? `$ ${formatted}` : formatted;
    };

    return <span className={className}>{formatMoney(value)}</span>;
};
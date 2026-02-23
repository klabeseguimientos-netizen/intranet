// resources/js/components/ui/InfoRow.tsx
import React from 'react';

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
    direction?: 'row' | 'column';
}

export const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    className = '',
    labelClassName = '',
    valueClassName = '',
    direction = 'row'
}) => {
    const directionClasses = {
        row: 'flex flex-row items-center justify-between sm:justify-start sm:gap-4',
        column: 'flex flex-col'
    };

    return (
        <div className={`${directionClasses[direction]} py-2 border-b border-gray-100 last:border-0 ${className}`}>
            <span className={`text-xs sm:text-sm text-gray-600 ${direction === 'column' ? 'mb-1' : 'sm:w-1/3'} ${labelClassName}`}>
                {label}
            </span>
            <span className={`text-sm sm:text-base font-medium text-gray-900 ${direction === 'row' ? 'sm:w-2/3' : ''} ${valueClassName}`}>
                {value}
            </span>
        </div>
    );
};

export default InfoRow;
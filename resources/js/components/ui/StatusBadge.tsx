// resources/js/components/ui/StatusBadge.tsx
import React from 'react';

export type StatusColor = 'green' | 'yellow' | 'blue' | 'red' | 'gray' | 'orange' | 'purple';

interface StatusBadgeProps {
    status?: string;
    color?: StatusColor;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status = 'Sin estado',
    color = 'gray',
    className = '',
    size = 'md',
    dot = false
}) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        gray: 'bg-gray-100 text-gray-800 border-gray-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const dotColors = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span 
            className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />
            )}
            {status}
        </span>
    );
};

export default StatusBadge;
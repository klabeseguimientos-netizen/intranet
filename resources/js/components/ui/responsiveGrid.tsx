// resources/js/components/ui/ResponsiveGrid.tsx
import React from 'react';

interface ResponsiveGridProps {
    children: React.ReactNode;
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: number;
    className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
    children,
    cols = { default: 1 },
    gap = 4,
    className = ''
}) => {
    const getGridCols = () => {
        const classes = [];
        
        // Default
        classes.push(`grid-cols-${cols.default || 1}`);
        
        // Responsive
        if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
        if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
        if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
        if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
        
        return classes.join(' ');
    };

    return (
        <div className={`grid gap-${gap} ${getGridCols()} ${className}`}>
            {children}
        </div>
    );
};

export default ResponsiveGrid;
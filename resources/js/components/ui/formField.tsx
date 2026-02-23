// resources/js/components/ui/FormField.tsx
import React from 'react';

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    error?: string | null;
    required?: boolean;
    className?: string;
    labelClassName?: string;
    htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    children,
    error,
    required,
    className = '',
    labelClassName = '',
    htmlFor
}) => {
    return (
        <div className={className}>
            <label 
                htmlFor={htmlFor}
                className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormField;
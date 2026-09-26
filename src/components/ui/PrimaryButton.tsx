import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-sm',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#3ecf8e] hover:bg-[#4eda9a] text-[#171918] font-semibold transition-colors duration-200 cursor-pointer ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

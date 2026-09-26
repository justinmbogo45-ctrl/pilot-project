import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-sm',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#2b2e2c] bg-transparent hover:bg-[#222522] text-[#f1f3f2] font-medium transition-colors duration-200 cursor-pointer ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

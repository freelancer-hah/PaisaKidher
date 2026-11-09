'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { getBankPreset } from '@/lib/bankPresets';

interface BankLogoProps {
  bankKey?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankKey, size = 'md', className = '' }) => {
  const preset = getBankPreset(bankKey);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  }[size];

  const imgPath = `/banks/${preset.id}.png`;

  if (imgError) {
    return (
      <div
        className={`${sizeClasses} bg-slate-800 text-slate-200 flex items-center justify-center font-bold border border-slate-600/40 shadow-xs select-none shrink-0 ${className}`}
        title={preset.name}
      >
        <Building2 className={iconSizes} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} overflow-hidden shadow-xs shrink-0 select-none flex items-center justify-center bg-slate-100 ${className}`}
      title={preset.name}
    >
      <img
        src={imgPath}
        alt={preset.name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

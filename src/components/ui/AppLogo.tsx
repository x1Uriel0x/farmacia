'use client';

import React, { memo, useMemo } from 'react';
import { Cross } from 'lucide-react';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  src,
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {src ? (
        <AppImage
          src={src}
          alt="Logo" 
          width={size}
          height={size}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith('.svg')}
        />
      ) : (
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          style={{ width: size, height: size }}
          aria-label="Logo de farmacia"
        >
          <Cross size={Math.round(size * 0.58)} strokeWidth={2.6} />
        </div>
      )}
    </div>
  );
});

export default AppLogo;

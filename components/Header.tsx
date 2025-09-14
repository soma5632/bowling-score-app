
import React from 'react';
import { BowlingPinIcon } from './icons/BowlingPinIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
  return (
    <header className="bg-brand-surface p-4 shadow-md sticky top-0 z-10 flex items-center justify-between">
      <div className="w-10">
        {showBackButton && (
          <button
            onClick={onBack}
            className="text-brand-text-secondary hover:text-brand-text transition-colors p-2 -ml-2 rounded-full"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <BowlingPinIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-xl font-bold text-brand-text tracking-tight">
          AI Bowling Coach
        </h1>
      </div>
      <div className="w-10" />
    </header>
  );
};

export default Header;


import React from 'react';
import { Game } from '../types';
import { BowlingPinIcon } from './icons/BowlingPinIcon';

interface GameListItemProps {
  game: Game;
  onSelect: () => void;
  onDelete: () => void;
}

const GameListItem: React.FC<GameListItemProps> = ({ game, onSelect, onDelete }) => {
  const formattedDate = new Date(game.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <li
      onClick={onSelect}
      className="bg-brand-surface p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="bg-brand-bg p-3 rounded-full">
            <BowlingPinIcon className="w-6 h-6 text-brand-secondary" />
        </div>
        <div>
          <p className="font-bold text-brand-text">{formattedDate}</p>
          <p className="text-sm text-white">合計スコア: <span className="font-semibold text-white">{game.totalScore}</span></p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="text-white hover:text-red-500 transition-colors p-2 rounded-full text-xs"
        aria-label="Delete game"
      >
        消去
      </button>
    </li>
  );
};

export default GameListItem;

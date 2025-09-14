
import React from 'react';
import { Game } from '../types';
import GameListItem from './GameListItem';

interface GameListProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
  onStartNewGame: () => void;
  onDeleteGame: (gameId: string) => void;
}

const GameList: React.FC<GameListProps> = ({ games, onSelectGame, onStartNewGame, onDeleteGame }) => {
  const sortedGames = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="space-y-6">
      <button
        onClick={onStartNewGame}
        className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200 text-lg"
      >
        + Start New Game
      </button>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-brand-text">Game History</h2>
        {sortedGames.length > 0 ? (
          <ul className="space-y-3">
            {sortedGames.map(game => (
              <GameListItem 
                key={game.id} 
                game={game} 
                onSelect={() => onSelectGame(game.id)}
                onDelete={() => onDeleteGame(game.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 px-4 bg-brand-surface rounded-lg">
            <p className="text-brand-text-secondary">No games recorded yet.</p>
            <p className="text-brand-text-secondary">Start a new game to begin!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameList;

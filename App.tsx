
import React, { useState, useEffect } from 'react';
import { Game } from './types';
import Header from './components/Header';
import GameList from './components/GameList';
import Scorecard from './components/Scorecard';
import { calculateTotalScore } from './utils/scoring';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [games, setGames] = useLocalStorage<Game[]>('bowling-games', []);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const startNewGame = () => {
    const newGame: Game = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      frames: Array(10).fill({ rolls: [], score: null }),
      totalScore: 0,
      videoFrames: {},
    };
    setGames(prevGames => [...prevGames, newGame]);
    setActiveGameId(newGame.id);
  };

  const updateGame = (updatedGame: Game) => {
    updatedGame.totalScore = calculateTotalScore(updatedGame.frames);
    setGames(prevGames =>
      prevGames.map(game => (game.id === updatedGame.id ? updatedGame : game))
    );
  };
  
  const deleteGame = (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      setGames(prevGames => prevGames.filter(game => game.id !== gameId));
      if (activeGameId === gameId) {
        setActiveGameId(null);
      }
    }
  };

  const activeGame = games.find(game => game.id === activeGameId);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header
        showBackButton={!!activeGame}
        onBack={() => setActiveGameId(null)}
      />
      <main className="p-4 pb-20 max-w-4xl mx-auto">
        {activeGame ? (
          <Scorecard game={activeGame} onUpdateGame={updateGame} />
        ) : (
          <GameList 
            games={games} 
            onSelectGame={setActiveGameId} 
            onStartNewGame={startNewGame}
            onDeleteGame={deleteGame}
          />
        )}
      </main>
    </div>
  );
};

export default App;

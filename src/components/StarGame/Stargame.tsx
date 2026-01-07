import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState, PlayerUpgrades } from './types';
import { soundManager } from './utils/audio';

export default function stargame() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [fragments, setFragments] = useState(0); 
  const [hp, setHp] = useState(3);
  const [maxHp, setMaxHp] = useState(3);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0); // Force component remount for reset
  
  // Upgrade Logic
  const [isPaused, setIsPaused] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [upgrades, setUpgrades] = useState<PlayerUpgrades>({
    fireRate: 0,
    damage: 0,
    homing: 0
  });

  const startGame = () => {
    soundManager.init();
    
    // Reset all game stats
    setScore(0);
    setFragments(0);
    setHp(3);
    setMaxHp(3);
    setBossHp(null);
    setUpgrades({ fireRate: 0, damage: 0, homing: 0 });
    setIsPaused(false);
    setShowArmory(false);
    
    // Force GameCanvas reset
    setGameKey(prev => prev + 1);
    
    setGameState(GameState.PLAYING);
  };

  const getRankName = (frags: number) => {
    if (frags >= 80) return "ORIGIN ALPHA";
    if (frags >= 50) return "BETA";
    if (frags >= 25) return "GAMMA";
    if (frags >= 10) return "DELTA";
    return "EPSILON";
  };

  // Toggle Armory
  const toggleArmory = () => {
    if (gameState !== GameState.PLAYING) return;
    const newState = !isPaused;
    setIsPaused(newState);
    setShowArmory(newState);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleArmory();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, isPaused]);

  // Upgrade Costs
  const getCost = (level: number) => 10 + (level * 5);

  const buyUpgrade = (type: keyof PlayerUpgrades) => {
    const currentLvl = upgrades[type];
    const cost = getCost(currentLvl);

    if (fragments >= cost) {
      if (type === 'fireRate' && currentLvl >= 5) return; // Max Lvl
      if (type === 'homing' && currentLvl >= 5) return; // Max Lvl
      
      setFragments(prev => prev - cost);
      setUpgrades(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
      soundManager.playPowerUp();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden relative font-orbitron">
      
      <GameCanvas 
        key={gameKey}
        gameState={gameState} 
        setGameState={setGameState}
        setScore={setScore}
        setFragments={setFragments}
        setHp={setHp}
        setMaxHp={setMaxHp}
        setBossHp={setBossHp}
        isPaused={isPaused}
        upgrades={upgrades}
        currentFragments={fragments}
      />

      {/* HUD */}
      {gameState === GameState.PLAYING && (
        <>
          <div className="absolute top-4 left-0 w-full px-10 pointer-events-none flex justify-between items-start text-cyan-400 z-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">SCORE: {score.toLocaleString()}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm">HULL:</span>
                <div className="flex gap-1">
                   {[...Array(maxHp)].map((_, i) => (
                     <div key={i} className={`w-8 h-4 skew-x-12 border ${i < hp ? 'bg-green-500 border-green-300 shadow-[0_0_10px_lime]' : 'bg-transparent border-gray-600'}`} />
                   ))}
                </div>
              </div>
            </div>

            {/* Armory Button */}
            <div className="pointer-events-auto">
              <button 
                onClick={toggleArmory}
                className="px-4 py-2 border border-cyan-500 bg-cyan-900/50 hover:bg-cyan-500 hover:text-black transition-all text-sm tracking-widest"
              >
                {isPaused ? 'CLOSE ARMORY' : 'OPEN ARMORY [ESC]'}
              </button>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-bold text-yellow-400 drop-shadow-md">{getRankName(fragments)}</h2>
              <div className="text-sm text-cyan-200">CORE FRAGMENTS: {fragments}</div>
              <div className="w-48 h-2 bg-gray-800 mt-1 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-400" style={{width: `${(fragments % 25) * 4}%`}}></div>
              </div>
            </div>
          </div>

          {/* Boss HP Bar */}
          {bossHp !== null && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1/2 z-10 pointer-events-none">
                <div className="text-center text-red-500 font-bold mb-1">VOID MONARCH</div>
                <div className="w-full h-6 bg-red-900 border-2 border-red-500">
                   <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${(bossHp / 200) * 100}%` }}></div>
                </div>
             </div>
          )}
        </>
      )}

      {/* Armory Overlay */}
      {showArmory && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-cyan-500 p-8 w-[600px] shadow-[0_0_50px_rgba(0,255,255,0.2)]">
            <h2 className="text-3xl text-cyan-400 font-bold mb-2 tracking-widest text-center">ARMORY</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">SPEND FRAGMENTS TO UPGRADE (REDUCES EVOLUTION)</p>
            
            <div className="flex justify-between items-center bg-gray-800 p-4 mb-6 rounded border border-gray-700">
              <span className="text-cyan-200">AVAILABLE FRAGMENTS</span>
              <span className="text-2xl font-bold text-yellow-400">{fragments}</span>
            </div>

            <div className="space-y-4">
              {/* Fire Rate */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                <div>
                  <h3 className="text-cyan-300 font-bold">HYPER RELOADER</h3>
                  <p className="text-xs text-gray-400">Increases fire rate. Lv {upgrades.fireRate}/5</p>
                </div>
                <button 
                  onClick={() => buyUpgrade('fireRate')}
                  disabled={fragments < getCost(upgrades.fireRate) || upgrades.fireRate >= 5}
                  className="px-4 py-2 bg-cyan-900 border border-cyan-500 text-cyan-200 hover:bg-cyan-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {upgrades.fireRate >= 5 ? 'MAX' : `UPGRADE (${getCost(upgrades.fireRate)})`}
                </button>
              </div>

              {/* Damage */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                <div>
                  <h3 className="text-red-300 font-bold">CORE OVERCHARGE</h3>
                  <p className="text-xs text-gray-400">Increases damage by 25%. Lv {upgrades.damage}</p>
                </div>
                <button 
                  onClick={() => buyUpgrade('damage')}
                  disabled={fragments < getCost(upgrades.damage)}
                  className="px-4 py-2 bg-red-900/50 border border-red-500 text-red-200 hover:bg-red-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  UPGRADE ({getCost(upgrades.damage)})
                </button>
              </div>

              {/* Homing */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                <div>
                  <h3 className="text-purple-300 font-bold">NEURAL LINK</h3>
                  <p className="text-xs text-gray-400">Improves missile tracking. Lv {upgrades.homing}/5</p>
                </div>
                <button 
                  onClick={() => buyUpgrade('homing')}
                  disabled={fragments < getCost(upgrades.homing) || upgrades.homing >= 5}
                  className="px-4 py-2 bg-purple-900/50 border border-purple-500 text-purple-200 hover:bg-purple-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                   {upgrades.homing >= 5 ? 'MAX' : `UPGRADE (${getCost(upgrades.homing)})`}
                </button>
              </div>
            </div>

            <button 
              onClick={toggleArmory}
              className="w-full mt-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all"
            >
              RESUME MISSION
            </button>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 mb-2 drop-shadow-[0_0_30px_cyan]">
            STAR-FORGE
          </h1>
          <h2 className="text-2xl text-cyan-100 tracking-[0.5em] mb-8">THE ORIGIN ALPHA</h2>
          <p className="text-gray-400 mb-8 text-center max-w-lg leading-relaxed">
            Collect <span className="text-cyan-300">Core Fragments</span> from fallen enemies.<br/>
            Evolve from Epsilon to Origin Alpha.<br/>
            Destroy the Void Monarch.
          </p>
          <button 
            onClick={startGame}
            className="px-10 py-4 border-2 border-cyan-500 text-cyan-400 font-bold text-xl hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_40px_cyan] transition-all duration-300"
          >
            INITIATE LAUNCH
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-black text-red-500 mb-4 drop-shadow-[0_0_30px_red]">CORE CRITICAL</h1>
          <h2 className="text-2xl text-red-200 mb-8 tracking-widest">REBOOT REQUIRED</h2>
          <div className="text-center mb-8">
             <p className="text-gray-400">FINAL SCORE: <span className="text-white">{score.toLocaleString()}</span></p>
             <p className="text-gray-400">RANK: <span className="text-yellow-400">{getRankName(fragments)}</span></p>
          </div>
          <button 
            onClick={startGame}
            className="px-10 py-4 border-2 border-red-500 text-red-500 font-bold text-xl hover:bg-red-500 hover:text-white hover:shadow-[0_0_40px_red] transition-all"
          >
            SYSTEM REBOOT
          </button>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 bg-cyan-950/90 flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-black text-yellow-400 mb-4 drop-shadow-[0_0_50px_gold]">SYSTEM RECLAIMED</h1>
          <h2 className="text-3xl text-white mb-8 tracking-widest drop-shadow-md">ORIGIN ALPHA AWAKENED</h2>
          <div className="text-center mb-10 p-6 border border-cyan-500/30 bg-black/50 rounded-lg">
             <p className="text-cyan-200 text-xl mb-2">FINAL SCORE</p>
             <p className="text-4xl font-bold text-white mb-4">{score.toLocaleString()}</p>
             <p className="text-sm text-gray-400">THE VOID HAS BEEN PURGED</p>
          </div>
          <button 
            onClick={startGame}
            className="px-10 py-4 bg-yellow-500 text-black font-bold text-xl hover:bg-yellow-400 shadow-[0_0_30px_gold] transition-all transform hover:scale-105"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
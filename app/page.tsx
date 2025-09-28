"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

interface Fish {
  id: string;
  x: number;
  y: number;
  type: 'small' | 'medium' | 'large' | 'octopus';
  points: number;
  speed: number;
  direction: number;
  size: number;
  health?: number;
}

interface Hook {
  x: number;
  y: number;
  active: boolean;
  angle: number;
  depth: number;
  caughtFish: Fish | null;
  returning: boolean;
}

interface GameState {
  score: number;
  timeLeft: number;
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'victory';
  fisherman: {
    x: number;
    y: number;
    rodAngle: number;
    rodDirection: number;
  };
  hook: Hook;
  fish: Fish[];
  bubbles: Array<{ x: number; y: number; size: number; speed: number }>;
}

const FISH_TYPES = {
  small: { emoji: '🐟', points: 10, speed: 25, size: 1 },
  medium: { emoji: '🐠', points: 25, speed: 20, size: 1.5 },
  large: { emoji: '🦈', points: 50, speed: 15, size: 2 },
  octopus: { emoji: '🐙', points: 1000, speed: 10, size: 3, health: 100 }
};

export default function FishingGame() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    gameStatus: 'playing',
    fisherman: {
      x: 200, // Centrato
      y: 20,  // Sopra il livello del mare
      rodAngle: 0,
      rodDirection: 1
    },
    hook: {
      x: 200,
      y: 25,
      active: false,
      angle: 0,
      depth: 0,
      caughtFish: null,
      returning: false
    },
    fish: [
      { id: 'octopus1', x: 200, y: 200, type: 'octopus', points: 1000, speed: 10, direction: 1, size: 3, health: 100 },
      { id: 'fish1', x: 100, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1 },
      { id: 'fish2', x: 300, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5 },
      { id: 'fish3', x: 150, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2 },
      { id: 'fish4', x: 250, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1 },
      { id: 'fish5', x: 80, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5 }
    ],
    bubbles: []
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      const newState = { ...prev };
      
      // Update time
      newState.timeLeft = Math.max(0, prev.timeLeft - deltaTime);
      
      // Update fisherman rod oscillation
      newState.fisherman.rodAngle += prev.fisherman.rodDirection * 30 * deltaTime;
      if (newState.fisherman.rodAngle > 30) {
        newState.fisherman.rodDirection = -1;
      } else if (newState.fisherman.rodAngle < -30) {
        newState.fisherman.rodDirection = 1;
      }
      
      // Update fish movement - only horizontal
      newState.fish = prev.fish.map(fish => {
        const newFish = { ...fish };
        newFish.x += newFish.direction * newFish.speed * deltaTime;
        
        // Bounce off walls
        if (newFish.x > 380 || newFish.x < 20) {
          newFish.direction *= -1;
        }
        
        // Keep fish at their original Y position (no vertical movement)
        newFish.y = fish.y;
        
        return newFish;
      });
      
      // Update hook if active
      if (prev.hook.active) {
        if (!prev.hook.returning) {
          // Hook going down
          newState.hook.depth += 80 * deltaTime;
          newState.hook.y = 25 + newState.hook.depth;
          
          // Check collision with fish
          const hookX = newState.hook.x;
          const hookY = newState.hook.y;
          
          let fishCaught = false;
          newState.fish = newState.fish.filter(fish => {
            if (fishCaught) return true;
            
            const distance = Math.sqrt(
              Math.pow(hookX - fish.x, 2) + Math.pow(hookY - fish.y, 2)
            );
            
            if (distance < 25 + fish.size * 5) {
              // Fish caught!
              newState.hook.caughtFish = fish;
              newState.hook.returning = true;
              newState.score += fish.points;
              fishCaught = true;
              
              // Special handling for octopus
              if (fish.type === 'octopus') {
                if (fish.health && fish.health > 0) {
                  fish.health -= 20;
                  if (fish.health <= 0) {
                    newState.score += 500; // Bonus for defeating octopus
                    return false; // Remove octopus
                  }
                  return true; // Keep octopus with reduced health
                }
              }
              
              return false; // Remove caught fish
            }
            return true; // Keep fish
          });
          
          // Reset hook if too deep
          if (newState.hook.depth > 350) {
            newState.hook.returning = true;
          }
        } else {
          // Hook returning up
          newState.hook.depth -= 100 * deltaTime;
          newState.hook.y = 25 + newState.hook.depth;
          
          // Check if hook returned
          if (newState.hook.depth <= 0) {
            newState.hook.active = false;
            newState.hook.depth = 0;
            newState.hook.y = 25;
            newState.hook.returning = false;
            newState.hook.caughtFish = null;
          }
        }
      }
      
      // Add new fish occasionally
      if (Math.random() < 0.02) {
        const fishTypes = ['small', 'medium', 'large'] as const;
        const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const fishConfig = FISH_TYPES[randomType];
        
        // Fixed Y positions for different fish lanes
        const fishLanes = [120, 150, 180, 220, 250, 280];
        const randomLane = fishLanes[Math.floor(Math.random() * fishLanes.length)];
        
        newState.fish.push({
          id: `fish_${Date.now()}`,
          x: Math.random() > 0.5 ? 0 : 400,
          y: randomLane,
          type: randomType,
          points: fishConfig.points,
          speed: fishConfig.speed,
          direction: Math.random() > 0.5 ? 1 : -1,
          size: fishConfig.size
        });
      }
      
      // Add bubbles
      if (Math.random() < 0.1) {
        newState.bubbles.push({
          x: Math.random() * 400,
          y: 400,
          size: Math.random() * 10 + 5,
          speed: Math.random() * 30 + 20
        });
      }
      
      // Update bubbles
      newState.bubbles = newState.bubbles
        .map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed * deltaTime
        }))
        .filter(bubble => bubble.y > -20);
      
      // Check win/lose conditions
      if (newState.timeLeft <= 0) {
        newState.gameStatus = 'gameOver';
      }
      
      // Check if octopus is defeated
      const octopus = newState.fish.find(fish => fish.type === 'octopus');
      if (!octopus) {
        newState.gameStatus = 'victory';
        newState.score += 2000; // Final victory bonus
      }
      
      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, gameLoop]);

  const castHook = () => {
    if (gameState.gameStatus !== 'playing' || gameState.hook.active) return;
    
    setGameState(prev => ({
      ...prev,
      hook: {
        ...prev.hook,
        active: true,
        depth: 0,
        angle: prev.fisherman.rodAngle,
        caughtFish: null,
        returning: false
      }
    }));
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      timeLeft: 60,
      gameStatus: 'playing',
      fisherman: {
        x: 200,
        y: 20,
        rodAngle: 0,
        rodDirection: 1
      },
      hook: {
        x: 200,
        y: 25,
        active: false,
        angle: 0,
        depth: 0,
        caughtFish: null,
        returning: false
      },
      fish: [
        { id: 'octopus1', x: 200, y: 200, type: 'octopus', points: 1000, speed: 10, direction: 1, size: 3, health: 100 },
        { id: 'fish1', x: 100, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1 },
        { id: 'fish2', x: 300, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5 },
        { id: 'fish3', x: 150, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2 },
        { id: 'fish4', x: 250, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1 },
        { id: 'fish5', x: 80, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5 }
      ],
      bubbles: []
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      castHook();
    }
  };

  const getFishEmoji = (type: string) => {
    return FISH_TYPES[type as keyof typeof FISH_TYPES]?.emoji || '🐟';
  };

  return (
    <div className={styles.gameContainer} onKeyDown={handleKeyPress} tabIndex={0}>
      <div className={styles.gameHeader}>
        <h1>🏴‍☠️ Pirate vs Octopus 🐙</h1>
        <div className={styles.gameStats}>
          <div>Score: {Math.floor(gameState.score)}</div>
          <div>Time: {Math.ceil(gameState.timeLeft)}s</div>
        </div>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.ocean}>
          {/* Bubbles */}
          {gameState.bubbles.map((bubble, index) => (
            <div
              key={index}
              className={styles.bubble}
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size
              }}
            />
          ))}
          
          {/* Pirate Ship */}
          <div 
            className={styles.boat}
            style={{ left: gameState.fisherman.x - 20, top: gameState.fisherman.y + 10 }}
          >
            ⛵
          </div>
          
          {/* Pirate */}
          <div 
            className={styles.fisherman}
            style={{ left: gameState.fisherman.x, top: gameState.fisherman.y }}
          >
            🏴‍☠️
          </div>
          
          {/* Fishing Rod */}
          <div 
            className={styles.fishingRod}
            style={{ 
              left: gameState.fisherman.x + 15, 
              top: gameState.fisherman.y + 5,
              transform: `rotate(${gameState.fisherman.rodAngle}deg)`
            }}
          >
            🎣
          </div>
          
          {/* Hook */}
          {gameState.hook.active && (
            <div 
              className={styles.hook}
              style={{ 
                left: gameState.hook.x, 
                top: gameState.hook.y,
                transform: `rotate(${gameState.hook.angle}deg)`
              }}
            >
              🪝
            </div>
          )}
          
          {/* Caught Fish */}
          {gameState.hook.caughtFish && (
            <div 
              className={styles.caughtFish}
              style={{ 
                left: gameState.hook.x, 
                top: gameState.hook.y - 10
              }}
            >
              {getFishEmoji(gameState.hook.caughtFish.type)}
            </div>
          )}
          
          {/* Fish */}
          {gameState.fish.map((fish) => (
            <div
              key={fish.id}
              className={`${styles.fish} ${styles[fish.type]}`}
              style={{
                left: fish.x,
                top: fish.y,
                fontSize: `${fish.size}rem`,
                transform: `scaleX(${fish.direction})`
              }}
            >
              {getFishEmoji(fish.type)}
              {fish.type === 'octopus' && fish.health && (
                <div className={styles.healthBar}>
                  <div 
                    className={styles.healthFill}
                    style={{ width: `${fish.health}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.gameControls}>
        <button 
          onClick={castHook}
          className={styles.castButton}
          disabled={gameState.gameStatus !== 'playing' || gameState.hook.active}
        >
          CAST HOOK! 🏴‍☠️
        </button>
        <p className={styles.instructions}>
          Press SPACE to cast your hook, pirate! Arrr! 🏴‍☠️
        </p>
      </div>

      {gameState.gameStatus === 'gameOver' && (
        <div className={styles.gameOverlay}>
          <h2>Game Over! 🐙</h2>
          <p>The octopus escaped, pirate! Better luck next time!</p>
          <p>Final Score: {Math.floor(gameState.score)}</p>
          <button onClick={resetGame} className={styles.playAgainButton}>
            Sail Again! 🏴‍☠️
          </button>
        </div>
      )}

      {gameState.gameStatus === 'victory' && (
        <div className={styles.gameOverlay}>
          <h2>Victory! 🏆</h2>
          <p>Arrr! You defeated the legendary octopus, pirate!</p>
          <p>Final Score: {Math.floor(gameState.score)}</p>
          <button onClick={resetGame} className={styles.playAgainButton}>
            Sail Again! 🏴‍☠️
          </button>
        </div>
      )}
    </div>
  );
}
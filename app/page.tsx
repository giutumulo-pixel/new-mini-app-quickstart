"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

interface Fish {
  id: string;
  x: number;
  y: number;
  type: 'small' | 'medium' | 'large' | 'octopus' | 'kraken' | 'seaSerpent' | 'kingOctopus' | 'giantSquid' | 'seaDragon';
  points: number;
  speed: number;
  direction: number;
  size: number;
  health?: number;
  isMonster?: boolean;
  color?: string;
  name?: string;
  swimPhase?: number;
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
    rodVibration?: number;
  };
  hook: Hook;
  fish: Fish[];
  bubbles: Array<{ x: number; y: number; size: number; speed: number }>;
}

const FISH_TYPES = {
  small: { emoji: '🐟', points: 10, speed: 25, size: 1, color: '#FF6B6B', name: 'Red Fish' },
  medium: { emoji: '🐠', points: 25, speed: 20, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish' },
  large: { emoji: '🦈', points: 50, speed: 15, size: 2, color: '#95A5A6', name: 'Shark' },
  octopus: { emoji: '🐙', points: 1000, speed: 10, size: 3, health: 100, color: '#8E44AD', name: 'Octopus' }
};

const MONSTER_TYPES = {
  kraken: { emoji: '🦑', points: 500, speed: 8, size: 2.5, health: 50, color: '#2C3E50', name: 'Kraken' },
  seaSerpent: { emoji: '🐉', points: 500, speed: 12, size: 2, health: 30, color: '#27AE60', name: 'Sea Serpent' },
  kingOctopus: { emoji: '👑🐙', points: 500, speed: 6, size: 3.5, health: 100, color: '#E74C3C', name: 'King Octopus' },
  giantSquid: { emoji: '🦑', points: 500, speed: 10, size: 3, health: 80, color: '#8E44AD', name: 'Giant Squid' },
  seaDragon: { emoji: '🐲', points: 500, speed: 7, size: 2.8, health: 60, color: '#F39C12', name: 'Sea Dragon' }
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
      rodDirection: 1,
      rodVibration: 0
    },
    hook: {
      x: 205, // Aligned with fisherman position
      y: 25,
      active: false,
      angle: 0,
      depth: 0,
      caughtFish: null,
      returning: false
    },
    fish: [
      // Lane 1: Small fish going right (y: 120) - speed: 25
      { id: 'fish1', x: -50, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 0 },
      { id: 'fish2', x: -120, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 1.5 },
      
      // Lane 2: Medium fish going left (y: 150) - speed: 20
      { id: 'fish3', x: 450, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 0.8 },
      { id: 'fish4', x: 520, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 2.3 },
      
      // Lane 3: Large fish going right (y: 180) - speed: 15
      { id: 'fish5', x: -50, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2, color: '#95A5A6', name: 'Shark', swimPhase: 1.2 },
      { id: 'fish6', x: -120, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2, color: '#95A5A6', name: 'Shark', swimPhase: 3.1 },
      
      // Lane 4: Small fish going left (y: 220) - speed: 25
      { id: 'fish7', x: 450, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 0.5 },
      { id: 'fish8', x: 520, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 2.8 },
      
      // Lane 5: Medium fish going right (y: 250) - speed: 20
      { id: 'fish9', x: -50, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 1.8 },
      { id: 'fish10', x: -120, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 0.3 },
      
      // Abyssal Lane 6: Octopus and sea monsters going left (y: 300) - speed: varies
      { id: 'octopus1', x: 450, y: 300, type: 'octopus', points: 1000, speed: 8, direction: -1, size: 3, health: 100, color: '#8E44AD', name: 'Octopus', swimPhase: 0 },
      { id: 'kraken1', x: 520, y: 300, type: 'kraken', points: 500, speed: 8, direction: -1, size: 2.5, health: 50, isMonster: true, color: '#2C3E50', name: 'Kraken', swimPhase: 1.5 },
      { id: 'seaSerpent1', x: 580, y: 300, type: 'seaSerpent', points: 500, speed: 12, direction: -1, size: 2, health: 30, isMonster: true, color: '#27AE60', name: 'Sea Serpent', swimPhase: 2.1 },
      { id: 'kingOctopus1', x: 400, y: 300, type: 'kingOctopus', points: 500, speed: 6, direction: -1, size: 3.5, health: 100, isMonster: true, color: '#E74C3C', name: 'King Octopus', swimPhase: 0.7 }
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

    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.016); // Cap at 60fps
    lastTimeRef.current = currentTime;
    
    // Skip frame if deltaTime is too small to prevent stuttering
    if (deltaTime < 0.0001) return;

    setGameState(prev => {
      const newState = { ...prev };
      
      // Update time
      newState.timeLeft = Math.max(0, prev.timeLeft - deltaTime);
      
      // Update fisherman rod oscillation - smoother and more realistic
      const rodSpeed = 25 * deltaTime; // Slightly slower for more realistic movement
      const rodAmplitude = 35; // Slightly larger range for better visibility
      
      newState.fisherman.rodAngle += prev.fisherman.rodDirection * rodSpeed;
      
      // Smooth direction change with easing
      if (newState.fisherman.rodAngle > rodAmplitude) {
        newState.fisherman.rodDirection = -1;
        newState.fisherman.rodAngle = rodAmplitude; // Prevent overshoot
      } else if (newState.fisherman.rodAngle < -rodAmplitude) {
        newState.fisherman.rodDirection = 1;
        newState.fisherman.rodAngle = -rodAmplitude; // Prevent overshoot
      }
      
      // Add subtle vibration when rod is at extremes
      const vibrationIntensity = Math.abs(newState.fisherman.rodAngle) / rodAmplitude;
      newState.fisherman.rodVibration = vibrationIntensity * 0.5;
      
      // Update fish movement - ultra-smooth horizontal movement
      newState.fish = prev.fish.filter(fish => {
        // Ultra-smooth movement calculation with interpolation
        const movement = fish.direction * fish.speed * deltaTime;
        const newX = fish.x + movement;
        
        // Remove fish that go off screen (no bouncing)
        if (newX > 450 || newX < -100) {
          return false; // Remove this fish
        }
        
        // Update fish position with smooth interpolation
        fish.x = newX;
        
        // Update swim phase for ultra-smooth swimming animation
        fish.swimPhase = (fish.swimPhase || 0) + deltaTime * 1.5;
        if (fish.swimPhase > Math.PI * 2) {
          fish.swimPhase = fish.swimPhase - Math.PI * 2;
        }
        
        return true; // Keep this fish
      });
      
      // Update hook if active - ultra-smooth movement
      if (prev.hook.active) {
        if (!prev.hook.returning) {
          // Hook going down - smooth acceleration
          const hookSpeed = 90 * deltaTime; // Faster for better responsiveness
          newState.hook.depth += hookSpeed;
          newState.hook.y = 25 + newState.hook.depth;
          
          // Keep hook perfectly aligned with fishing line end
          newState.hook.x = newState.fisherman.x + 5;
          
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
              
              // Special handling for octopus and sea monsters
              if (fish.type === 'octopus' || fish.isMonster) {
                if (fish.health && fish.health > 0) {
                  fish.health -= 20;
                  if (fish.health <= 0) {
                    // Bonus points for defeating monsters
                    if (fish.type === 'octopus') {
                    newState.score += 500; // Bonus for defeating octopus
                    } else if (fish.isMonster) {
                      newState.score += fish.points; // Full monster points
                    }
                    return false; // Remove monster
                  }
                  return true; // Keep monster with reduced health
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
          // Hook returning up - smooth deceleration
          const hookSpeed = 110 * deltaTime; // Faster return for better responsiveness
          newState.hook.depth -= hookSpeed;
          newState.hook.y = 25 + newState.hook.depth;
          
          // Keep hook perfectly aligned with fishing line end during return
          newState.hook.x = newState.fisherman.x + 5;
          
          // Check if hook returned
          if (newState.hook.depth <= 0) {
            newState.hook.active = false;
            newState.hook.depth = 0;
            newState.hook.y = 25;
            newState.hook.x = newState.fisherman.x + 5;
            newState.hook.returning = false;
            newState.hook.caughtFish = null;
          }
        }
      }
      
      // Add new fish to maintain continuous flow in 5 lanes with no overlap
      if (Math.random() < 0.03) {
        // 5 fixed lanes with alternating directions and fixed speeds
        const fishLanes = [
          { y: 120, direction: 1, startX: -50, type: 'small', speed: 25 },   // Lane 1: Right
          { y: 150, direction: -1, startX: 450, type: 'medium', speed: 20 },  // Lane 2: Left
          { y: 180, direction: 1, startX: -50, type: 'large', speed: 15 },   // Lane 3: Right
          { y: 220, direction: -1, startX: 450, type: 'small', speed: 25 },  // Lane 4: Left
          { y: 250, direction: 1, startX: -50, type: 'medium', speed: 20 }    // Lane 5: Right
        ];
        
        const randomLane = fishLanes[Math.floor(Math.random() * fishLanes.length)];
        const fishConfig = FISH_TYPES[randomLane.type as keyof typeof FISH_TYPES];
        
        // Check if there's enough space in this lane to avoid overlap
        const existingFishInLane = newState.fish.filter(fish => fish.y === randomLane.y);
        const minDistance = 80; // Minimum distance between fish
        
        let canSpawn = true;
        if (randomLane.direction === 1) {
          // Going right, check if any fish is too close to the left edge
          canSpawn = !existingFishInLane.some(fish => fish.x < randomLane.startX + minDistance);
        } else {
          // Going left, check if any fish is too close to the right edge
          canSpawn = !existingFishInLane.some(fish => fish.x > randomLane.startX - minDistance);
        }
        
        if (canSpawn) {
        newState.fish.push({
            id: `fish_${Date.now()}_${Math.random()}`,
            x: randomLane.startX,
            y: randomLane.y,
            type: randomLane.type as 'small' | 'medium' | 'large',
          points: fishConfig.points,
            speed: randomLane.speed, // Fixed speed for each lane
            direction: randomLane.direction,
            size: fishConfig.size,
            color: fishConfig.color,
            name: fishConfig.name,
            swimPhase: Math.random() * Math.PI * 2
          });
        }
      }
      
      // Add octopus and sea monsters to the abyssal lane (y: 300) - less frequent but more powerful
      if (Math.random() < 0.008) {
        const abyssalCreatures = ['octopus', 'kraken', 'seaSerpent', 'kingOctopus', 'giantSquid', 'seaDragon'] as const;
        const randomCreatureType = abyssalCreatures[Math.floor(Math.random() * abyssalCreatures.length)];
        
        let creatureConfig;
        let isMonster = false;
        
        if (randomCreatureType === 'octopus') {
          creatureConfig = FISH_TYPES.octopus;
        } else {
          creatureConfig = MONSTER_TYPES[randomCreatureType as keyof typeof MONSTER_TYPES];
          isMonster = true;
        }
        
        // Check if there's enough space in the abyssal lane
        const existingCreaturesInLane = newState.fish.filter(fish => fish.y === 300);
        const minAbyssalDistance = 120; // Larger distance for abyssal creatures
        
        let canSpawnCreature = true;
        canSpawnCreature = !existingCreaturesInLane.some(fish => fish.x > 450 - minAbyssalDistance);
        
        if (canSpawnCreature) {
          newState.fish.push({
            id: `abyssal_${Date.now()}_${Math.random()}`,
            x: 450,
            y: 300,
            type: randomCreatureType,
            points: creatureConfig.points,
            speed: creatureConfig.speed,
            direction: -1, // All abyssal creatures go left
            size: creatureConfig.size,
            health: creatureConfig.health,
            isMonster: isMonster,
            color: creatureConfig.color,
            name: creatureConfig.name,
            swimPhase: Math.random() * Math.PI * 2
          });
        }
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
      
      // Check if player reached 5000 points (victory condition)
      if (newState.score >= 5000) {
        newState.gameStatus = 'victory';
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
        x: prev.fisherman.x + 5, // Start exactly at fishing line position
        y: prev.fisherman.y + 5, // Start exactly at fishing line position
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
        rodDirection: 1,
        rodVibration: 0
      },
      hook: {
        x: 205, // Aligned with fisherman position
        y: 25,
        active: false,
        angle: 0,
        depth: 0,
        caughtFish: null,
        returning: false
      },
      fish: [
        // Lane 1: Small fish going right (y: 120) - speed: 25
        { id: 'fish1', x: -50, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 0 },
        { id: 'fish2', x: -120, y: 120, type: 'small', points: 10, speed: 25, direction: 1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 1.5 },
        
        // Lane 2: Medium fish going left (y: 150) - speed: 20
        { id: 'fish3', x: 450, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 0.8 },
        { id: 'fish4', x: 520, y: 150, type: 'medium', points: 25, speed: 20, direction: -1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 2.3 },
        
        // Lane 3: Large fish going right (y: 180) - speed: 15
        { id: 'fish5', x: -50, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2, color: '#95A5A6', name: 'Shark', swimPhase: 1.2 },
        { id: 'fish6', x: -120, y: 180, type: 'large', points: 50, speed: 15, direction: 1, size: 2, color: '#95A5A6', name: 'Shark', swimPhase: 3.1 },
        
        // Lane 4: Small fish going left (y: 220) - speed: 25
        { id: 'fish7', x: 450, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 0.5 },
        { id: 'fish8', x: 520, y: 220, type: 'small', points: 10, speed: 25, direction: -1, size: 1, color: '#FF6B6B', name: 'Red Fish', swimPhase: 2.8 },
        
        // Lane 5: Medium fish going right (y: 250) - speed: 20
        { id: 'fish9', x: -50, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 1.8 },
        { id: 'fish10', x: -120, y: 250, type: 'medium', points: 25, speed: 20, direction: 1, size: 1.5, color: '#4ECDC4', name: 'Tropical Fish', swimPhase: 0.3 },
        
        // Abyssal Lane 6: Octopus and sea monsters going left (y: 300) - speed: varies
        { id: 'octopus1', x: 450, y: 300, type: 'octopus', points: 1000, speed: 8, direction: -1, size: 3, health: 100, color: '#8E44AD', name: 'Octopus', swimPhase: 0 },
        { id: 'kraken1', x: 520, y: 300, type: 'kraken', points: 500, speed: 8, direction: -1, size: 2.5, health: 50, isMonster: true, color: '#2C3E50', name: 'Kraken', swimPhase: 1.5 },
        { id: 'seaSerpent1', x: 580, y: 300, type: 'seaSerpent', points: 500, speed: 12, direction: -1, size: 2, health: 30, isMonster: true, color: '#27AE60', name: 'Sea Serpent', swimPhase: 2.1 },
        { id: 'kingOctopus1', x: 400, y: 300, type: 'kingOctopus', points: 500, speed: 6, direction: -1, size: 3.5, health: 100, isMonster: true, color: '#E74C3C', name: 'King Octopus', swimPhase: 0.7 }
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
    const fishEmoji = FISH_TYPES[type as keyof typeof FISH_TYPES]?.emoji;
    const monsterEmoji = MONSTER_TYPES[type as keyof typeof MONSTER_TYPES]?.emoji;
    return fishEmoji || monsterEmoji || '🐟';
  };

  return (
    <div className={styles.gameContainer} onKeyDown={handleKeyPress} tabIndex={0}>
      <div className={styles.gameHeader}>
        <h1>🏴‍☠️ Pirate vs Octopus 🐙</h1>
        <div className={styles.gameStats}>
          <div>Score: {Math.floor(gameState.score)} / 5000</div>
          <div>Time: {Math.ceil(gameState.timeLeft)}s</div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${Math.min((gameState.score / 5000) * 100, 100)}%` }}
            />
          </div>
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
          
          {/* Pirate Ship Hull */}
          <div 
            className={styles.shipHull}
            style={{ 
              left: gameState.fisherman.x - 30, 
              top: gameState.fisherman.y + 15
            }}
          >
            🚢
          </div>
          
          {/* Ship Mast */}
          <div 
            className={styles.shipMast}
            style={{ 
              left: gameState.fisherman.x - 5, 
              top: gameState.fisherman.y - 5
            }}
          >
            |
          </div>
          
          {/* Pirate Flag on Mast */}
          <div 
            className={styles.pirateFlag}
            style={{ 
              left: gameState.fisherman.x - 5, 
              top: gameState.fisherman.y - 15
            }}
          >
            🏴‍☠️
          </div>
          
          {/* Pirate on Ship */}
          <div 
            className={styles.fisherman}
            style={{ 
              left: gameState.fisherman.x - 10, 
              top: gameState.fisherman.y + 10,
              fontSize: '1.1rem'
            }}
          >
            🧑‍🌾
          </div>
          
          {/* Fishing Rod */}
          <div 
            className={styles.fishingRod}
            style={{ 
              left: gameState.fisherman.x + 5, 
              top: gameState.fisherman.y + 5,
              transform: `rotate(${gameState.fisherman.rodAngle}deg) translateX(${gameState.fisherman.rodVibration || 0}px)`,
              filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) ${gameState.fisherman.rodVibration ? 'blur(0.5px)' : ''}`
            }}
          >
            🎣
          </div>
          
          {/* Fishing Line */}
          {gameState.hook.active && (
            <div 
              className={styles.fishingLine}
              style={{
                position: 'absolute',
                left: gameState.fisherman.x + 5,
                top: gameState.fisherman.y + 5,
                width: '1px',
                height: `${Math.sqrt(
                  Math.pow(gameState.hook.x - (gameState.fisherman.x + 5), 2) + 
                  Math.pow(gameState.hook.y - (gameState.fisherman.y + 5), 2)
                )}px`,
                backgroundColor: '#654321',
                transformOrigin: 'top center',
                transform: `rotate(${Math.atan2(
                  gameState.hook.x - (gameState.fisherman.x + 5),
                  gameState.hook.y - (gameState.fisherman.y + 5)
                ) * 180 / Math.PI}deg) translateX(${gameState.fisherman.rodVibration || 0}px)`,
                zIndex: 1,
                filter: gameState.fisherman.rodVibration ? 'blur(0.3px)' : ''
              }}
            />
          )}
          
          {/* Hook - Always at the end of the fishing line */}
          {gameState.hook.active && (
            <div 
              className={styles.hook}
              style={{ 
                left: gameState.hook.x - 5, 
                top: gameState.hook.y - 5,
                transform: `rotate(${gameState.hook.angle}deg) translateX(${gameState.fisherman.rodVibration || 0}px)`,
                zIndex: 2,
                filter: gameState.fisherman.rodVibration ? 'blur(0.2px)' : ''
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
                top: fish.y + (fish.swimPhase ? Math.sin(fish.swimPhase) * 1.2 : 0),
                fontSize: `${fish.size}rem`,
                transform: `scaleX(${fish.direction}) translateY(${fish.swimPhase ? Math.sin(fish.swimPhase * 1.2) * 0.6 : 0}px)`,
                filter: `drop-shadow(0 0 3px ${fish.color || '#000'})`,
                willChange: 'transform, left, top',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            >
              <span style={{ 
                color: fish.color,
                textShadow: `0 0 5px ${fish.color}40`,
                display: 'inline-block',
                willChange: 'transform'
              }}>
                {getFishEmoji(fish.type)}
              </span>
              {(fish.type === 'octopus' || fish.isMonster) && fish.health && (
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
          Press SPACE to cast your hook, pirate! Arrr! 🏴‍☠️<br/>
          <strong>Goal: Reach 5000 points in 60 seconds!</strong><br/>
          Small fish: 10 pts | Medium fish: 25 pts | Large fish: 50 pts | Monsters: 500 pts
        </p>
      </div>

      {gameState.gameStatus === 'gameOver' && (
        <div className={styles.gameOverlay}>
          <h2>Time's Up! ⏰</h2>
          <p>You didn't reach 5000 points in time, pirate!</p>
          <p>Final Score: {Math.floor(gameState.score)} / 5000</p>
          <p>You needed {5000 - Math.floor(gameState.score)} more points!</p>
          <button onClick={resetGame} className={styles.playAgainButton}>
            Sail Again! 🏴‍☠️
          </button>
        </div>
      )}

      {gameState.gameStatus === 'victory' && (
        <div className={styles.gameOverlay}>
          <h2>Victory! 🏆</h2>
          <p>Arrr! You reached 5000 points, legendary pirate!</p>
          <p>Final Score: {Math.floor(gameState.score)} / 5000</p>
          <p>Time Remaining: {Math.ceil(gameState.timeLeft)}s</p>
          <button onClick={resetGame} className={styles.playAgainButton}>
            Sail Again! 🏴‍☠️
          </button>
        </div>
      )}
    </div>
  );
}
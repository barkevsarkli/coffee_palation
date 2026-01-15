import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Audio } from '../utils/audioWeb';
import { COLORS, FONTS, SHADOWS } from '../styles/theme';
import {
  GRAVITY,
  JUMP_VELOCITY,
  TERMINAL_VELOCITY,
  CUP_SIZE,
  PIPE_WIDTH,
  BEAN_SIZE,
  DIFFICULTY,
  GROUND_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../utils/constants';
import { saveHighScore, isHighScore, getUsername, saveUsername } from '../utils/storage';
import { useSettings } from '../context/SettingsContext';
import CoffeeCup from '../components/CoffeeCup';
import Pipe from '../components/Pipe';
import CoffeeBean from '../components/CoffeeBean';
import GameOverModal from '../components/GameOverModal';

// ==================== CRITICAL FIXES ====================

// 1. MINIMUM PIPE SEPARATION - Prevents overlapping
const MIN_PIPE_SEPARATION = 220; // Increased from ~160 for easier gameplay

// 2. PIPE SPAWN TIMING - Fixed interval
const PIPE_SPAWN_INTERVAL = 2000; // milliseconds

// 3. BEAN SPAWN RATE - Always spawn (100%)
const BEAN_SPAWN_RATE = 1.0; // Changed from 0.3 to 1.0 (one bean per pipe)

const GameScreen = ({ onNavigate }) => {
  const { soundEnabled, difficulty } = useSettings();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [columnsPassed, setColumnsPassed] = useState(0); // Track columns for progressive scoring
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  // Player state
  const [cupY, setCupY] = useState(SCREEN_HEIGHT / 2 - 100);
  const [cupVelocity, setCupVelocity] = useState(0);
  const cupX = 80; // Fixed X position for the cup

  // Game objects
  const [pipes, setPipes] = useState([]);
  const [beans, setBeans] = useState([]);
  const [collectedBeans, setCollectedBeans] = useState(new Set()); // Track collected beans

  // Refs for game loop and sounds
  const gameLoopRef = useRef(null);
  const pipeSpawnTimerRef = useRef(null);
  const lastPipeXRef = useRef(0); // Track last pipe X position (start at 0 to allow first spawn)
  const jumpSoundRef = useRef(null);
  const collectSoundRef = useRef(null);
  const gameoverSoundRef = useRef(null);

  // Get difficulty settings
  const { gapSize, pipeSpeed } = DIFFICULTY[difficulty];

  // Load username on mount
  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    const savedUsername = await getUsername();
    if (savedUsername) {
      setUsername(savedUsername);
    }
  };

  // Load sounds on mount
  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (pipeSpawnTimerRef.current) {
        clearInterval(pipeSpawnTimerRef.current);
      }
    };
  }, []);

  // Start game loop when game starts
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      startGameLoop();
      startPipeSpawner();
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (pipeSpawnTimerRef.current) {
        clearInterval(pipeSpawnTimerRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (pipeSpawnTimerRef.current) {
        clearInterval(pipeSpawnTimerRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused]);

  const loadSounds = async () => {
    try {
      const { sound: jumpSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
        { shouldPlay: false }
      );
      jumpSoundRef.current = jumpSound;

      const { sound: collectSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
        { shouldPlay: false }
      );
      collectSoundRef.current = collectSound;

      const { sound: gameoverSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
        { shouldPlay: false }
      );
      gameoverSoundRef.current = gameoverSound;
    } catch (error) {
      console.log('Sound loading error (expected in development):', error);
    }
  };

  const unloadSounds = async () => {
    try {
      if (jumpSoundRef.current) await jumpSoundRef.current.unloadAsync();
      if (collectSoundRef.current) await collectSoundRef.current.unloadAsync();
      if (gameoverSoundRef.current) await gameoverSoundRef.current.unloadAsync();
    } catch (error) {
      console.log('Sound unloading error:', error);
    }
  };

  const playSound = async (soundRef) => {
    if (!soundEnabled || !soundRef.current) return;
    try {
      await soundRef.current.replayAsync();
    } catch (error) {
      // Silently fail
    }
  };

  const startGameLoop = () => {
    const loop = () => {
      updateGame();
      
      // ==================== FIX 3: COLLISION CHECK EVERY FRAME ====================
      // Check collisions after updating game state
      checkCollisionsAABB(cupY);
      
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const startPipeSpawner = () => {
    pipeSpawnTimerRef.current = setInterval(() => {
      spawnPipe();
    }, PIPE_SPAWN_INTERVAL);
  };

  // ==================== FIX 1: PROPER COLUMN GENERATION ====================
  const spawnPipe = () => {
    // Check if the rightmost pipe has moved far enough left
    if (pipes.length > 0) {
      const rightmostPipe = pipes[pipes.length - 1];
      const distanceFromSpawnPoint = SCREEN_WIDTH - rightmostPipe.x;
      
      // Don't spawn if the last pipe hasn't moved far enough
      if (distanceFromSpawnPoint < MIN_PIPE_SEPARATION) {
        return; // Too close, wait for more separation
      }
    }

    const minTopHeight = 80;
    const maxTopHeight = SCREEN_HEIGHT - GROUND_HEIGHT - gapSize - 80;
    const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;

    const newPipe = {
      id: Date.now() + Math.random(), // Ensure unique IDs
      x: SCREEN_WIDTH,
      width: PIPE_WIDTH,
      topHeight: topHeight,
      gapSize: gapSize,
      bottomHeight: SCREEN_HEIGHT - GROUND_HEIGHT - topHeight - gapSize,
      passed: false,
      scored: false, // Track if column was scored for progressive system
    };

    setPipes((prevPipes) => [...prevPipes, newPipe]);

    // ==================== FIX 2: PRECISE BEAN PLACEMENT ====================
    // ALWAYS spawn exactly one bean, centered in the gap
    const beanX = SCREEN_WIDTH + PIPE_WIDTH / 2 - BEAN_SIZE / 2;
    const beanY = topHeight + (gapSize / 2) - (BEAN_SIZE / 2); // Perfectly centered

    const newBean = {
      id: newPipe.id, // Use same ID as pipe for tracking
      x: beanX,
      y: beanY,
      pipeId: newPipe.id,
      pointValue: calculateBeanValue(columnsPassed), // Progressive value
    };
    
    setBeans((prevBeans) => [...prevBeans, newBean]);
  };

  // ==================== FIX 4: PROGRESSIVE SCORING SYSTEM ====================
  const calculateBeanValue = (columnsPassedCount) => {
    // Formula: Points = floor(ColumnsPassed / 10) + 1
    return Math.floor(columnsPassedCount / 10) + 1;
  };

  const updateGame = () => {
    // Update cup velocity
    setCupVelocity((v) => {
      const newVelocity = Math.min(v + GRAVITY, TERMINAL_VELOCITY);
      return newVelocity;
    });

    // Update cup position
    setCupY((y) => y + cupVelocity);

    // Update pipes position
    setPipes((prevPipes) => {
      const updatedPipes = prevPipes.map((pipe) => {
        const newX = pipe.x - pipeSpeed;
        
        // Track columns passed for progressive scoring
        if (!pipe.passed && newX + PIPE_WIDTH < cupX) {
          pipe.passed = true;
          setColumnsPassed((prev) => prev + 1);
        }

        return { ...pipe, x: newX };
      }).filter((pipe) => pipe.x > -PIPE_WIDTH); // Remove off-screen pipes

      return updatedPipes;
    });

    // Update beans position
    setBeans((prevBeans) => {
      return prevBeans
        .map((bean) => ({
          ...bean,
          x: bean.x - pipeSpeed,
        }))
        .filter((bean) => bean.x > -BEAN_SIZE && !collectedBeans.has(bean.id));
    });
  };

  // ==================== FIX 3: AABB COLLISION DETECTION ====================
  const checkCollisionsAABB = (currentCupY) => {
    // Skip collision check if game is over or paused
    if (gameOver || isPaused || !gameStarted) return;

    // Define cup hitbox (with slight reduction for fairness)
    const cupHitbox = {
      x: cupX + 5,
      y: currentCupY + 5,
      width: CUP_SIZE - 10,
      height: CUP_SIZE - 10,
    };

    // Check ground collision
    if (cupHitbox.y + cupHitbox.height >= SCREEN_HEIGHT - GROUND_HEIGHT) {
      endGame();
      return;
    }

    // Check ceiling collision
    if (cupHitbox.y <= 0) {
      endGame();
      return;
    }

    // Check pipe collisions (AABB)
    for (const pipe of pipes) {
      // Only check pipes that the cup is actually near
      if (pipe.x + PIPE_WIDTH < cupX - 10 || pipe.x > cupX + CUP_SIZE + 10) {
        continue; // Pipe is too far away
      }

      // Top pipe hitbox
      const topPipeHitbox = {
        x: pipe.x,
        y: 0,
        width: PIPE_WIDTH,
        height: pipe.topHeight,
      };

      // Bottom pipe hitbox  
      const bottomPipeHitbox = {
        x: pipe.x,
        y: pipe.topHeight + pipe.gapSize,
        width: PIPE_WIDTH,
        height: SCREEN_HEIGHT - GROUND_HEIGHT - (pipe.topHeight + pipe.gapSize),
      };

      // AABB collision check
      if (checkAABBCollision(cupHitbox, topPipeHitbox) || 
          checkAABBCollision(cupHitbox, bottomPipeHitbox)) {
        console.log('COLLISION DETECTED!'); // Debug log
        endGame();
        return;
      }
    }

    // Check bean collection (AABB)
    for (const bean of beans) {
      if (collectedBeans.has(bean.id)) continue;

      // Bean hitbox (slightly larger for easier collection)
      const beanHitbox = {
        x: bean.x - 5,
        y: bean.y - 5,
        width: BEAN_SIZE + 10,
        height: BEAN_SIZE + 10,
      };

      if (checkAABBCollision(cupHitbox, beanHitbox)) {
        collectBean(bean.id, bean.pointValue);
      }
    }
  };

  // AABB (Axis-Aligned Bounding Box) collision detection
  const checkAABBCollision = (box1, box2) => {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  };

  const collectBean = (beanId, pointValue) => {
    setCollectedBeans((prev) => new Set([...prev, beanId]));
    setScore((prevScore) => prevScore + pointValue);
    playSound(collectSoundRef);
  };

  const handleJump = () => {
    // Check if username is set before starting
    if (!gameStarted && !username) {
      setShowUsernameModal(true);
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
      return;
    }

    if (gameOver || isPaused) return;

    setCupVelocity(JUMP_VELOCITY);
    playSound(jumpSoundRef);
  };

  // Add keyboard support for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (event) => {
        if (event.code === 'Space' || event.key === ' ') {
          event.preventDefault();
          handleJump();
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [gameStarted, gameOver, isPaused, username]);

  const endGame = async () => {
    if (gameOver) return; // Prevent multiple calls
    
    console.log('Game Over! Final score:', score); // Debug log
    setGameOver(true);
    playSound(gameoverSoundRef);

    // Stop game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (pipeSpawnTimerRef.current) {
      clearInterval(pipeSpawnTimerRef.current);
    }

    // ==================== FIX 5: SAVE USERNAME WITH SCORE ====================
    const isHigh = await isHighScore(score);
    setIsNewHighScore(isHigh);

    // Save score with username
    await saveHighScore(score, username || 'Anonymous');
  };

  const restartGame = () => {
    // Stop any running loops
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (pipeSpawnTimerRef.current) {
      clearInterval(pipeSpawnTimerRef.current);
    }

    // Reset all game state
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setColumnsPassed(0);
    setIsNewHighScore(false);
    setCupY(SCREEN_HEIGHT / 2 - 100);
    setCupVelocity(0);
    setPipes([]);
    setBeans([]);
    setCollectedBeans(new Set());
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // ==================== FIX 5: USERNAME MODAL ====================
  const handleUsernameSubmit = async () => {
    if (tempUsername.trim()) {
      const savedName = tempUsername.trim();
      setUsername(savedName);
      await saveUsername(savedName);
      setShowUsernameModal(false);
      setTempUsername('');
      // Start game after username is set
      setGameStarted(true);
    }
  };

  const getBeanMultiplier = () => {
    return calculateBeanValue(columnsPassed);
  };

  return (
    <TouchableWithoutFeedback onPress={handleJump}>
      <View style={styles.container}>
        {/* Sky */}
        <View style={styles.sky}>
          {/* Score Display with Multiplier */}
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            {gameStarted && !gameOver && (
              <Text style={styles.multiplier}>x{getBeanMultiplier()}</Text>
            )}
          </View>

          {/* Username Display */}
          {username && gameStarted && (
            <Text style={styles.usernameDisplay}>{username}</Text>
          )}

          {/* Pause Button */}
          {gameStarted && !gameOver && (
            <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
              <Text style={styles.pauseText}>{isPaused ? '▶️' : '⏸️'}</Text>
            </TouchableOpacity>
          )}

          {/* Start instruction */}
          {!gameStarted && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>Tap to Start!</Text>
              <Text style={styles.instructionSubtext}>Collect all the beans 🫘</Text>
              <Text style={styles.instructionDetail}>Points increase every 10 pipes!</Text>
            </View>
          )}

          {/* Pause overlay */}
          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pausedText}>PAUSED</Text>
              <Text style={styles.pausedSubtext}>Tap to resume</Text>
            </View>
          )}

          {/* Coffee Cup */}
          <CoffeeCup x={cupX} y={cupY} velocity={cupVelocity} />

          {/* Pipes */}
          {pipes.map((pipe) => (
            <Pipe
              key={pipe.id}
              x={pipe.x}
              width={pipe.width}
              topHeight={pipe.topHeight}
              gapSize={pipe.gapSize}
            />
          ))}

          {/* Coffee Beans */}
          {beans.map((bean) => (
            !collectedBeans.has(bean.id) && (
              <View key={bean.id}>
                <CoffeeBean x={bean.x} y={bean.y} />
                {bean.pointValue > 1 && (
                  <Text style={[styles.beanValue, { left: bean.x + 8, top: bean.y - 20 }]}>
                    +{bean.pointValue}
                  </Text>
                )}
              </View>
            )
          ))}
        </View>

        {/* Ground */}
        <View style={styles.ground}>
          <Text style={styles.groundText}>☕ ☕ ☕ ☕ ☕ ☕ ☕ ☕</Text>
        </View>

        {/* Username Modal */}
        <Modal
          visible={showUsernameModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.usernameModal}>
              <Text style={styles.modalTitle}>Enter Your Name</Text>
              <Text style={styles.modalSubtext}>To track your high scores</Text>
              <TextInput
                style={styles.usernameInput}
                placeholder="Player Name"
                placeholderTextColor={COLORS.secondary}
                value={tempUsername}
                onChangeText={setTempUsername}
                maxLength={20}
                autoFocus
                onSubmitEditing={handleUsernameSubmit}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUsernameSubmit}
              >
                <Text style={styles.submitButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <GameOverModal
          visible={gameOver}
          score={score}
          isHighScore={isNewHighScore}
          onRestart={restartGame}
          onMainMenu={() => onNavigate('menu')}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sky: {
    flex: 1,
    backgroundColor: '#87CEEB',
    position: 'relative',
  },
  ground: {
    height: GROUND_HEIGHT,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundText: {
    fontSize: 24,
    opacity: 0.5,
  },
  scoreContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  score: {
    ...FONTS.score,
    fontSize: 42,
    color: COLORS.textLight,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  multiplier: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  usernameDisplay: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pauseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...SHADOWS.button,
  },
  pauseText: {
    fontSize: 24,
  },
  instructionContainer: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 25,
    borderRadius: 15,
    ...SHADOWS.card,
  },
  instructionText: {
    ...FONTS.subtitle,
    fontSize: 28,
    marginBottom: 10,
  },
  instructionSubtext: {
    ...FONTS.body,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 5,
  },
  instructionDetail: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  pausedText: {
    ...FONTS.title,
    fontSize: 48,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  pausedSubtext: {
    ...FONTS.body,
    fontSize: 20,
    color: COLORS.textLight,
  },
  beanValue: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameModal: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    ...SHADOWS.card,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 28,
    marginBottom: 10,
  },
  modalSubtext: {
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 20,
  },
  usernameInput: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: COLORS.success,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  submitButtonText: {
    ...FONTS.button,
    fontSize: 18,
  },
});

export default GameScreen;

/**
 * COFFEE PALATION - Flappy Bird Game
 * Version 5.0 - Deployment Ready
 * 
 * Fixed Issues:
 * - Score updates properly during gameplay
 * - Controls are responsive
 * - Physics are consistent with delta-time
 * - Collision detection is reliable
 * - Memory leaks prevented with proper cleanup
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== ASSETS ====================
const CharacterImage = require('./assets/character.png');
const BeanImage = require('./assets/bean.png');
const BackgroundImage = require('./assets/background.png');

// ==================== SCREEN SETUP ====================
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const MAX_GAME_WIDTH = 500;
const GAME_WIDTH = Math.min(WINDOW_WIDTH, MAX_GAME_WIDTH);
const GAME_HEIGHT = WINDOW_HEIGHT;

// Scale based on reference device (iPhone 11)
const BASE_WIDTH = 375;
const scale = Math.min(GAME_WIDTH / BASE_WIDTH, 1.3);

// ==================== GAME CONSTANTS ====================
const GRAVITY = 1200 * scale;
const JUMP_VELOCITY = -420 * scale;
const PIPE_SPEED = 180 * scale;
const PIPE_SPAWN_INTERVAL = 1800;

const BIRD_SIZE = Math.round(50 * scale);
const BIRD_X = GAME_WIDTH * 0.2;
const BIRD_HITBOX_SCALE = 0.65;

const PIPE_WIDTH = Math.round(60 * scale);
const PIPE_GAP = Math.round(160 * scale);
const BEAN_SIZE = Math.round(35 * scale);
const GROUND_HEIGHT = Math.round(80 * scale);

const STORAGE_KEY = '@coffee_palation_scores_v7';
const RESET_KEY = '@coffee_palation_last_reset';
const DAILY_RESET_HOUR = 11;
const DAILY_RESET_MINUTE = 30;

// ==================== STORAGE FUNCTIONS ====================

// Check if scores should be reset (daily at 11:30 AM)
async function checkAndResetScores() {
  try {
    const now = new Date();
    const todayResetTime = new Date(now);
    todayResetTime.setHours(DAILY_RESET_HOUR, DAILY_RESET_MINUTE, 0, 0);

    const lastResetJson = await AsyncStorage.getItem(RESET_KEY);
    const lastReset = lastResetJson ? new Date(JSON.parse(lastResetJson)) : null;

    // Only reset if:
    // 1. Current time is 11:30 AM or later, AND
    // 2. Either never reset before OR last reset was before today's 11:30 AM
    if (now >= todayResetTime) {
      const shouldReset = !lastReset || lastReset < todayResetTime;

      if (shouldReset) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.setItem(RESET_KEY, JSON.stringify(now.toISOString()));
        console.log('Leaderboard reset at', now.toLocaleString());
        return true;
      }
    } else if (!lastReset) {
      // First time running the app before 11:30 - just record timestamp, don't clear
      await AsyncStorage.setItem(RESET_KEY, JSON.stringify(now.toISOString()));
    }

    return false;
  } catch (e) {
    console.log('Error checking reset:', e);
    return false;
  }
}

async function getScores() {
  try {
    // Check for daily reset first
    await checkAndResetScores();

    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      const data = JSON.parse(json);
      return Array.isArray(data) ? data.filter(s => s.name && s.score > 0) : [];
    }
    return [];
  } catch (e) {
    console.log('Error loading scores:', e);
    return [];
  }
}

async function addScore(name, score) {
  if (!name || score < 1) return;
  try {
    const scores = await getScores();
    const trimmedName = name.trim().toLowerCase();

    // Find existing entry for this user
    const existingIndex = scores.findIndex(
      s => s.name.toLowerCase() === trimmedName
    );

    if (existingIndex >= 0) {
      // Only update if new score is higher
      if (score > scores[existingIndex].score) {
        scores[existingIndex] = {
          name: name.trim(),
          score,
          date: new Date().toISOString(),
        };
      }
    } else {
      // Add new user
      scores.push({
        name: name.trim(),
        score,
        date: new Date().toISOString(),
      });
    }

    // Sort by score descending and keep top 10
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
  } catch (e) {
    console.log('Error saving score:', e);
  }
}

// ==================== COLLISION DETECTION ====================
function checkCollision(box1, box2) {
  return (
    box1.x < box2.x + box2.w &&
    box1.x + box1.w > box2.x &&
    box1.y < box2.y + box2.h &&
    box1.y + box1.h > box2.y
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E2723" />
      <View style={styles.appWrapper}>
        {currentScreen === 'menu' && <MenuScreen goTo={setCurrentScreen} />}
        {currentScreen === 'game' && <GameScreen goTo={setCurrentScreen} />}
        {currentScreen === 'scores' && <ScoresScreen goTo={setCurrentScreen} />}
      </View>
    </SafeAreaView>
  );
}

// ==================== MENU SCREEN ====================
function MenuScreen({ goTo }) {
  return (
    <ImageBackground source={BackgroundImage} style={styles.fullScreen} resizeMode="cover">
      <View style={styles.menuOverlay}>
        <View style={styles.menuBox}>
          <Image source={CharacterImage} style={styles.menuLogo} resizeMode="contain" />
          <Text style={styles.menuTitle}>Coffee Palation</Text>
          <Text style={styles.menuSubtitle}>🫘 Collect the Beans! 🫘</Text>

          <TouchableOpacity style={styles.btnPlay} onPress={() => goTo('game')}>
            <Text style={styles.btnPlayText}>▶ PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => goTo('scores')}>
            <Text style={styles.btnSecondaryText}>🏆 LEADERBOARD</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.versionText}>v5.0</Text>
      </View>
    </ImageBackground>
  );
}

// ==================== GAME SCREEN ====================
function GameScreen({ goTo }) {
  // Game phase: 'name' | 'ready' | 'playing' | 'over'
  const [gamePhase, setGamePhase] = useState('name');
  const [displayScore, setDisplayScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isHighScore, setIsHighScore] = useState(false);

  // Game state refs (for performance - avoids stale closures)
  const gameState = useRef({
    birdY: GAME_HEIGHT / 2 - BIRD_SIZE,
    velocity: 0,
    pipes: [],
    beans: [],
    score: 0,
    lastTime: 0,
    spawnTimer: 0,
    isRunning: false,
  });

  const animationId = useRef(null);
  const [, forceRender] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameState.current.isRunning = false;
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        animationId.current = null;
      }
    };
  }, []);

  // Keyboard support for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const resetGameState = useCallback(() => {
    const state = gameState.current;
    state.birdY = GAME_HEIGHT / 2 - BIRD_SIZE;
    state.velocity = 0;
    state.pipes = [];
    state.beans = [];
    state.score = 0;
    state.spawnTimer = 0;
    state.isRunning = false;
    setDisplayScore(0);
    setIsHighScore(false);
  }, []);

  const startGame = useCallback(() => {
    if (!nameInput.trim()) return;

    setPlayerName(nameInput.trim());
    resetGameState();

    const state = gameState.current;
    state.isRunning = true;
    state.lastTime = performance.now();
    setGamePhase('playing');

    // Start game loop
    const gameLoop = (currentTime) => {
      if (!gameState.current.isRunning) return;

      const deltaTime = Math.min((currentTime - gameState.current.lastTime) / 1000, 0.033);
      gameState.current.lastTime = currentTime;

      updateGame(deltaTime);

      if (gameState.current.isRunning) {
        forceRender(n => n + 1);
        animationId.current = requestAnimationFrame(gameLoop);
      }
    };

    animationId.current = requestAnimationFrame(gameLoop);
  }, [nameInput, resetGameState]);

  const spawnPipe = useCallback(() => {
    const state = gameState.current;
    const playableHeight = GAME_HEIGHT - GROUND_HEIGHT;
    const minTop = playableHeight * 0.12;
    const maxTop = playableHeight - PIPE_GAP - minTop;
    const topHeight = Math.random() * (maxTop - minTop) + minTop;

    const pipeId = Date.now() + Math.random();

    state.pipes.push({
      id: pipeId,
      x: GAME_WIDTH,
      topHeight: topHeight,
      scored: false,
    });

    // Add bean in the gap
    state.beans.push({
      id: pipeId,
      x: GAME_WIDTH + (PIPE_WIDTH - BEAN_SIZE) / 2,
      y: topHeight + (PIPE_GAP - BEAN_SIZE) / 2,
      collected: false,
    });
  }, []);

  const updateGame = useCallback((dt) => {
    const state = gameState.current;

    // Bird physics
    state.velocity += GRAVITY * dt;
    state.birdY += state.velocity * dt;

    // Spawn pipes
    state.spawnTimer += dt * 1000;
    if (state.spawnTimer >= PIPE_SPAWN_INTERVAL) {
      state.spawnTimer = 0;
      spawnPipe();
    }

    // Move pipes and beans
    const moveDistance = PIPE_SPEED * dt;
    state.pipes.forEach(p => { p.x -= moveDistance; });
    state.beans.forEach(b => { b.x -= moveDistance; });

    // Remove off-screen pipes
    state.pipes = state.pipes.filter(p => p.x > -PIPE_WIDTH);
    state.beans = state.beans.filter(b => b.x > -BEAN_SIZE && !b.collected);

    // Check collisions
    checkCollisions();
  }, [spawnPipe]);

  const checkCollisions = useCallback(() => {
    const state = gameState.current;
    if (!state.isRunning) return;

    // Bird hitbox (reduced for fairness)
    const hitboxPad = BIRD_SIZE * (1 - BIRD_HITBOX_SCALE) / 2;
    const bird = {
      x: BIRD_X + hitboxPad,
      y: state.birdY + hitboxPad,
      w: BIRD_SIZE * BIRD_HITBOX_SCALE,
      h: BIRD_SIZE * BIRD_HITBOX_SCALE,
    };

    // Ground collision
    if (state.birdY + BIRD_SIZE >= GAME_HEIGHT - GROUND_HEIGHT) {
      endGame();
      return;
    }

    // Ceiling collision
    if (state.birdY <= 0) {
      endGame();
      return;
    }

    // Pipe collisions
    for (const pipe of state.pipes) {
      // Skip pipes that are too far
      if (pipe.x > BIRD_X + BIRD_SIZE + 10 || pipe.x + PIPE_WIDTH < BIRD_X - 10) {
        continue;
      }

      const topPipe = { x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.topHeight };
      const bottomPipe = {
        x: pipe.x,
        y: pipe.topHeight + PIPE_GAP,
        w: PIPE_WIDTH,
        h: GAME_HEIGHT,
      };

      if (checkCollision(bird, topPipe) || checkCollision(bird, bottomPipe)) {
        endGame();
        return;
      }

      // Score when passing pipe
      if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.scored = true;
        state.score += 1;
        setDisplayScore(state.score);
      }
    }

    // Bean collection
    for (const bean of state.beans) {
      if (bean.collected) continue;

      const beanRect = { x: bean.x, y: bean.y, w: BEAN_SIZE, h: BEAN_SIZE };
      if (checkCollision(bird, beanRect)) {
        bean.collected = true;
        state.score += 3;
        setDisplayScore(state.score);
      }
    }
  }, []);

  const endGame = useCallback(async () => {
    const state = gameState.current;
    if (!state.isRunning) return;

    state.isRunning = false;

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }

    // Check if high score
    const finalScore = state.score;
    if (finalScore > 0) {
      const existingScores = await getScores();
      const topScore = existingScores.length > 0 ? existingScores[0].score : 0;

      if (finalScore > topScore) {
        setIsHighScore(true);
      }

      await addScore(playerName, finalScore);
    }

    setGamePhase('over');
  }, [playerName]);

  const handleTap = useCallback(() => {
    const state = gameState.current;
    if (state.isRunning) {
      state.velocity = JUMP_VELOCITY;
    }
  }, []);

  const playAgain = useCallback(() => {
    setNameInput('');
    setGamePhase('name');
  }, []);

  // Get current game state for rendering
  const state = gameState.current;
  const rotation = Math.max(-30, Math.min(90, state.velocity / 10));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.gameArea}>
        {/* Background */}
        <ImageBackground source={BackgroundImage} style={styles.sky} resizeMode="cover">
          {/* Pipes */}
          {state.pipes.map((pipe) => (
            <React.Fragment key={pipe.id}>
              {/* Top Pipe */}
              <View
                style={[
                  styles.pipe,
                  styles.pipeTop,
                  {
                    left: pipe.x,
                    height: pipe.topHeight,
                  },
                ]}
              >
                <View style={styles.pipeCap} />
              </View>
              {/* Bottom Pipe */}
              <View
                style={[
                  styles.pipe,
                  styles.pipeBottom,
                  {
                    left: pipe.x,
                    top: pipe.topHeight + PIPE_GAP,
                    height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP - GROUND_HEIGHT,
                  },
                ]}
              >
                <View style={[styles.pipeCap, styles.pipeCapBottom]} />
              </View>
            </React.Fragment>
          ))}

          {/* Beans */}
          {state.beans.filter(b => !b.collected).map((bean) => (
            <Image
              key={bean.id}
              source={BeanImage}
              style={[styles.bean, { left: bean.x, top: bean.y }]}
              resizeMode="contain"
            />
          ))}

          {/* Bird */}
          <Image
            source={CharacterImage}
            style={[
              styles.bird,
              {
                top: state.birdY,
                transform: [{ rotate: `${rotation}deg` }],
              },
            ]}
            resizeMode="contain"
          />

          {/* Score HUD */}
          {gamePhase === 'playing' && (
            <View style={styles.hud}>
              <Text style={styles.hudScore}>{displayScore}</Text>
              <Text style={styles.hudName}>{playerName}</Text>
            </View>
          )}
        </ImageBackground>

        {/* Ground */}
        <View style={styles.ground}>
          <Text style={styles.groundText}>☕🫘☕🫘☕🫘☕🫘☕🫘☕🫘</Text>
        </View>

        {/* Name Input Modal */}
        <Modal visible={gamePhase === 'name'} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <Image source={CharacterImage} style={styles.modalIcon} resizeMode="contain" />
              <Text style={styles.modalTitle}>Enter Your Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Your name..."
                placeholderTextColor="#999"
                value={nameInput}
                onChangeText={setNameInput}
                maxLength={12}
                autoFocus
                onSubmitEditing={startGame}
              />
              <TouchableOpacity style={styles.modalBtn} onPress={startGame}>
                <Text style={styles.modalBtnText}>🎮 START GAME</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goTo('menu')}>
                <Text style={styles.modalLink}>← Back to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <Modal visible={gamePhase === 'over'} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <Text style={styles.gameOverText}>GAME OVER</Text>
              {isHighScore && <Text style={styles.highScoreText}>🎉 NEW HIGH SCORE! 🎉</Text>}
              <Text style={styles.finalScoreNum}>{displayScore}</Text>
              <Text style={styles.finalScoreLabel}>POINTS</Text>

              <TouchableOpacity style={styles.modalBtn} onPress={playAgain}>
                <Text style={styles.modalBtnText}>🔄 PLAY AGAIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGray]} onPress={() => goTo('menu')}>
                <Text style={styles.modalBtnText}>🏠 MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ==================== SCORES SCREEN ====================
function ScoresScreen({ goTo }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScores().then(data => {
      setScores(data);
      setLoading(false);
    });
  }, []);

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  return (
    <ImageBackground source={BackgroundImage} style={styles.scoresScreen} resizeMode="cover">
      <View style={styles.scoresOverlay}>
        <Text style={styles.scoresTitle}>🏆 Leaderboard</Text>

        <View style={styles.scoresList}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : scores.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={BeanImage} style={styles.emptyIcon} resizeMode="contain" />
              <Text style={styles.emptyText}>No scores yet!</Text>
              <Text style={styles.emptySubtext}>Play to be the first!</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {scores.map((item, index) => (
                <View key={index} style={[styles.scoreRow, index === 0 && styles.scoreRowTop]}>
                  <Text style={styles.scoreMedal}>{medals[index] || '🏅'}</Text>
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreName}>{item.name}</Text>
                    <Text style={styles.scoreDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.scoreNum, index === 0 && styles.scoreNumTop]}>
                    {item.score}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => goTo('menu')}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },

  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  menuLogo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  menuTitle: {
    fontSize: 30 * scale,
    fontWeight: 'bold',
    color: '#4E342E',
    marginBottom: 5,
  },
  menuSubtitle: {
    fontSize: 16 * scale,
    color: '#795548',
    marginBottom: 25,
  },
  btnPlay: {
    backgroundColor: '#E65100',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  btnPlayText: {
    color: '#fff',
    fontSize: 22 * scale,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#8D6E63',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 16 * scale,
    fontWeight: 'bold',
  },
  versionText: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },

  // Game
  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB',
    overflow: 'hidden',
  },
  sky: {
    flex: 1,
    position: 'relative',
  },
  bird: {
    position: 'absolute',
    left: BIRD_X,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    zIndex: 10,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: '#43A047',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  pipeTop: {
    top: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  pipeBottom: {
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  pipeCap: {
    position: 'absolute',
    bottom: -2,
    left: -6,
    right: -6,
    height: 20,
    backgroundColor: '#388E3C',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  pipeCapBottom: {
    bottom: undefined,
    top: -2,
  },
  bean: {
    position: 'absolute',
    width: BEAN_SIZE,
    height: BEAN_SIZE,
    zIndex: 5,
  },
  ground: {
    height: GROUND_HEIGHT,
    backgroundColor: '#6D4C41',
    borderTopWidth: 6,
    borderTopColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 18,
    letterSpacing: 2,
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  hudScore: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  hudName: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },

  // Modals
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  modalIcon: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#E65100',
    borderRadius: 14,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    backgroundColor: '#FFF8E1',
  },
  modalBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  modalBtnGray: {
    backgroundColor: '#757575',
    shadowColor: '#757575',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalLink: {
    color: '#666',
    marginTop: 12,
    fontSize: 15,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  highScoreText: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScoreNum: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
  },
  finalScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 22,
    letterSpacing: 2,
  },

  // Scores Screen
  scoresScreen: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scoresOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  scoresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scoresList: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#795548',
    marginTop: 50,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 70,
    height: 70,
    opacity: 0.5,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 20,
    color: '#795548',
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A1887F',
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreRowTop: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  scoreMedal: {
    fontSize: 30,
    marginRight: 14,
    width: 44,
    textAlign: 'center',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4E342E',
  },
  scoreDate: {
    fontSize: 11,
    color: '#A1887F',
    marginTop: 3,
  },
  scoreNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreNumTop: {
    fontSize: 28,
    color: '#FF9800',
  },
  backBtn: {
    backgroundColor: '#795548',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 15,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

/**
 * COFFEE PALATION - Flappy Coffee Game
 * With Character Image + CSS Style Files
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
  Animated,
  Image,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import CSS Style Files
import { COLORS } from './styles/colors';
import { menuStyles } from './styles/menuStyles';
import { gameStyles, GAME_CONSTANTS } from './styles/gameStyles';
import { modalStyles } from './styles/modalStyles';
import { leaderboardStyles } from './styles/leaderboardStyles';

// Assets
const CharacterImage = require('./assets/character.png');
const BeanImage = require('./assets/bean.png');
const BackgroundImage = require('./assets/background.png');

// ==================== CONSTANTS ====================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Physics
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const MAX_VELOCITY = 12;

// Dimensions
const BIRD_SIZE = 55;
const BIRD_HITBOX = 0.75;
const PIPE_WIDTH = 65;
const PIPE_GAP = 190;
const PIPE_SPEED = 6;
const PIPE_SPACING = 300;
const BEAN_SIZE = 40;
const GROUND_HEIGHT = 70;
const BIRD_X = 70;

// First pipe position
const FIRST_PIPE_X = SCREEN_WIDTH + 50;

// Storage key
const STORAGE_KEY = '@coffee_palation_v3';

// ==================== STORAGE ====================
const loadScores = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data).filter(s => s && s.name && s.score > 0) : [];
  } catch { return []; }
};

const saveScore = async (name, score) => {
  if (!name || score <= 0) return;
  try {
    const scores = await loadScores();
    scores.push({ name, score, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 5)));
  } catch {}
};

// ==================== COLLISION (AABB) ====================
const checkAABB = (a, b) => (
  a.x < b.x + b.w && a.x + a.w > b.x &&
  a.y < b.y + b.h && a.y + a.h > b.y
);

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState('menu');
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      {screen === 'menu' && <MenuScreen onNav={setScreen} />}
      {screen === 'game' && <GameScreen onNav={setScreen} />}
      {screen === 'scores' && <ScoresScreen onNav={setScreen} />}
    </SafeAreaView>
  );
}

// ==================== MENU SCREEN ====================
function MenuScreen({ onNav }) {
  const bounce = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation for character
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -20, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <ImageBackground 
      source={BackgroundImage} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.menuOverlay}>
        {/* Floating Character */}
        <Animated.View style={[menuStyles.logoContainer, { transform: [{ translateY: bounce }] }]}>
          <Image 
            source={CharacterImage} 
            style={styles.menuCharacter}
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* Title with enhanced visibility */}
        <View style={styles.titleContainer}>
          <Text style={styles.menuTitle}>Coffee</Text>
          <Text style={styles.menuSubtitle}>Palation</Text>
        </View>
        <Text style={styles.menuTagline}>Collect the beans!</Text>

        {/* Play Button */}
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity style={styles.playButton} onPress={() => onNav('game')}>
            <Text style={styles.playButtonText}>▶ PLAY</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Leaderboard Button */}
        <TouchableOpacity style={styles.leaderboardButton} onPress={() => onNav('scores')}>
          <Text style={styles.leaderboardButtonText}>🏆 LEADERBOARD</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.menuFooter}>
          <Text style={styles.menuFooterText}>☕ v2.0</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

// ==================== GAME SCREEN ====================
function GameScreen({ onNav }) {
  // UI STATE
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('name');
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [tick, setTick] = useState(0);

  // GAME STATE (useRef for performance)
  const birdY = useRef(SCREEN_HEIGHT / 2 - 50);
  const velocity = useRef(0);
  const pipes = useRef([]);
  const beans = useRef([]);
  const columnsPassed = useRef(0);
  const scoreRef = useRef(0);
  
  // Game loop control
  const frameId = useRef(null);
  const isRunning = useRef(false);

  // Bird rotation animation
  const rotation = useRef(new Animated.Value(0)).current;

  // RESET FUNCTION (Critical for no lag)
  const resetGame = useCallback(() => {
    if (frameId.current !== null) {
      cancelAnimationFrame(frameId.current);
      frameId.current = null;
    }
    
    isRunning.current = false;
    birdY.current = SCREEN_HEIGHT / 2 - 50;
    velocity.current = 0;
    pipes.current = [];
    beans.current = [];
    columnsPassed.current = 0;
    scoreRef.current = 0;
    
    setScore(0);
    setMultiplier(1);
    setFinalScore(0);
    setIsHighScore(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
      isRunning.current = false;
    };
  }, []);

  // Random gap position
  const randomGapY = () => {
    const min = 90;
    const max = SCREEN_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 90;
    return Math.floor(Math.random() * (max - min)) + min;
  };

  // Spawn pipe with bean
  const spawnPipe = (x) => {
    const id = Date.now() + Math.random();
    const gapY = randomGapY();
    
    pipes.current.push({ id, x, gapY, passed: false });
    beans.current.push({
      id,
      x: x + PIPE_WIDTH / 2 - BEAN_SIZE / 2,
      y: gapY + PIPE_GAP / 2 - BEAN_SIZE / 2,
      collected: false,
    });
  };

  // Start game
  const startGame = () => {
    if (!inputName.trim()) return;
    
    const name = inputName.trim();
    setPlayerName(name);
    resetGame();
    spawnPipe(FIRST_PIPE_X);
    isRunning.current = true;
    setPhase('playing');
    runGameLoop();
  };

  // GAME LOOP
  const runGameLoop = () => {
    if (!isRunning.current) return;
    
    // Physics
    velocity.current = Math.min(velocity.current + GRAVITY, MAX_VELOCITY);
    birdY.current += velocity.current;

    // Move pipes & beans
    for (let i = 0; i < pipes.current.length; i++) {
      pipes.current[i].x -= PIPE_SPEED;
    }
    for (let i = 0; i < beans.current.length; i++) {
      beans.current[i].x -= PIPE_SPEED;
    }

    // Cleanup off-screen
    pipes.current = pipes.current.filter(p => p.x > -PIPE_WIDTH);
    beans.current = beans.current.filter(b => b.x > -BEAN_SIZE);

    // Spawn new pipes
    if (pipes.current.length > 0) {
      const lastPipe = pipes.current[pipes.current.length - 1];
      if (lastPipe.x < SCREEN_WIDTH - PIPE_SPACING) {
        spawnPipe(SCREEN_WIDTH);
      }
    }

    // Track columns passed
    for (const pipe of pipes.current) {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        columnsPassed.current++;
        setMultiplier(Math.floor(columnsPassed.current / 10) + 1);
      }
    }

    // COLLISION DETECTION
    const hitboxPad = (BIRD_SIZE * (1 - BIRD_HITBOX)) / 2;
    const bird = {
      x: BIRD_X + hitboxPad,
      y: birdY.current + hitboxPad,
      w: BIRD_SIZE * BIRD_HITBOX,
      h: BIRD_SIZE * BIRD_HITBOX,
    };

    // Ground
    if (birdY.current + BIRD_SIZE >= SCREEN_HEIGHT - GROUND_HEIGHT) {
      gameOver();
      return;
    }

    // Ceiling
    if (birdY.current <= 0) {
      gameOver();
      return;
    }

    // Pipes
    for (const pipe of pipes.current) {
      if (pipe.x > BIRD_X + BIRD_SIZE || pipe.x + PIPE_WIDTH < BIRD_X) continue;

      const topPipe = { x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.gapY };
      const bottomPipe = { 
        x: pipe.x, 
        y: pipe.gapY + PIPE_GAP, 
        w: PIPE_WIDTH, 
        h: SCREEN_HEIGHT - GROUND_HEIGHT - pipe.gapY - PIPE_GAP 
      };

      if (checkAABB(bird, topPipe) || checkAABB(bird, bottomPipe)) {
        gameOver();
        return;
      }
    }

    // Beans
    for (const bean of beans.current) {
      if (bean.collected) continue;
      
      const beanBox = { x: bean.x - 5, y: bean.y - 5, w: BEAN_SIZE + 10, h: BEAN_SIZE + 10 };
      
      if (checkAABB(bird, beanBox)) {
        bean.collected = true;
        const points = Math.floor(columnsPassed.current / 10) + 1;
        scoreRef.current += points;
        setScore(scoreRef.current);
      }
    }

    setTick(t => t + 1);
    frameId.current = requestAnimationFrame(runGameLoop);
  };

  // Game Over
  const gameOver = async () => {
    isRunning.current = false;
    
    if (frameId.current !== null) {
      cancelAnimationFrame(frameId.current);
      frameId.current = null;
    }

    const currentScore = scoreRef.current;
    setFinalScore(currentScore);

    if (currentScore > 0) {
      const scores = await loadScores();
      setIsHighScore(scores.length < 5 || currentScore > (scores[4]?.score || 0));
      await saveScore(playerName, currentScore);
    }

    setPhase('over');
  };

  // Jump
  const jump = () => {
    if (phase === 'playing' && isRunning.current) {
      velocity.current = JUMP_FORCE;
    }
  };

  // Restart
  const restart = () => {
    resetGame();
    setInputName('');
    setPhase('name');
  };

  // Keyboard support (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  // Bird rotation based on velocity
  const rotationDeg = Math.max(-30, Math.min(80, velocity.current * 5));

  return (
    <TouchableWithoutFeedback onPress={jump}>
      <View style={gameStyles.container}>
        {/* Sky */}
        <View style={gameStyles.sky}>
          {/* Gradient overlay */}
          <View style={gameStyles.skyGradientTop} />
          
          {/* Decorative clouds */}
          <View style={[gameStyles.cloud, { width: 100, height: 40, top: 60, left: 30, opacity: 0.7 }]} />
          <View style={[gameStyles.cloud, { width: 70, height: 30, top: 120, right: 50, opacity: 0.5 }]} />
          <View style={[gameStyles.cloud, { width: 50, height: 22, top: 80, right: 100, opacity: 0.6 }]} />

          {/* Score UI */}
          {phase === 'playing' && (
            <View style={gameStyles.scoreContainer}>
              <View style={gameStyles.scoreBackdrop}>
                <Text style={gameStyles.scoreText}>{score}</Text>
              </View>
              <View style={gameStyles.multiplierBadge}>
                <Text style={gameStyles.multiplierText}>×{multiplier}</Text>
              </View>
              <Text style={gameStyles.playerNameTag}>{playerName}</Text>
            </View>
          )}

          {/* Bird/Character */}
          <View style={[
            gameStyles.bird,
            { left: BIRD_X, top: birdY.current, transform: [{ rotate: `${rotationDeg}deg` }] }
          ]}>
            <Image 
              source={CharacterImage} 
              style={gameStyles.birdImage}
            />
          </View>

          {/* Pipes */}
          {pipes.current.map(p => (
            <React.Fragment key={p.id}>
              {/* Top Pipe */}
              <View style={[gameStyles.pipe, { left: p.x, top: 0, height: p.gapY }]}>
                <View style={gameStyles.pipeCapTop} />
                <View style={gameStyles.pipeHighlight} />
              </View>
              {/* Bottom Pipe */}
              <View style={[
                gameStyles.pipe, 
                { 
                  left: p.x, 
                  top: p.gapY + PIPE_GAP, 
                  height: SCREEN_HEIGHT - GROUND_HEIGHT - p.gapY - PIPE_GAP 
                }
              ]}>
                <View style={gameStyles.pipeCapBottom} />
                <View style={gameStyles.pipeHighlight} />
              </View>
            </React.Fragment>
          ))}

          {/* Beans */}
          {beans.current.filter(b => !b.collected).map(b => (
            <View key={b.id} style={[gameStyles.bean, { left: b.x, top: b.y }]}>
              <View style={gameStyles.beanGlow} />
              <Image source={BeanImage} style={styles.beanImage} resizeMode="contain" />
            </View>
          ))}

          {/* Instructions */}
          {phase === 'playing' && tick < 60 && (
            <Text style={gameStyles.instructionText}>
              {Platform.OS === 'web' ? '⌨️ SPACE or TAP to jump!' : '👆 TAP to jump!'}
            </Text>
          )}
        </View>

        {/* Ground */}
        <View style={gameStyles.ground}>
          <View style={gameStyles.groundDirt} />
          <Text style={gameStyles.groundPattern}>☕ 🫘 ☕ 🫘 ☕ 🫘 ☕ 🫘 ☕ 🫘</Text>
        </View>

        {/* NAME MODAL */}
        <Modal visible={phase === 'name'} transparent animationType="fade">
          <View style={modalStyles.overlay}>
            <View style={modalStyles.card}>
              <Image 
                source={CharacterImage} 
                style={styles.modalCharacter}
                resizeMode="contain"
              />
              <Text style={modalStyles.title}>Enter Your Name</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Player name..."
                placeholderTextColor="#999"
                value={inputName}
                onChangeText={setInputName}
                maxLength={15}
                autoFocus
              />
              <TouchableOpacity style={modalStyles.primaryButton} onPress={startGame}>
                <Text style={modalStyles.primaryButtonText}>🎮 Start Game</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.secondaryButton} onPress={() => onNav('menu')}>
                <Text style={modalStyles.secondaryButtonText}>← Back to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* GAME OVER MODAL */}
        <Modal visible={phase === 'over'} transparent animationType="fade">
          <View style={modalStyles.overlay}>
            <View style={modalStyles.card}>
              {isHighScore && <Text style={[modalStyles.confetti, { top: 10, left: 20 }]}>🎉</Text>}
              {isHighScore && <Text style={[modalStyles.confetti, { top: 10, right: 20 }]}>🎊</Text>}
              
              <Text style={modalStyles.gameOverTitle}>Game Over!</Text>
              {isHighScore && <Text style={modalStyles.highScoreText}>🏆 New High Score! 🏆</Text>}
              
              <View style={modalStyles.scoreBox}>
                <Text style={modalStyles.scoreLabel}>FINAL SCORE</Text>
                <Text style={modalStyles.scoreValue}>{finalScore}</Text>
              </View>
              
              <TouchableOpacity style={modalStyles.primaryButton} onPress={restart}>
                <Text style={modalStyles.primaryButtonText}>🔄 Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.secondaryButton} onPress={() => { resetGame(); onNav('menu'); }}>
                <Text style={modalStyles.secondaryButtonText}>🏠 Main Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ==================== SCORES SCREEN ====================
function ScoresScreen({ onNav }) {
  const [scores, setScores] = useState([]);

  useEffect(() => { loadScores().then(setScores); }, []);

  const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];

  return (
    <View style={leaderboardStyles.container}>
      {/* Header */}
      <View style={leaderboardStyles.header}>
        <Text style={leaderboardStyles.title}>🏆 Leaderboard</Text>
        <Text style={leaderboardStyles.subtitle}>Top 5 Coffee Champions</Text>
      </View>

      {/* Scores List */}
      <View style={leaderboardStyles.listContainer}>
        {scores.length === 0 ? (
          <View style={leaderboardStyles.emptyContainer}>
            <Image source={BeanImage} style={styles.emptyBeanIcon} resizeMode="contain" />
            <Text style={leaderboardStyles.emptyText}>No scores yet!</Text>
            <Text style={leaderboardStyles.emptySubtext}>Play to be the first champion!</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {scores.map((s, i) => (
              <View 
                key={i} 
                style={[
                  leaderboardStyles.row, 
                  i === 0 && leaderboardStyles.rowFirst,
                  i === 1 && leaderboardStyles.rowSecond,
                  i === 2 && leaderboardStyles.rowThird,
                ]}
              >
                <Text style={leaderboardStyles.medal}>{medals[i]}</Text>
                <View style={leaderboardStyles.info}>
                  <Text style={leaderboardStyles.name}>{s.name}</Text>
                  <Text style={leaderboardStyles.date}>
                    {new Date(s.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  leaderboardStyles.score,
                  i === 0 && leaderboardStyles.scoreFirst,
                ]}>
                  {s.score}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity style={leaderboardStyles.backButton} onPress={() => onNav('menu')}>
        <Text style={leaderboardStyles.backButtonText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==================== LOCAL STYLES ====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // Background Image
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Menu Overlay (for readability over background)
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  
  menuCharacter: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  
  // Title styles for background
  titleContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  
  menuTitle: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },
  
  menuSubtitle: {
    fontSize: 42,
    fontWeight: '300',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 8,
    marginTop: -8,
  },
  
  menuTagline: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 35,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  
  // Play Button (enhanced for background)
  playButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 18,
    paddingHorizontal: 70,
    borderRadius: 35,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#FF5252',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    minWidth: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
  },
  
  playButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  // Leaderboard Button
  leaderboardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 28,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minWidth: SCREEN_WIDTH * 0.6,
    alignItems: 'center',
  },
  
  leaderboardButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  
  // Footer
  menuFooter: {
    position: 'absolute',
    bottom: 25,
  },
  
  menuFooterText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  modalCharacter: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  
  beanImage: {
    width: BEAN_SIZE,
    height: BEAN_SIZE,
  },
  
  emptyBeanIcon: {
    width: 70,
    height: 70,
    marginBottom: 15,
    opacity: 0.7,
  },
});

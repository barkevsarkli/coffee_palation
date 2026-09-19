/**
 * COFFEE PALATION - Tetris
 * Version 8.0 - Mobile-first Tetris
 *
 * v8.0 Changes:
 * - Game converted from Flappy Bird to Tetris
 * - Mobile app style layout: board on the left, score panel on the right,
 *   touch controls in the thumb zone (left arrow, right arrow, rotate, hold-to-speed-up)
 * - Hold-to-repeat on the arrow buttons, multi-touch friendly pointer events on web
 * - 7-bag randomizer, wall kicks, ghost piece, next piece preview, levels
 * - Pause (button, app switch / tab hide), keyboard support on desktop
 * - Global leaderboard kept as before
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pickBotMessage } from './botMessages';
import DuckMascot from './components/DuckMascot';

// ==================== ASSETS ====================
const CharacterImage = require('./assets/character.png');
const BeanImage = require('./assets/bean.png');
const BackgroundImage = require('./assets/background.png');

// ==================== REACTIVE DIMENSIONS HOOK ====================
const MAX_GAME_WIDTH = 500;
const BASE_WIDTH = 375;

function getScreenDimensions() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Use visualViewport when available (handles address-bar collapse on mobile)
    const vv = window.visualViewport;
    const w = vv ? vv.width : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    return { width: w, height: h };
  }
  const dim = Dimensions.get('window');
  return { width: dim.width, height: dim.height };
}

function useDimensions() {
  const [dims, setDims] = useState(getScreenDimensions);

  useEffect(() => {
    const update = () => setDims(getScreenDimensions());

    // React Native dimension listener
    const sub = Dimensions.addEventListener('change', update);

    // Web-specific: resize + visualViewport
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', update);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', update);
      }
      return () => {
        sub?.remove();
        window.removeEventListener('resize', update);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', update);
        }
      };
    }

    return () => sub?.remove();
  }, []);

  return dims;
}

// ==================== TETRIS DEFINITIONS ====================
const COLS = 10;
const ROWS = 20;

const PIECES = {
  I: { color: '#4DD0E1', shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { color: '#FFD54F', shape: [[1, 1], [1, 1]] },
  T: { color: '#BA68C8', shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { color: '#81C784', shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { color: '#E57373', shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { color: '#64B5F6', shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { color: '#FFB74D', shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};
const PIECE_TYPES = Object.keys(PIECES);

// Every cleared 1x1 block is worth this much, before the row and level multipliers
const POINTS_PER_BLOCK = 10;
const LINES_PER_LEVEL = 10;

// Gravity: the speed multiplier starts here and climbs with every block handled
const DROP_SPEED = 1.5;
const BASE_DROP_MS = 800;        // interval at a multiplier of 1
const MIN_DROP_MS = 55;          // hard floor, however fast the multiplier gets
// Every block placed on the board adds this much speed. Clears do not feed the ramp.
const SPEED_PER_BLOCK = 0.01;

// The bot panics once the stack reaches this row, and nags after this long idle
const DANGER_ROW = 4;
const BOT_IDLE_MS = 7000;
const BOT_MIN_GAP_MS = 1200;

// Held drop-boost button: gravity multiplier while held, and points earned per second held
const BOOST_MULTIPLIER = 5;
const BOOST_POINTS_PER_SECOND = 1;

// ==================== SAND EFFECT ====================
// A cleared block crumbles into grains that pour downwards. Positions and sizes
// are in cell units so a resize does not move them.
const GRAINS_PER_BLOCK = 10;
const GRAIN_LIFE = 950;        // ms until a grain has fully faded
const GRAIN_GRAVITY = 52;      // cells per second^2
const GRAIN_TERMINAL = 24;     // cells per second, so grains pour instead of rocketing
const GRAIN_DRAG = 0.86;       // horizontal damping per second, grains fall straight quickly
const GRAIN_FADE_FROM = 0.55;  // fraction of life spent fully opaque
const MAX_GRAINS = 900;

// Lightens or darkens a #rrggbb colour so a burst of grains looks granular
function shadeHex(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const shifted = amount >= 0 ? v + (255 - v) * amount : v * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(shifted)));
  });
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
}

// Hold-to-repeat timing for the arrow buttons (ms)
const REPEAT_DELAY = 170;
const REPEAT_INTERVAL = 55;

// ==================== GAME CONSTANTS FACTORY ====================
function getGameConstants(screenWidth, screenHeight) {
  const gameWidth = Math.min(screenWidth, MAX_GAME_WIDTH);
  const gameHeight = screenHeight;
  const scale = Math.min(gameWidth / BASE_WIDTH, 1.3);

  const PADDING = Math.round(Math.max(12, 16 * scale));
  const GAP = Math.round(Math.max(8, 10 * scale));
  const BOARD_BORDER = Math.max(2, Math.round(3 * scale));

  // Controls live in the thumb zone at the bottom of the screen.
  // Bottom row is left / right / boost; rotate is a smaller button stacked over boost.
  const CONTROL_SIZE = Math.round(Math.max(52, Math.min(78 * scale, gameHeight * 0.11)));
  const ROTATE_SIZE = Math.round(Math.max(40, CONTROL_SIZE * 0.78));
  const STACK_GAP = Math.round(Math.max(6, 8 * scale));
  const CONTROL_DEPTH = Math.max(3, Math.round(5 * scale));
  const CONTROLS_PADDING_TOP = Math.round(PADDING * 0.75);
  // Extra bottom room so buttons stay clear of the home indicator / browser bar
  const CONTROLS_PADDING_BOTTOM = PADDING + Math.round(8 * scale);
  const CONTROLS_HEIGHT =
    CONTROLS_PADDING_TOP + ROTATE_SIZE + STACK_GAP + CONTROL_SIZE + CONTROLS_PADDING_BOTTOM;

  const innerWidth = gameWidth - PADDING * 2;
  const playHeight = gameHeight - PADDING - CONTROLS_HEIGHT;

  // Board owns the whole play area; score and next piece are drawn on top of it
  const CELL = Math.max(8, Math.floor(Math.min(
    (innerWidth - BOARD_BORDER * 2) / COLS,
    (playHeight - BOARD_BORDER * 2) / ROWS
  )));
  const BOARD_WIDTH = CELL * COLS + BOARD_BORDER * 2;
  const BOARD_HEIGHT = CELL * ROWS + BOARD_BORDER * 2;

  return {
    GAME_WIDTH: gameWidth,
    GAME_HEIGHT: gameHeight,
    scale,
    PADDING,
    GAP,
    CELL,
    BOARD_BORDER,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    CONTROL_SIZE,
    ROTATE_SIZE,
    STACK_GAP,
    CONTROL_DEPTH,
    CONTROLS_PADDING_TOP,
    CONTROLS_PADDING_BOTTOM,
    CONTROLS_HEIGHT,
    SLOT_WIDTH: Math.floor((innerWidth - GAP * 2) / 3),
  };
}

// ==================== MOBILE WEB SETUP HOOK ====================
function setMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function useMobileWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // --- Viewport + "installed app" metas ---
    setMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    setMeta('theme-color', '#1E0C06');
    setMeta('mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title', 'Coffee Tetris');

    // --- Body styles to prevent scroll / bounce / zoom ---
    const s = document.body.style;
    const ds = document.documentElement.style;
    s.touchAction = 'manipulation';
    s.overscrollBehavior = 'none';
    s.overflow = 'hidden';
    s.position = 'fixed';
    s.width = '100%';
    s.height = '100%';
    s.margin = '0';
    s.padding = '0';
    s.backgroundColor = '#1a1a1a';
    s.userSelect = 'none';
    s.webkitUserSelect = 'none';
    s.webkitTouchCallout = 'none';
    s.webkitTapHighlightColor = 'transparent';
    ds.overflow = 'hidden';
    ds.height = '100%';
    ds.margin = '0';
    ds.padding = '0';

    // --- Prevent pull-to-refresh / scroll during touch ---
    const preventScroll = (e) => {
      // Allow scrolling inside elements with data-allow-scroll
      if (e.target.closest && e.target.closest('[data-allow-scroll]')) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });

    // --- Prevent context menu on long-press ---
    const preventContext = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext);

    return () => {
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('contextmenu', preventContext);
    };
  }, []);
}

function vibrate(ms) {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(ms);
  } catch (e) {
    // Vibration is optional
  }
}

// ==================== STORAGE FUNCTIONS ====================

async function getScores() {
  try {
    const res = await fetch('/api/getScores');
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    return Array.isArray(data.scores) ? data.scores.filter(s => s.name && s.score > 0) : [];
  } catch (e) {
    console.log('Error loading global scores:', e);
    return [];
  }
}

async function addScore(name, score) {
  if (!name || score < 1) return;
  try {
    const res = await fetch('/api/addScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), score }),
    });
    if (!res.ok) throw new Error('API addScore request failed');
  } catch (e) {
    console.log('Error saving global score:', e);
  }
}

// ==================== TETRIS ENGINE ====================
function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function rotateClockwise(shape) {
  return shape[0].map((_, c) => shape.map(row => row[c]).reverse());
}

function forEachBlock(shape, fn) {
  shape.forEach((row, r) => row.forEach((filled, c) => {
    if (filled) fn(r, c);
  }));
}

function collides(board, shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const bx = x + c;
      const by = y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx]) return true;
    }
  }
  return false;
}

function drawFromBag(s) {
  if (s.bag.length === 0) {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    s.bag = bag;
  }
  return s.bag.pop();
}

function newGameState() {
  const s = {
    board: createEmptyBoard(),
    bag: [],
    piece: null,
    nextType: null,
    score: 0,
    lines: 0,
    level: 1,
    particles: [],
    blocks: 0,
    holes: 0,
    events: [],
    boosting: false,
    boostTimer: 0,
    dropTimer: 0,
    lastTime: 0,
    isRunning: false,
    paused: false,
    over: false,
  };
  return s;
}

function spawnPiece(s) {
  const type = s.nextType || drawFromBag(s);
  const shape = PIECES[type].shape.map(row => row.slice());
  s.piece = {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: type === 'I' ? -1 : 0,
  };
  s.nextType = drawFromBag(s);
  s.dropTimer = 0;
  if (collides(s.board, shape, s.piece.x, s.piece.y)) {
    s.over = true;
  }
}

function tryMove(s, dx, dy) {
  const p = s.piece;
  if (collides(s.board, p.shape, p.x + dx, p.y + dy)) return false;
  p.x += dx;
  p.y += dy;
  return true;
}

function tryRotate(s) {
  const p = s.piece;
  const rotated = rotateClockwise(p.shape);
  // Simple wall kicks: sideways first, then one row up
  const kicks = p.type === 'I'
    ? [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]]
    : [[0, 0], [-1, 0], [1, 0], [0, -1]];
  for (const [kx, ky] of kicks) {
    if (!collides(s.board, rotated, p.x + kx, p.y + ky)) {
      p.shape = rotated;
      p.x += kx;
      p.y += ky;
      return true;
    }
  }
  return false;
}

// Spawns a burst of particles for every filled cell of the rows about to vanish.
// Positions are in cell units so they survive a screen resize.
function spawnClearParticles(s, rowIndexes) {
  for (const r of rowIndexes) {
    for (let c = 0; c < COLS; c++) {
      const color = s.board[r][c];
      if (!color) continue;
      for (let i = 0; i < GRAINS_PER_BLOCK; i++) {
        if (s.particles.length >= MAX_GRAINS) return;
        s.particles.push({
          // Spread evenly across the block so the whole cell crumbles at once
          x: c + 0.06 + Math.random() * 0.88,
          y: r + 0.06 + Math.random() * 0.88,
          // Barely any sideways throw, and only a slight downward nudge
          vx: (Math.random() - 0.5) * 2.2,
          vy: Math.random() * 1.8,
          size: 0.07 + Math.random() * 0.11,
          color: shadeHex(color, (Math.random() - 0.45) * 0.5),
          // Stagger the start so the row dissolves rather than jumping
          delay: Math.random() * 130,
          life: GRAIN_LIFE * (0.7 + Math.random() * 0.3),
          age: 0,
        });
      }
    }
  }
}

// Advances every grain and drops the dead ones. Returns true while any remain.
function stepParticles(s, deltaMs) {
  if (s.particles.length === 0) return false;
  const dt = deltaMs / 1000;
  const dragFactor = Math.pow(GRAIN_DRAG, dt);
  const alive = [];
  for (const p of s.particles) {
    p.age += deltaMs;
    if (p.age >= p.life) continue;

    // Staggered grains hang in place for a moment before they let go
    if (p.delay > 0) {
      p.delay -= deltaMs;
      alive.push(p);
      continue;
    }

    p.vy = Math.min(GRAIN_TERMINAL, p.vy + GRAIN_GRAVITY * dt);
    p.vx *= dragFactor;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Grains that have poured past the floor are done
    if (p.y > ROWS + 1) continue;
    alive.push(p);
  }
  s.particles = alive;
  return alive.length > 0;
}

// Empty cells with at least one filled cell above them in the same column
function countHoles(board) {
  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let covered = false;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c]) covered = true;
      else if (covered) holes++;
    }
  }
  return holes;
}

// Row index of the highest filled cell, or ROWS when the board is empty
function stackTop(board) {
  for (let r = 0; r < ROWS; r++) {
    if (board[r].some(cell => cell)) return r;
  }
  return ROWS;
}

function lockPiece(s) {
  const { shape, x, y, type } = s.piece;
  const color = PIECES[type].color;
  let overflow = false;

  let placed = 0;
  forEachBlock(shape, (r, c) => {
    const by = y + r;
    if (by < 0) {
      overflow = true;
      return;
    }
    s.board[by][x + c] = color;
    placed++;
  });

  if (overflow) {
    s.over = true;
    return;
  }

  // Only blocks placed drive the gravity ramp
  s.blocks += placed;

  const fullRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (s.board[r].every(cell => cell)) fullRows.push(r);
  }
  const cleared = fullRows.length;
  if (cleared > 0) {
    spawnClearParticles(s, fullRows);

    const remaining = s.board.filter((_, r) => !fullRows.includes(r));
    while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(null));
    s.board = remaining;

    // Every destroyed 1x1 block pays POINTS_PER_BLOCK, scaled by rows cleared at once
    const destroyed = cleared * COLS;
    s.score += destroyed * POINTS_PER_BLOCK * cleared * s.level;
    s.lines += cleared;
    s.level = Math.floor(s.lines / LINES_PER_LEVEL) + 1;
    vibrate(cleared >= 4 ? [30, 40, 30] : 25);
  }

  // Tell the bot what just happened. A clear outranks a fresh hole.
  const holes = countHoles(s.board);
  if (cleared > 0) {
    s.events.push(`clear${Math.min(4, cleared)}`);
  } else if (holes > s.holes) {
    s.events.push('hole');
  } else if (stackTop(s.board) <= DANGER_ROW) {
    s.events.push('danger');
  }
  s.holes = holes;

  spawnPiece(s);
}

function stepDown(s) {
  if (!tryMove(s, 0, 1)) lockPiece(s);
}

function hardDrop(s) {
  let distance = 0;
  while (tryMove(s, 0, 1)) distance++;
  s.score += distance * 2;
  lockPiece(s);
}

function getGhostY(s) {
  const p = s.piece;
  let y = p.y;
  while (!collides(s.board, p.shape, p.x, y + 1)) y++;
  return y;
}

// Gravity ramps smoothly with the block counter instead of stepping at level changes
function getSpeedMultiplier(s) {
  return DROP_SPEED + SPEED_PER_BLOCK * s.blocks;
}

function getDropInterval(s) {
  return Math.max(MIN_DROP_MS, BASE_DROP_MS / getSpeedMultiplier(s));
}

// ==================== MAIN APP ====================
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const dims = useDimensions();
  useMobileWebSetup();

  const gc = useMemo(
    () => getGameConstants(dims.width, dims.height),
    [dims.width, dims.height]
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    overflow: 'hidden',
  };

  const wrapperStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#1E0C06" />
      <View style={wrapperStyle}>
        {currentScreen === 'menu' && <MenuScreen goTo={setCurrentScreen} gc={gc} />}
        {currentScreen === 'game' && <GameScreen goTo={setCurrentScreen} gc={gc} />}
        {currentScreen === 'scores' && <ScoresScreen goTo={setCurrentScreen} gc={gc} />}
      </View>
    </SafeAreaView>
  );
}

// ==================== MENU SCREEN ====================
function MenuScreen({ goTo, gc }) {
  const { GAME_WIDTH, GAME_HEIGHT, scale } = gc;
  return (
    <ImageBackground source={BackgroundImage} style={{ width: GAME_WIDTH, height: GAME_HEIGHT, backgroundColor: '#1E0C06' }} resizeMode="contain">
      <View style={menuStyles.overlay}>
        <View style={menuStyles.box}>
          <Image source={CharacterImage} style={{ width: 80 * scale, height: 80 * scale, marginBottom: 12 }} resizeMode="contain" />
          <Text style={[menuStyles.title, { fontSize: Math.round(28 * scale) }]}>Coffee Palation</Text>
          <Text style={[menuStyles.subtitle, { fontSize: Math.round(15 * scale) }]}>🧱 Blokları Diz, Satırları Temizle! 🧱</Text>

          <TouchableOpacity style={menuStyles.btnPlay} onPress={() => goTo('game')}>
            <Text style={[menuStyles.btnPlayText, { fontSize: Math.round(20 * scale) }]}>▶ OYNA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={menuStyles.btnSecondary} onPress={() => goTo('scores')}>
            <Text style={[menuStyles.btnSecondaryText, { fontSize: Math.round(15 * scale) }]}>🏆 LİDERLİK TABLOSU</Text>
          </TouchableOpacity>
        </View>
        <Text style={menuStyles.versionText}>v8.0</Text>
      </View>
    </ImageBackground>
  );
}

const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 28,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: { fontWeight: 'bold', color: '#4E342E', marginBottom: 5 },
  subtitle: { color: '#795548', marginBottom: 25, textAlign: 'center' },
  btnPlay: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    paddingHorizontal: 40,
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
  btnPlayText: { color: '#fff', fontWeight: 'bold' },
  btnSecondary: {
    backgroundColor: '#8D6E63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontWeight: 'bold' },
  versionText: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});

// ==================== BLOCK RENDERING ====================
function Block({ size, color, ghost }) {
  const radius = Math.max(2, Math.round(size * 0.14));
  if (ghost) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: Math.max(1, Math.round(size * 0.08)),
          borderColor: color,
          backgroundColor: 'rgba(255,255,255,0.05)',
          opacity: 0.45,
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: color,
        borderWidth: Math.max(1, Math.round(size * 0.12)),
        borderTopColor: 'rgba(255,255,255,0.5)',
        borderLeftColor: 'rgba(255,255,255,0.3)',
        borderRightColor: 'rgba(0,0,0,0.22)',
        borderBottomColor: 'rgba(0,0,0,0.38)',
      }}
    />
  );
}

function NextPiecePreview({ type, cellSize }) {
  const boxStyle = {
    width: cellSize * 4,
    height: cellSize * 2,
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (!type) return <View style={boxStyle} />;

  // Trim empty rows / columns so the preview is centered
  const shape = PIECES[type].shape;
  const rows = shape.filter(row => row.some(Boolean));
  const usedCols = shape[0].map((_, c) => shape.some(row => row[c]));
  const trimmed = rows.map(row => row.filter((_, c) => usedCols[c]));

  return (
    <View style={boxStyle}>
      {trimmed.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((filled, c) => (
            filled
              ? <Block key={c} size={cellSize} color={PIECES[type].color} />
              : <View key={c} style={{ width: cellSize, height: cellSize }} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ==================== TOUCH CONTROLS ====================
function ControlButton({ onAction, onRelease, repeat = false, width, height, label, children }) {
  const [pressed, setPressed] = useState(false);
  const timers = useRef({ delay: null, interval: null });
  const activeRef = useRef(false);
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  const clearTimers = useCallback(() => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.interval);
    timers.current = { delay: null, interval: null };
  }, []);

  const handleStart = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearTimers();
    activeRef.current = true;
    setPressed(true);
    vibrate(8);
    onActionRef.current();
    if (repeat) {
      timers.current.delay = setTimeout(() => {
        timers.current.interval = setInterval(() => onActionRef.current(), REPEAT_INTERVAL);
      }, REPEAT_DELAY);
    }
  }, [repeat, clearTimers]);

  const handleEnd = useCallback(() => {
    clearTimers();
    setPressed(false);
    if (activeRef.current) {
      activeRef.current = false;
      if (onReleaseRef.current) onReleaseRef.current();
    }
  }, [clearTimers]);

  // Releasing on unmount matters for hold-style buttons (the drop boost)
  useEffect(() => () => {
    clearTimers();
    if (activeRef.current) {
      activeRef.current = false;
      if (onReleaseRef.current) onReleaseRef.current();
    }
  }, [clearTimers]);

  const slotStyle = {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Pointer events on web allow pressing several buttons at the same time
  if (Platform.OS === 'web') {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[slotStyle, { cursor: 'pointer', touchAction: 'none', userSelect: 'none' }]}
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerCancel={handleEnd}
        onPointerLeave={handleEnd}
      >
        {children(pressed)}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={slotStyle}
      delayPressIn={0}
      onPressIn={handleStart}
      onPressOut={handleEnd}
    >
      {children(pressed)}
    </Pressable>
  );
}

function ArrowShape({ direction, width, height, color }) {
  const headLength = Math.round(height * 0.6);
  const shaftHeight = Math.round(height * 0.42);
  const shaftWidth = Math.max(0, width - headLength + 1);
  const isLeft = direction === 'left';

  const head = (
    <View
      key="head"
      style={{
        width: 0,
        height: 0,
        borderTopWidth: height / 2,
        borderBottomWidth: height / 2,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        [isLeft ? 'borderRightWidth' : 'borderLeftWidth']: headLength,
        [isLeft ? 'borderRightColor' : 'borderLeftColor']: color,
      }}
    />
  );
  const shaft = (
    <View
      key="shaft"
      style={{
        width: shaftWidth,
        height: shaftHeight,
        backgroundColor: color,
        [isLeft ? 'marginLeft' : 'marginRight']: -1,
        [isLeft ? 'borderTopRightRadius' : 'borderTopLeftRadius']: Math.round(shaftHeight * 0.3),
        [isLeft ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: Math.round(shaftHeight * 0.3),
      }}
    />
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width, height }}>
      {isLeft ? [head, shaft] : [shaft, head]}
    </View>
  );
}

// Draws a shape twice (dark base + colored face) so it looks like a physical key
function RaisedShape({ width, height, depth, pressed, renderShape }) {
  return (
    <View style={{ width, height: height + depth }}>
      <View style={{ position: 'absolute', top: depth, left: 0 }}>
        {renderShape('base')}
      </View>
      <View style={{ position: 'absolute', top: pressed ? depth : 0, left: 0 }}>
        {renderShape('face')}
      </View>
    </View>
  );
}

// Draws the falling sand on top of the board. Cell units are scaled to pixels here.
function ParticleLayer({ particles, cellSize }) {
  if (particles.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => {
        const px = Math.max(1, Math.round(p.size * cellSize));
        const progress = p.age / p.life;
        // Grains stay solid, then fade only over the tail of their life
        const opacity = progress < GRAIN_FADE_FROM
          ? 1
          : Math.max(0, 1 - (progress - GRAIN_FADE_FROM) / (1 - GRAIN_FADE_FROM));
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x * cellSize - px / 2,
              top: p.y * cellSize - px / 2,
              width: px,
              height: px,
              backgroundColor: p.color,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

// Speech banner that fills the empty space to the left of the rotate button
function BotBanner({ gc, bot, height }) {
  const { scale } = gc;
  const faceSize = Math.round(height * 1.04);

  return (
    <View
      pointerEvents="none"
      style={{
        height,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2B1410',
        borderWidth: 1,
        borderColor: '#5D4037',
        borderRadius: Math.round(12 * scale),
        paddingHorizontal: Math.round(10 * scale),
      }}
    >
      <View style={{ marginRight: Math.round(8 * scale) }}>
        <DuckMascot size={faceSize} mood={bot.mood} gesture={bot.gesture} trigger={bot.text} />
      </View>
      <Text
        numberOfLines={3}
        style={{
          flex: 1,
          color: '#FFE0B2',
          fontSize: Math.max(10, Math.round(12 * scale)),
          lineHeight: Math.max(12, Math.min(Math.round(15 * scale), Math.floor((height - 4) / 3))),
          fontWeight: '600',
        }}
      >
        {bot.text}
      </Text>
    </View>
  );
}

function GameControls({ gc, bot, onLeft, onRight, onRotate, onBoostStart, onBoostEnd }) {
  const { SLOT_WIDTH, CONTROL_SIZE, ROTATE_SIZE, STACK_GAP, CONTROL_DEPTH } = gc;
  const shapeHeight = CONTROL_SIZE - CONTROL_DEPTH;
  const rotateHeight = ROTATE_SIZE - CONTROL_DEPTH;
  const arrowWidth = Math.round(Math.min(SLOT_WIDTH * 0.9, shapeHeight * 1.6));
  const arrowColors = { face: '#FF8F00', base: '#A84E00' };
  const rotateColors = { face: '#43A047', base: '#1B5E20' };
  const dropColors = { face: '#E53935', base: '#8E1B18' };

  const renderArrow = (direction) => (pressed) => (
    <RaisedShape
      width={arrowWidth}
      height={shapeHeight}
      depth={CONTROL_DEPTH}
      pressed={pressed}
      renderShape={(layer) => (
        <ArrowShape direction={direction} width={arrowWidth} height={shapeHeight} color={arrowColors[layer]} />
      )}
    />
  );

  // Square face with a centered glyph, used by the rotate and boost buttons
  const renderGlyph = (colors, size, radius, glyph) => (pressed) => (
    <RaisedShape
      width={size}
      height={size}
      depth={CONTROL_DEPTH}
      pressed={pressed}
      renderShape={(layer) => (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colors[layer],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {layer === 'face' && (
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: Math.round(size * 0.58),
                lineHeight: Math.round(size * 0.7),
                textAlign: 'center',
              }}
            >
              {glyph}
            </Text>
          )}
        </View>
      )}
    />
  );

  return (
    <>
      {/* Bot banner sits above the arrows, level with the rotate button */}
      <View style={{ flex: 1, alignItems: 'stretch', marginRight: gc.GAP }}>
        <View style={{ height: ROTATE_SIZE, flexDirection: 'row' }}>
          <BotBanner gc={gc} bot={bot} height={ROTATE_SIZE} />
        </View>

        <View style={{ height: STACK_GAP }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ControlButton label="Sola" repeat onAction={onLeft} width={SLOT_WIDTH} height={CONTROL_SIZE}>
            {renderArrow('left')}
          </ControlButton>

          <ControlButton label="Sağa" repeat onAction={onRight} width={SLOT_WIDTH} height={CONTROL_SIZE}>
            {renderArrow('right')}
          </ControlButton>
        </View>
      </View>

      {/* Rotate is stacked on top of the boost button, sharing the last slot */}
      <View style={{ width: SLOT_WIDTH, alignItems: 'center' }}>
        <ControlButton label="Döndür" onAction={onRotate} width={SLOT_WIDTH} height={ROTATE_SIZE}>
          {renderGlyph(rotateColors, rotateHeight, rotateHeight / 2, '\u21bb')}
        </ControlButton>

        <View style={{ height: STACK_GAP }} />

        <ControlButton
          label="Hızlandır"
          onAction={onBoostStart}
          onRelease={onBoostEnd}
          width={SLOT_WIDTH}
          height={CONTROL_SIZE}
        >
          {renderGlyph(dropColors, shapeHeight, Math.round(shapeHeight * 0.28), '\u21ca')}
        </ControlButton>
      </View>
    </>
  );
}

// ==================== GAME SCREEN ====================
function GameScreen({ goTo, gc }) {
  // Game phase: 'loading' | 'name' | 'ready' | 'playing' | 'paused' | 'over'
  const [gamePhase, setGamePhase] = useState('loading');

  // Dynamic styles based on current screen dimensions
  const styles = useMemo(() => getStyles(gc), [gc]);

  const [displayScore, setDisplayScore] = useState(0);
  const [bot, setBot] = useState(() => pickBotMessage('intro'));
  const botAt = useRef(0);
  const lastActionAt = useRef(0);
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isHighScore, setIsHighScore] = useState(false);
  const [scoreSavedOrDeclined, setScoreSavedOrDeclined] = useState(false);

  // Load player name from storage initially
  useEffect(() => {
    AsyncStorage.getItem('@coffee_palation_player_name').then(name => {
      if (name) {
        setPlayerName(name);
        setNameInput(name);
        setGamePhase('ready');
      } else {
        setGamePhase('name');
      }
    });
  }, []);

  // Game state lives in a ref (mutated by the engine), React only re-renders on change
  const gameState = useRef(newGameState());
  const animationId = useRef(null);
  const startingRef = useRef(false);
  const [, forceRender] = useState(0);

  const stopLoop = useCallback(() => {
    gameState.current.isRunning = false;
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => stopLoop, [stopLoop]);

  // Shows a bot line, rate limited so bursts of events do not flicker
  const say = useCallback((kind, force = false) => {
    const now = Date.now();
    if (!force && now - botAt.current < BOT_MIN_GAP_MS) return;
    const line = pickBotMessage(kind);
    if (!line) return;
    botAt.current = now;
    setBot(line);
  }, []);

  const endGame = useCallback(async () => {
    const state = gameState.current;
    if (!state.isRunning) return;

    state.boosting = false;
    state.boostTimer = 0;
    stopLoop();
    vibrate([60, 50, 60]);

    // Check if high score
    const finalScore = state.score;
    if (finalScore > 0) {
      const existingScores = await getScores();
      const topScore = existingScores.length > 0 ? existingScores[0].score : 0;

      if (finalScore > topScore) {
        setIsHighScore(true);
      }
    }

    say('over', true);
    setGamePhase('over');
  }, [stopLoop, say]);

  const afterChange = useCallback(() => {
    const state = gameState.current;
    setDisplayScore(state.score);

    // Drain whatever the engine queued for the bot, keeping only the last event
    if (state.events.length > 0) {
      const kind = state.events[state.events.length - 1];
      state.events.length = 0;
      say(kind, kind.startsWith('clear'));
    }

    forceRender(n => n + 1);
    if (state.over) endGame();
  }, [endGame, say]);

  // Runs an engine action only while the game is actively playing
  const runAction = useCallback((action) => {
    const state = gameState.current;
    if (!state.isRunning || state.paused || !state.piece) return;
    lastActionAt.current = Date.now();
    action(state);
    afterChange();
  }, [afterChange]);

  const moveLeft = useCallback(() => runAction(s => tryMove(s, -1, 0)), [runAction]);
  const moveRight = useCallback(() => runAction(s => tryMove(s, 1, 0)), [runAction]);
  const rotate = useCallback(() => runAction(tryRotate), [runAction]);
  const softDrop = useCallback(() => runAction(s => {
    if (tryMove(s, 0, 1)) {
      s.score += 1;
      s.dropTimer = 0;
    } else {
      lockPiece(s);
    }
  }), [runAction]);
  const drop = useCallback(() => runAction(hardDrop), [runAction]);

  // Held boost: doubles gravity for as long as the button is down
  const startBoost = useCallback(() => {
    const state = gameState.current;
    if (!state.isRunning || state.paused || !state.piece) return;
    state.boosting = true;
    state.boostTimer = 0;
    lastActionAt.current = Date.now();
    say('boost');
  }, [say]);

  const endBoost = useCallback(() => {
    const state = gameState.current;
    state.boosting = false;
    state.boostTimer = 0;
  }, []);

  const gameLoop = useCallback((currentTime) => {
    const state = gameState.current;
    if (!state.isRunning) return;

    const deltaMs = Math.min(currentTime - state.lastTime, 100);
    state.lastTime = currentTime;

    if (!state.paused) {
      // Particles animate every frame, independently of the gravity tick
      const hadParticles = state.particles.length > 0;
      stepParticles(state, deltaMs);
      if (hadParticles) forceRender(n => n + 1);

      // Holding the boost button doubles gravity and pays per full second held
      let interval = getDropInterval(state);
      if (state.boosting) {
        interval /= BOOST_MULTIPLIER;
        state.boostTimer += deltaMs;
        if (state.boostTimer >= 1000) {
          const seconds = Math.floor(state.boostTimer / 1000);
          state.boostTimer -= seconds * 1000;
          state.score += seconds * BOOST_POINTS_PER_SECOND;
          setDisplayScore(state.score);
        }
      }

      // Nag when the player has gone quiet for a while
      if (Date.now() - lastActionAt.current > BOT_IDLE_MS) {
        lastActionAt.current = Date.now();
        say('idle');
      }

      state.dropTimer += deltaMs;
      if (state.dropTimer >= interval) {
        state.dropTimer = 0;
        stepDown(state);
        afterChange();
      }
    }

    if (state.isRunning) {
      animationId.current = requestAnimationFrame(gameLoop);
    }
  }, [afterChange, say]);

  const startGame = useCallback(async () => {
    if (startingRef.current || !nameInput.trim()) return;

    const finalName = nameInput.trim();

    if (finalName.toLowerCase().includes('can') || finalName.toLowerCase().includes('02')) {
      if (Platform.OS === 'web') {
        window.alert('Geçersiz kullanıcı adı!');
      } else {
        alert('Geçersiz kullanıcı adı!');
      }
      return;
    }

    startingRef.current = true;

    // Gizli Sıfırlama Kodu
    if (finalName === '0zekininkusu') {
      try {
        await fetch('/api/resetScores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: finalName })
        });
      } catch (e) {
        console.log('Error resetting global scores:', e);
      }
      await AsyncStorage.removeItem('@coffee_palation_player_name');
      setNameInput('');
      setPlayerName('');
      if (Platform.OS === 'web') {
        window.alert('Global Liderlik tablosu başarıyla sıfırlandı!');
      } else {
        alert('Global Liderlik tablosu başarıyla sıfırlandı!');
      }
      startingRef.current = false;
      setGamePhase('name');
      return;
    }

    setPlayerName(finalName);

    // Save to device so user doesn't have to enter it again
    await AsyncStorage.setItem('@coffee_palation_player_name', finalName);

    stopLoop();
    const state = newGameState();
    spawnPiece(state);
    state.isRunning = true;
    state.lastTime = performance.now();
    gameState.current = state;

    setDisplayScore(0);
    setIsHighScore(false);
    setScoreSavedOrDeclined(false);
    setGamePhase('playing');
    startingRef.current = false;
    lastActionAt.current = Date.now();
    say('start', true);

    animationId.current = requestAnimationFrame(gameLoop);
  }, [nameInput, stopLoop, gameLoop, say]);

  const pauseGame = useCallback(() => {
    const state = gameState.current;
    if (!state.isRunning || state.paused) return;
    state.paused = true;
    state.boosting = false;
    state.boostTimer = 0;
    setGamePhase('paused');
  }, []);

  const resumeGame = useCallback(() => {
    const state = gameState.current;
    if (!state.isRunning) return;
    state.paused = false;
    state.lastTime = performance.now();
    setGamePhase('playing');
  }, []);

  const quitToMenu = useCallback(() => {
    stopLoop();
    goTo('menu');
  }, [stopLoop, goTo]);

  // Pause automatically when the app / tab goes to background
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onVisibility = () => {
      if (document.hidden) pauseGame();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pauseGame]);

  // Keyboard support for web (desktop players)
  const keyHandlers = useRef({});
  keyHandlers.current = { gamePhase, startGame, moveLeft, moveRight, rotate, softDrop, drop, pauseGame, resumeGame };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKey = (e) => {
      const h = keyHandlers.current;
      if (e.target && e.target.tagName === 'INPUT') return;

      if (h.gamePhase === 'ready') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          h.startGame();
        }
        return;
      }

      if (h.gamePhase === 'paused') {
        if (e.code === 'KeyP' || e.code === 'Escape') h.resumeGame();
        return;
      }

      if (h.gamePhase !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft': e.preventDefault(); h.moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); h.moveRight(); break;
        case 'ArrowUp':
        case 'KeyX': e.preventDefault(); h.rotate(); break;
        case 'ArrowDown': e.preventDefault(); h.softDrop(); break;
        case 'Space': e.preventDefault(); h.drop(); break;
        case 'KeyP':
        case 'Escape': h.pauseGame(); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const saveScoreToLeaderboard = async () => {
    let nameToSave = playerName || nameInput;
    if (!nameToSave) {
      nameToSave = await AsyncStorage.getItem('@coffee_palation_player_name');
    }
    await addScore(nameToSave || 'Anonim', displayScore);
    setScoreSavedOrDeclined(true);
  };

  const declineScore = () => {
    setScoreSavedOrDeclined(true);
  };

  const playAgain = useCallback(() => {
    setGamePhase('ready');
  }, []);

  // ---------- Build the visible grid ----------
  const state = gameState.current;
  const overlayCells = {};
  if (state.piece && gamePhase !== 'ready') {
    const { piece } = state;
    const color = PIECES[piece.type].color;
    const ghostY = getGhostY(state);
    forEachBlock(piece.shape, (r, c) => {
      const by = ghostY + r;
      if (by >= 0) overlayCells[by * COLS + piece.x + c] = { color, ghost: true };
    });
    forEachBlock(piece.shape, (r, c) => {
      const by = piece.y + r;
      if (by >= 0) overlayCells[by * COLS + piece.x + c] = { color, ghost: false };
    });
  }

  const { CELL, BOARD_WIDTH, scale } = gc;
  // HUD sits inside the board, so its sizes follow the cell size
  const scoreDigits = Math.max(1, String(displayScore).length);
  const scoreFontSize = Math.max(
    12,
    Math.floor(Math.min(CELL * 0.95, (BOARD_WIDTH * 0.42) / (scoreDigits * 0.62)))
  );
  const previewCell = Math.max(5, Math.floor(CELL * 0.5));

  return (
    <View style={styles.gameArea}>
      {/* Board + score panel */}
      <View style={styles.playArea}>
        <View style={styles.playRow}>
          <View style={styles.board}>
            {state.board.map((row, r) => (
              <View key={r} style={styles.boardRow}>
                {row.map((cell, c) => {
                  const overlay = overlayCells[r * COLS + c];
                  if (cell) return <Block key={c} size={CELL} color={cell} />;
                  if (overlay) return <Block key={c} size={CELL} color={overlay.color} ghost={overlay.ghost} />;
                  return <View key={c} style={styles.cellEmpty} />;
                })}
              </View>
            ))}
            <ParticleLayer particles={state.particles} cellSize={CELL} />

            {/* Score and next piece float over the board */}
            <View pointerEvents="none" style={styles.hud}>
              <View style={styles.hudCard}>
                <Text style={styles.hudLabel}>SKOR</Text>
                <Text style={[styles.hudScore, { fontSize: scoreFontSize }]} numberOfLines={1}>
                  {displayScore}
                </Text>
              </View>

              <View style={styles.hudCard}>
                <Text style={styles.hudLabel}>SIRADAKİ</Text>
                <NextPiecePreview type={gamePhase === 'ready' ? null : state.nextType} cellSize={previewCell} />
              </View>
            </View>
          </View>

        </View>
      </View>

      {/* Touch controls */}
      <View style={styles.controls}>
        <GameControls
          gc={gc}
          bot={bot}
          onLeft={moveLeft}
          onRight={moveRight}
          onRotate={rotate}
          onBoostStart={startBoost}
          onBoostEnd={endBoost}
        />
      </View>

      {/* Ready Overlay */}
      {gamePhase === 'ready' && (
        <Pressable onPressIn={startGame} delayPressIn={0} style={styles.modalBgTransparent}>
          <Text style={styles.readyText}>HAZIR</Text>
          <Text style={styles.readySubText}>Başlamak için ekrana dokun</Text>
        </Pressable>
      )}

      {/* Pause Overlay */}
      {gamePhase === 'paused' && (
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>DURAKLATILDI</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={resumeGame}>
              <Text style={styles.modalBtnText}>▶ DEVAM ET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGray]} onPress={quitToMenu}>
              <Text style={styles.modalBtnText}>MENÜ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Name Input Modal Overlay */}
      {gamePhase === 'name' && (
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Image source={CharacterImage} style={styles.modalIcon} resizeMode="contain" />
            <Text style={styles.modalTitle}>Adınızı Girin</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Adınız..."
              placeholderTextColor="#999"
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={12}
              autoFocus
              onSubmitEditing={() => setGamePhase('ready')}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={() => setGamePhase('ready')}>
              <Text style={styles.modalBtnText}>🎮 DEVAM ET</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo('menu')}>
              <Text style={styles.modalLink}>← Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game Over Modal Overlay */}
      {gamePhase === 'over' && (
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.gameOverText}>OYUN BİTTİ</Text>
            {isHighScore && <Text style={styles.highScoreText}>🎉 YENİ REKOR! 🎉</Text>}
            <Text style={styles.finalScoreNum}>{displayScore}</Text>
            <Text style={styles.finalScoreLabel}>PUAN</Text>

            {displayScore > 0 && !scoreSavedOrDeclined ? (
              <View style={styles.savePromptContainer}>
                <Text style={styles.savePromptText}>Skorunu kaydetmek ister misin?</Text>
                <View style={styles.savePromptButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.flexBtn, { marginRight: 5 }]} onPress={saveScoreToLeaderboard}>
                    <Text style={styles.modalBtnText}>EVET</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGray, styles.flexBtn, { marginLeft: 5 }]} onPress={declineScore}>
                    <Text style={styles.modalBtnText}>HAYIR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                  <TouchableOpacity style={[styles.modalBtn, { flex: 1, marginRight: 5 }]} onPress={playAgain}>
                    <Text style={styles.modalBtnText}>TEKRAR OYNA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGray, { flex: 1, marginLeft: 5 }]} onPress={() => goTo('menu')}>
                    <Text style={styles.modalBtnText}>MENÜ</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#FF9800' }]} onPress={() => setGamePhase('name')}>
                  <Text style={styles.modalBtnText}>İSMİ DEĞİŞTİR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ==================== SCORES SCREEN ====================
function ScoresScreen({ goTo, gc }) {
  const styles = useMemo(() => getStyles(gc), [gc]);
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
    <ImageBackground source={BackgroundImage} style={[styles.scoresScreen, { backgroundColor: '#1E0C06' }]} resizeMode="contain">
      <View style={styles.scoresOverlay}>
        <Text style={styles.scoresTitle}>🏆 Liderlik Tablosu</Text>

        <View style={styles.scoresList}>
          {loading ? (
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          ) : scores.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={BeanImage} style={styles.emptyIcon} resizeMode="contain" />
              <Text style={styles.emptyText}>Henüz skor yok!</Text>
              <Text style={styles.emptySubtext}>İlk olmak için oyna!</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              delaysContentTouches={false}
              {...(Platform.OS === 'web' ? { dataSet: { allowScroll: true } } : {})}
            >
              {scores.map((item, index) => (
                <View key={index} style={[
                  styles.scoreRow,
                  index === 0 && styles.scoreRowGold,
                  index === 1 && styles.scoreRowSilver,
                  index === 2 && styles.scoreRowBronze
                ]}>
                  <Text style={styles.scoreMedal}>{item.name === 'Barkev' ? '👑' : (medals[index] || '🏅')}</Text>
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreName}>
                      {item.name}
                      {index >= 10 ? ' 💀' : ''}
                    </Text>
                    <Text style={styles.scoreDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.scoreNum,
                    index === 0 && styles.scoreNumGold,
                    index === 1 && styles.scoreNumSilver,
                    index === 2 && styles.scoreNumBronze
                  ]}>
                    {item.score}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => goTo('menu')}>
          <Text style={styles.backBtnText}>← GERİ</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// ==================== DYNAMIC STYLES FACTORY ====================
function getStyles(gc) {
  const {
    GAME_WIDTH, GAME_HEIGHT, scale, PADDING, GAP, CELL, BOARD_BORDER,
    BOARD_WIDTH, BOARD_HEIGHT, CONTROLS_HEIGHT,
    CONTROLS_PADDING_TOP, CONTROLS_PADDING_BOTTOM,
  } = gc;
  const sidePad = Math.round(10 * scale);

  return StyleSheet.create({
    // Game area
    gameArea: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: '#1E0C06',
      overflow: 'hidden',
    },
    playArea: {
      flex: 1,
      paddingTop: PADDING,
      paddingHorizontal: PADDING,
      justifyContent: 'center',
    },
    playRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      height: BOARD_HEIGHT,
    },

    // Board
    board: {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      borderWidth: BOARD_BORDER,
      borderColor: '#6D4C41',
      borderRadius: Math.round(8 * scale),
      backgroundColor: '#120604',
      overflow: 'hidden',
    },
    boardRow: {
      flexDirection: 'row',
    },
    cellEmpty: {
      width: CELL,
      height: CELL,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.05)',
    },

    // Score / next piece HUD, drawn inside the board
    hud: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: Math.round(CELL * 0.3),
    },
    hudCard: {
      backgroundColor: 'rgba(18,6,4,0.72)',
      borderWidth: 1,
      borderColor: 'rgba(255,143,0,0.55)',
      borderRadius: Math.round(10 * scale),
      paddingHorizontal: Math.round(CELL * 0.45),
      paddingVertical: Math.round(CELL * 0.2),
      alignItems: 'center',
    },
    hudLabel: {
      color: '#FFCC80',
      fontSize: Math.max(8, Math.round(CELL * 0.34)),
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    hudScore: {
      color: '#fff',
      fontWeight: 'bold',
      marginTop: Math.round(CELL * 0.08),
    },

    // Touch controls
    controls: {
      height: CONTROLS_HEIGHT,
      paddingTop: CONTROLS_PADDING_TOP,
      paddingBottom: CONTROLS_PADDING_BOTTOM,
      paddingHorizontal: PADDING,
      flexDirection: 'row',
      justifyContent: 'space-between',
      // Bottom-aligned so the arrows sit on the same line as the boost button
      alignItems: 'flex-end',
    },

    // Modals
    modalBg: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    modalBgTransparent: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    readyText: {
      fontSize: Math.round(48 * scale),
      fontWeight: 'bold',
      color: '#fff',
      textShadowColor: '#000',
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 6,
      marginBottom: Math.round(15 * scale),
    },
    readySubText: {
      fontSize: Math.round(20 * scale),
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
      paddingHorizontal: PADDING,
      textShadowColor: '#000',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    modalBox: {
      backgroundColor: '#fff',
      borderRadius: Math.round(24 * scale),
      padding: Math.round(28 * scale),
      alignItems: 'center',
      width: '85%',
      maxWidth: Math.round(340 * scale),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 12,
    },
    savePromptContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: Math.round(10 * scale),
    },
    savePromptText: {
      fontSize: Math.round(16 * scale),
      marginBottom: Math.round(12 * scale),
      color: '#333',
      fontWeight: '600',
    },
    savePromptButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    flexBtn: {
      flex: 1,
    },
    modalIcon: {
      width: Math.round(80 * scale),
      height: Math.round(80 * scale),
      marginBottom: Math.round(15 * scale),
    },
    modalTitle: {
      fontSize: Math.round(24 * scale),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: Math.round(15 * scale),
    },
    modalInput: {
      width: '100%',
      borderWidth: 3,
      borderColor: '#E65100',
      borderRadius: Math.round(14 * scale),
      padding: Math.round(14 * scale),
      fontSize: Math.round(18 * scale),
      textAlign: 'center',
      marginBottom: Math.round(20 * scale),
      color: '#333',
      backgroundColor: '#FFF8E1',
    },
    modalBtn: {
      backgroundColor: '#4CAF50',
      paddingVertical: Math.round(15 * scale),
      borderRadius: Math.round(14 * scale),
      width: '100%',
      alignItems: 'center',
      marginBottom: Math.round(10 * scale),
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
      fontSize: Math.round(17 * scale),
      fontWeight: 'bold',
    },
    modalLink: {
      color: '#666',
      marginTop: Math.round(12 * scale),
      fontSize: Math.round(15 * scale),
    },
    gameOverText: {
      fontSize: Math.round(32 * scale),
      fontWeight: 'bold',
      color: '#D32F2F',
      marginBottom: Math.round(10 * scale),
    },
    highScoreText: {
      fontSize: Math.round(18 * scale),
      color: '#FF9800',
      fontWeight: 'bold',
      marginBottom: Math.round(10 * scale),
    },
    finalScoreNum: {
      fontSize: Math.round(64 * scale),
      fontWeight: 'bold',
      color: '#333',
    },
    finalScoreLabel: {
      fontSize: Math.round(14 * scale),
      color: '#666',
      marginBottom: Math.round(22 * scale),
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
      padding: Math.round(20 * scale),
    },
    scoresTitle: {
      fontSize: Math.round(28 * scale),
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginVertical: Math.round(20 * scale),
      textShadowColor: '#000',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    scoresList: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: Math.round(18 * scale),
      padding: Math.round(15 * scale),
    },
    loadingText: {
      textAlign: 'center',
      color: '#795548',
      marginTop: 50,
      fontSize: Math.round(16 * scale),
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyIcon: {
      width: Math.round(70 * scale),
      height: Math.round(70 * scale),
      opacity: 0.5,
      marginBottom: Math.round(15 * scale),
    },
    emptyText: {
      fontSize: Math.round(20 * scale),
      color: '#795548',
      fontWeight: 'bold',
    },
    emptySubtext: {
      fontSize: Math.round(14 * scale),
      color: '#A1887F',
      marginTop: 5,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: Math.round(14 * scale),
      borderRadius: Math.round(14 * scale),
      marginBottom: Math.round(10 * scale),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    scoreRowGold: {
      borderWidth: 2,
      borderColor: '#FFD700',
      backgroundColor: '#FFFDE7',
    },
    scoreRowSilver: {
      borderWidth: 2,
      borderColor: '#B0BEC5',
      backgroundColor: '#ECEFF1',
    },
    scoreRowBronze: {
      borderWidth: 2,
      borderColor: '#CD7F32',
      backgroundColor: '#EFEBE9',
    },
    scoreMedal: {
      fontSize: Math.round(30 * scale),
      marginRight: Math.round(14 * scale),
      width: Math.round(44 * scale),
      textAlign: 'center',
    },
    scoreInfo: {
      flex: 1,
    },
    scoreName: {
      fontSize: Math.round(17 * scale),
      fontWeight: 'bold',
      color: '#4E342E',
    },
    scoreDate: {
      fontSize: Math.round(11 * scale),
      color: '#A1887F',
      marginTop: 3,
    },
    scoreNum: {
      fontSize: Math.round(24 * scale),
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    scoreNumGold: {
      fontSize: Math.round(28 * scale),
      color: '#FF9800',
    },
    scoreNumSilver: {
      fontSize: Math.round(28 * scale),
      color: '#607D8B',
    },
    scoreNumBronze: {
      fontSize: Math.round(28 * scale),
      color: '#8D6E63',
    },
    backBtn: {
      backgroundColor: '#795548',
      paddingVertical: Math.round(15 * scale),
      borderRadius: Math.round(14 * scale),
      alignItems: 'center',
      marginTop: Math.round(15 * scale),
    },
    backBtnText: {
      color: '#fff',
      fontSize: Math.round(17 * scale),
      fontWeight: 'bold',
    },
  });
}

<template>
  <div class="board-container">

    <!-- En-tête : badges joueurs -->
    <div class="players-bar">
      <div class="player-badge" :class="{ active: currentPlayer === 'X', winner: winner === 'X' }">
        <div class="badge-icon">
          <svg viewBox="0 0 100 100" width="20" height="20">
            <line x1="22" y1="22" x2="78" y2="78" stroke="#f25f5c" stroke-width="12" stroke-linecap="round"/>
            <line x1="78" y1="22" x2="22" y2="78" stroke="#f25f5c" stroke-width="12" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="badge-text">
          <span class="badge-name">Joueur X</span>
          <span class="badge-status">
            <span v-if="winner === 'X'">🏆 gagne !</span>
            <span v-else-if="currentPlayer === 'X' && !winner && !isDraw" class="dot-pulse x-dot" />
            <span v-else class="badge-waiting">—</span>
          </span>
        </div>
      </div>

      <div class="vs-label">VS</div>

      <div class="player-badge" :class="{ active: currentPlayer === 'O', winner: winner === 'O' }">
        <div class="badge-icon">
          <svg viewBox="0 0 100 100" width="20" height="20">
            <circle cx="50" cy="50" r="34" fill="none" stroke="#7f5af0" stroke-width="12"/>
          </svg>
        </div>
        <div class="badge-text">
          <span class="badge-name">Joueur O</span>
          <span class="badge-status">
            <span v-if="winner === 'O'">🏆 gagne !</span>
            <span v-else-if="currentPlayer === 'O' && !winner && !isDraw" class="dot-pulse o-dot" />
            <span v-else class="badge-waiting">—</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Grille -->
    <div class="grid">
      <!-- Lignes du plateau SVG -->
      <svg class="grid-lines" viewBox="0 0 3 3" preserveAspectRatio="none">
        <line x1="1" y1="0.06" x2="1" y2="2.94" stroke="var(--border)" stroke-width="0.04" stroke-linecap="round"/>
        <line x1="2" y1="0.06" x2="2" y2="2.94" stroke="var(--border)" stroke-width="0.04" stroke-linecap="round"/>
        <line x1="0.06" y1="1" x2="2.94" y2="1" stroke="var(--border)" stroke-width="0.04" stroke-linecap="round"/>
        <line x1="0.06" y1="2" x2="2.94" y2="2" stroke="var(--border)" stroke-width="0.04" stroke-linecap="round"/>
      </svg>

      <!-- Cellules -->
      <div
        v-for="(cell, index) in board"
        :key="index"
        class="cell"
        :class="{
          'cell--taken': cell !== null,
          'cell--hover-x': cell === null && currentPlayer === 'X' && !winner && !isDraw,
          'cell--hover-o': cell === null && currentPlayer === 'O' && !winner && !isDraw,
          'cell--winning': winningCells.includes(index),
        }"
        @click="handleClick(index)"
      >
        <PlayerX v-if="cell === 'X'" :ref="el => setRef(el, index)" :size="cellSymbolSize" />
        <PlayerO v-if="cell === 'O'" :ref="el => setRef(el, index)" :size="cellSymbolSize" />
      </div>

      <!-- Ligne de victoire -->
      <svg v-if="winLine" class="win-line-svg" viewBox="0 0 3 3" preserveAspectRatio="none">
        <line
          :x1="winLine.x1" :y1="winLine.y1"
          :x2="winLine.x2" :y2="winLine.y2"
          :stroke="winner === 'X' ? '#f25f5c' : '#7f5af0'"
          stroke-width="0.12"
          stroke-linecap="round"
          class="win-line"
        />
      </svg>
    </div>

    <!-- Message résultat -->
    <Transition name="result-fade">
      <div v-if="winner || isDraw" class="result-banner" :class="{ 'result-draw': isDraw }">
        <span v-if="isDraw">Match nul</span>
        <span v-else>Joueur {{ winner }} gagne !</span>
      </div>
    </Transition>

    <!-- Bouton rejouer -->
    <button class="reset-btn" @click="resetGame">rejouer</button>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import PlayerX from './PlayerX.vue'
import PlayerO from './PlayerO.vue'

// ── État ──────────────────────────────────────────────
const board = ref(Array(9).fill(null))
const currentPlayer = ref('X')
const winner = ref(null)
const isDraw = ref(false)
const symbolRefs = ref({})

const cellSymbolSize = 72

// ── Références dynamiques ─────────────────────────────
function setRef(el, index) {
  if (el) symbolRefs.value[index] = el
}

// ── Logique victoire ──────────────────────────────────
const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8], // lignes
  [0,3,6],[1,4,7],[2,5,8], // colonnes
  [0,4,8],[2,4,6],         // diagonales
]

// Lignes de victoire : coordonnées SVG (grille 3×3, centre de chaque cellule)
const WIN_LINES_COORDS = {
  '0,1,2': { x1:0.5, y1:0.5, x2:2.5, y2:0.5 },
  '3,4,5': { x1:0.5, y1:1.5, x2:2.5, y2:1.5 },
  '6,7,8': { x1:0.5, y1:2.5, x2:2.5, y2:2.5 },
  '0,3,6': { x1:0.5, y1:0.5, x2:0.5, y2:2.5 },
  '1,4,7': { x1:1.5, y1:0.5, x2:1.5, y2:2.5 },
  '2,5,8': { x1:2.5, y1:0.5, x2:2.5, y2:2.5 },
  '0,4,8': { x1:0.5, y1:0.5, x2:2.5, y2:2.5 },
  '2,4,6': { x1:2.5, y1:0.5, x2:0.5, y2:2.5 },
}

const winningCells = ref([])
const winLine = ref(null)

function checkWinner(b) {
  for (const pattern of WIN_PATTERNS) {
    const [a, c, d] = pattern
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { player: b[a], pattern }
    }
  }
  return null
}

// ── Clic sur une cellule ──────────────────────────────
async function handleClick(index) {
  if (board.value[index] || winner.value || isDraw.value) return

  board.value[index] = currentPlayer.value

  // Attendre que Vue monte le composant avant d'animer
  await nextTick()
  symbolRefs.value[index]?.play()

  const result = checkWinner(board.value)
  if (result) {
    winner.value = result.player
    winningCells.value = result.pattern
    winLine.value = WIN_LINES_COORDS[result.pattern.join(',')]
    return
  }

  if (board.value.every(c => c !== null)) {
    isDraw.value = true
    return
  }

  currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
}

// ── Reset ─────────────────────────────────────────────
function resetGame() {
  board.value = Array(9).fill(null)
  currentPlayer.value = 'X'
  winner.value = null
  isDraw.value = false
  winningCells.value = []
  winLine.value = null
  symbolRefs.value = {}
}
</script>

<style scoped>
/* ── Variables ── */
:root {
  --x-color: #f25f5c;
  --o-color: #7f5af0;
  --border: #2a2a3e;
  --bg: #0a0a0f;
  --cell-bg: #0f0f1a;
}

/* ── Layout global ── */
.board-container {
  --x-color: #f25f5c;
  --o-color: #7f5af0;
  --border: #2a2a3e;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  background: #0a0a0f;
  min-height: 100vh;
  font-family: 'DM Mono', monospace;
}

/* ── Barre joueurs ── */
.players-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 360px;
  justify-content: space-between;
}

.player-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #1e1e2e;
  background: #12121a;
  transition: border-color 0.25s, box-shadow 0.25s;
  flex: 1;
}

.player-badge.active {
  border-color: var(--border);
  box-shadow: 0 0 0 1px #ffffff0a, inset 0 0 20px rgba(255,255,255,0.02);
}

.player-badge.winner {
  border-color: gold;
  box-shadow: 0 0 0 1px gold30;
}

.badge-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #1a1a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-name {
  font-size: 12px;
  font-weight: 500;
  color: #d0d0e0;
  letter-spacing: 0.05em;
}

.badge-status {
  font-size: 10px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 12px;
}

.badge-waiting { color: #333; }

.vs-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #333;
  flex-shrink: 0;
}

/* dot pulse */
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.65); }
}

.dot-pulse {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: pulseDot 1.1s ease-in-out infinite;
}

.x-dot { background: var(--x-color); }
.o-dot { background: var(--o-color); }

/* ── Grille ── */
.grid {
  position: relative;
  width: min(360px, 90vw);
  height: min(360px, 90vw);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.grid-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* ── Cellule ── */
.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s;
  border-radius: 4px;
}

.cell:hover:not(.cell--taken) {
  background: #ffffff04;
}

.cell--hover-x:not(.cell--taken)::after,
.cell--hover-o:not(.cell--taken)::after {
  content: '';
  position: absolute;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  opacity: 0.08;
  pointer-events: none;
  transition: opacity 0.2s;
}

.cell--hover-x:hover::after { background: var(--x-color); opacity: 0.15; }
.cell--hover-o:hover::after { background: var(--o-color); opacity: 0.15; }

.cell--winning {
  background: #ffffff06;
}

/* ── Ligne de victoire ── */
.win-line-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.win-line {
  stroke-dasharray: 4;
  stroke-dashoffset: 4;
  animation: drawWinLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes drawWinLine {
  from { stroke-dashoffset: 4; }
  to   { stroke-dashoffset: 0; }
}

/* ── Résultat ── */
.result-banner {
  font-family: 'Syne', 'DM Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #e8e8f0;
  letter-spacing: 0.06em;
  padding: 12px 28px;
  border-radius: 12px;
  border: 1px solid #2a2a3e;
  background: #12121a;
}

.result-draw {
  color: #888;
}

.result-fade-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.result-fade-enter-from   { opacity: 0; transform: translateY(8px) scale(0.96); }

/* ── Bouton reset ── */
.reset-btn {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: lowercase;
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid #1e1e2e;
  background: #12121a;
  color: #555;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.reset-btn:hover {
  border-color: #3a3a5a;
  color: #aaa;
  background: #14142a;
}
</style>
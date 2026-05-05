<template>
  <div class="card">
    <!-- En-tête -->
    <div class="card-top">
      <div class="logo">
        <svg viewBox="0 0 48 48" width="30" height="30">
          <line x1="6"  y1="16" x2="42" y2="16" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
          <line x1="6"  y1="32" x2="42" y2="32" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
          <line x1="16" y1="6"  x2="16" y2="42" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
          <line x1="32" y1="6"  x2="32" y2="42" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
          <line x1="8"  y1="8"  x2="14" y2="14" stroke="#f25f5c" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="14" y1="8"  x2="8"  y2="14" stroke="#f25f5c" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="24" cy="24" r="4" fill="none" stroke="#7f5af0" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="page-label">salle d'attente</span>
    </div>

    <!-- Avatar + statut joueur -->
    <div class="player-section">
      <div class="avatar-ring">
        <svg class="avatar-progress" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1a2e" stroke-width="3"/>
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="url(#progressGrad)"
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="CIRC"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 40 40)"
            style="transition: stroke-dashoffset 1s linear"
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#7f5af0"/>
              <stop offset="100%" stop-color="#c4b5fd"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="avatar">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <circle cx="20" cy="15" r="7" stroke="#7f5af0" stroke-width="2"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#7f5af0" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <div class="player-info">
        <span class="player-name">{{ playerName }}</span>
        <div class="status-badge">
          <span class="status-dot" />
          en ligne
        </div>
      </div>
    </div>

    <!-- Compte à rebours -->
    <div class="timer-block">
      <div class="timer-label">expiration de la session</div>
      <div class="timer-display" :class="{ urgent: isUrgent }">
        <div class="time-unit">
          <span class="time-value">{{ hours }}</span>
          <span class="time-sub">h</span>
        </div>
        <span class="time-sep" :class="{ blink: true }">:</span>
        <div class="time-unit">
          <span class="time-value">{{ minutes }}</span>
          <span class="time-sub">m</span>
        </div>
        <span class="time-sep" :class="{ blink: true }">:</span>
        <div class="time-unit">
          <span class="time-value">{{ seconds }}</span>
          <span class="time-sub">s</span>
        </div>
      </div>
      <!-- Barre de progression linéaire -->
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }" :class="{ urgent: isUrgent }" />
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"><span>en attente d'un adversaire</span></div>

    <!-- Slots joueurs -->
    <div class="slots">
      <!-- Joueur local (toi) -->
      <div class="slot slot--ready">
        <div class="slot-symbol">
          <svg viewBox="0 0 100 100" width="28" height="28">
            <line x1="22" y1="22" x2="78" y2="78" stroke="#f25f5c" stroke-width="10" stroke-linecap="round"/>
            <line x1="78" y1="22" x2="22" y2="78" stroke="#f25f5c" stroke-width="10" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="slot-info">
          <span class="slot-name">{{ playerName }}</span>
          <span class="slot-status ready">prêt</span>
        </div>
        <div class="slot-ping">
          <span class="ping-dot" /><span class="ping-dot" /><span class="ping-dot" />
        </div>
      </div>

      <!-- VS -->
      <div class="vs-center">
        <span class="vs-text">VS</span>
      </div>

      <!-- Slot adversaire (en attente) -->
      <div class="slot slot--waiting">
        <div class="slot-symbol ghost">
          <svg viewBox="0 0 100 100" width="28" height="28">
            <circle cx="50" cy="50" r="34" fill="none" stroke="#2a2a3e" stroke-width="10" stroke-linecap="round" stroke-dasharray="20 8"/>
          </svg>
        </div>
        <div class="slot-info">
          <span class="slot-name muted">adversaire</span>
          <span class="slot-status searching">
            <span class="search-dots">
              <span /><span /><span />
            </span>
            recherche…
          </span>
        </div>
      </div>
    </div>

    <!-- Code de partie -->
    <div class="room-code-block">
      <span class="room-code-label">code de partie</span>
      <div class="room-code">
        <span class="code-value">{{ roomCode }}</span>
        <button class="copy-btn" @click="copyCode" :class="{ copied }">
          <svg v-if="!copied" viewBox="0 0 20 20" width="14" height="14" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/>
            <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" width="14" height="14" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#1d9e75" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Actions (sans bouton inviter) -->
    <div class="actions">
      <button class="btn-cancel" @click="handleCancel" :disabled="isCancelling">
        <span v-if="isCancelling">annulation...</span>
        <span v-else>annuler</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreateGame, type CreateGameProps, type CreateGameEmits } from './CreateGame'

const props = withDefaults(defineProps<CreateGameProps>(), {
  playerName: 'Joueur_42',
  roomCode: 'XO-7F3K',
  duration: 3600
})

const emit = defineEmits<CreateGameEmits>()

const {
  CIRC,
  hours,
  minutes,
  seconds,
  progressPercent,
  progressOffset,
  isUrgent,
  copied,
  copyCode,
  isCancelling,
  handleCancel
} = useCreateGame(props, emit)
</script>

<style scoped>
@import './CreateGame.css';
</style>

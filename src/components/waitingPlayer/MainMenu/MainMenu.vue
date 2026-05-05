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
      <span class="page-label">menu principal</span>
    </div>

    <!-- Avatar + statut joueur -->
    <div class="player-section">
      <div class="avatar-ring">
        <div class="avatar">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <circle cx="20" cy="15" r="7" stroke="#7f5af0" stroke-width="2"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#7f5af0" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <div class="player-info">
        <span class="player-name">{{ username }}</span>
        <div class="status-badge">
          <span class="status-dot" />
          en ligne
        </div>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="main-actions">
      <button class="btn-primary" @click="$emit('join-game')">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 00-3 3v1h6v-1a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M16 8l-4 4m0 0l4 4m-4-4h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Rejoindre une partie
      </button>
      
      <button class="btn-secondary" @click="handleCreateGame" :disabled="isLoading">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
          <path d="M10 3v7m0 0v7m0-7h7m-7 0H3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        Créer une nouvelle partie
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainMenu, type MainMenuProps, type MainMenuEmits } from './MainMenu'

const props = withDefaults(defineProps<MainMenuProps>(), {
  username: 'Joueur_42'
})

const emit = defineEmits<MainMenuEmits>()

const { isLoading, handleCreateGame } = useMainMenu(props, emit)
</script>

<style scoped>
@import './MainMenu.css';
</style>

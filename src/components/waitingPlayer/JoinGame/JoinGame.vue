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
      <span class="page-label">rejoindre une partie</span>
    </div>

    <!-- Input pour le code de partie -->
    <div class="join-section">
      <div class="input-group">
        <label for="gameCode">code de partie</label>
        <input 
          id="gameCode"
          v-model="gameCode" 
          type="text" 
          placeholder="Entrez le code (ex: XO-7F3K)"
          class="game-input"
          @keyup.enter="handleJoin"
          :disabled="isLoading"
        />
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn-cancel" @click="$emit('back')" :disabled="isLoading">retour</button>
      <button class="btn-primary" @click="handleJoin" :disabled="!gameCode.trim() || isLoading">
        <span v-if="isLoading">recherche...</span>
        <span v-else>rejoindre</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJoinGame, type JoinGameProps, type JoinGameEmits } from './JoinGame'

const props = defineProps<JoinGameProps>()
const emit = defineEmits<JoinGameEmits>()

const { gameCode, isLoading, error, handleJoin } = useJoinGame(props, emit)
</script>

<style scoped>
@import './JoinGame.css';
</style>

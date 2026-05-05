<template>

  <div class="page">

    <!-- Fond : grille animée avec symboles qui apparaissent/disparaissent -->

    <div class="bg-grid" aria-hidden="true">

      <div v-for="i in 9" :key="i" class="bg-cell" :style="{ animationDelay: bgDelays[i-1] }">

        <svg viewBox="0 0 100 100" width="100%" height="100%">

          <template v-if="bgSymbols[i-1] === 'X'">

            <line x1="25" y1="25" x2="75" y2="75" stroke="#f25f5c" stroke-width="6" stroke-linecap="round" opacity="0.12"/>

            <line x1="75" y1="25" x2="25" y2="75" stroke="#f25f5c" stroke-width="6" stroke-linecap="round" opacity="0.12"/>

          </template>

          <template v-else>

            <circle cx="50" cy="50" r="28" fill="none" stroke="#7f5af0" stroke-width="6" opacity="0.12"/>

          </template>

        </svg>

      </div>

      <svg class="bg-lines" viewBox="0 0 3 3" preserveAspectRatio="none">

        <line x1="1" y1="0" x2="1" y2="3" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="2" y1="0" x2="2" y2="3" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="0" y1="1" x2="3" y2="1" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="0" y1="2" x2="3" y2="2" stroke="#1a1a2e" stroke-width="0.04"/>

      </svg>

    </div>



    <!-- Menu principal -->

    <MainMenu 

      v-if="currentView === 'menu'"

      :username="username"

      :user-id="userId"

      @join-game="showJoinGame"

      @create-game="showCreateGame"

    />



    <!-- Rejoindre une partie -->

    <JoinGame 

      v-else-if="currentView === 'join'"

      @back="backToMenu"

      @join="joinGame"

    />



    <!-- Créer une partie -->

    <CreateGame 

      v-else-if="currentView === 'create'"

      :username="username"

      :room-code="roomCode"

      :duration="duration"

      :user-id="userId"

      @cancel="$emit('cancel')"

      @expired="$emit('expired')"

    />

  </div>

</template>



<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue'

import MainMenu from './MainMenu/MainMenu.vue'

import JoinGame from './JoinGame/JoinGame.vue'

import CreateGame from './CreateGame/CreateGame.vue'



const props = defineProps({

  username:    { type: String, default: 'Joueur_42' },

  roomCode:   { type: String, default: 'XO-7F3K' },

  /** Durée totale en secondes (défaut 1h = 3600) */

  duration:   { type: Number, default: 3600 },

  userId:     { type: String, required: true },

})



const emit = defineEmits(['cancel', 'expired', 'invite', 'join'])



// ── Timer ─────────────────────────────────────────────

const remaining = ref(props.duration)



let interval: NodeJS.Timeout | null = null



onMounted(() => {

  interval = setInterval(() => {

    if (remaining.value <= 0) {

      if (interval) clearInterval(interval)

      emit('expired')

      return

    }

    remaining.value--

  }, 1000)

})



onUnmounted(() => {

  if (interval) clearInterval(interval)

})



// ── Gestion des vues ───────────────────────────────────

type ViewMode = 'menu' | 'join' | 'create'



const currentView = ref<ViewMode>('menu')

const inputGameCode = ref('')



function showJoinGame() {

  currentView.value = 'join'

  inputGameCode.value = ''

}



function showCreateGame() {

  currentView.value = 'create'

  // Démarrer le timer seulement quand on crée une partie

  startTimer()

}



function backToMenu() {

  currentView.value = 'menu'

  stopTimer()

}



function joinGame(code: string) {

  if (code) {

    emit('join', code)

    // Logique pour rejoindre une partie existante

    console.log('Rejoindre la partie avec le code:', code)

  }

}



function startTimer() {

  if (interval) return

  interval = setInterval(() => {

    if (remaining.value <= 0) {

      if (interval) clearInterval(interval)

      emit('expired')

      return

    }

    remaining.value--

  }, 1000)

}



function stopTimer() {

  if (interval) {

    clearInterval(interval)

    interval = null

  }

}



// ── Fond décoratif ─────────────────────────────────────

const bgSymbols = ['X','O','X','O','X','O','X','O','X']

const bgDelays  = ['0.1s','0.4s','0.7s','0.3s','0.6s','0.2s','0.5s','0.15s','0.45s']

</script>



<style scoped>

@import './WaitingMain.css';

</style>
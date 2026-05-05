<template>

  <div class="page">



    <!-- Grille de fond animée -->

    <div class="bg-grid" aria-hidden="true">

      <div

        v-for="i in 9"

        :key="i"

        class="bg-cell"

        :class="`bg-cell--${i}`"

      >

        <svg viewBox="0 0 100 100" width="100%" height="100%">

          <component

            :is="bgSymbols[i - 1] === 'X' ? 'g' : 'g'"

          >

            <template v-if="bgSymbols[i - 1] === 'X'">

              <line x1="25" y1="25" x2="75" y2="75" stroke="#f25f5c" stroke-width="7" stroke-linecap="round" opacity="0.18"/>

              <line x1="75" y1="25" x2="25" y2="75" stroke="#f25f5c" stroke-width="7" stroke-linecap="round" opacity="0.18"/>

            </template>

            <template v-else-if="bgSymbols[i - 1] === 'O'">

              <circle cx="50" cy="50" r="28" fill="none" stroke="#7f5af0" stroke-width="7" opacity="0.18"/>

            </template>

          </component>

        </svg>

      </div>

      <!-- Lignes de grille bg -->

      <svg class="bg-lines" viewBox="0 0 3 3" preserveAspectRatio="none">

        <line x1="1" y1="0" x2="1" y2="3" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="2" y1="0" x2="2" y2="3" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="0" y1="1" x2="3" y2="1" stroke="#1a1a2e" stroke-width="0.04"/>

        <line x1="0" y1="2" x2="3" y2="2" stroke="#1a1a2e" stroke-width="0.04"/>

      </svg>

    </div>



    <!-- Carte de connexion -->

    <div class="card" :class="{ 'card--shake': shaking }">



      <!-- Logo / Titre -->

      <div class="card-header">

        <div class="logo">

          <svg viewBox="0 0 48 48" width="36" height="36">

            <line x1="6" y1="16" x2="42" y2="16" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>

            <line x1="6" y1="32" x2="42" y2="32" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>

            <line x1="16" y1="6" x2="16" y2="42" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>

            <line x1="32" y1="6" x2="32" y2="42" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>

            <!-- X en haut gauche -->

            <line x1="8"  y1="8"  x2="14" y2="14" stroke="#f25f5c" stroke-width="2.5" stroke-linecap="round"/>

            <line x1="14" y1="8"  x2="8"  y2="14" stroke="#f25f5c" stroke-width="2.5" stroke-linecap="round"/>

            <!-- O au centre -->

            <circle cx="24" cy="24" r="4" fill="none" stroke="#7f5af0" stroke-width="2.5"/>

          </svg>

        </div>

        <div>

          <h1 class="title">Morpion</h1>

          <p class="subtitle">entre ton nom</p>

        </div>

      </div>



      <!-- Formulaire -->

      <div class="form">

        <!-- Champ username -->

        <div class="field">

          <label class="field-label" for="username">nom d'utilisateur</label>

          <div class="field-input-wrap" :class="{ focused: focused === 'username', error: errors.username }">

            <svg class="field-icon" viewBox="0 0 20 20" width="16" height="16" fill="none">

              <circle cx="10" cy="7" r="3.5" stroke="currentColor" stroke-width="1.4"/>

              <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>

            </svg>

            <input

              id="username"

              v-model="form.username"

              type="text"

              placeholder="ton_pseudo"

              autocomplete="username"

              @focus="focused = 'username'"

              @blur="focused = null; validateField()"

              @keydown.enter="submit"

              maxlength="255"

            />

          </div>

          <span v-if="errors.username" class="field-error">{{ errors.username }}</span>

        </div>



        <!-- Bouton submit -->

        <button

          class="submit-btn"

          :class="{ loading: isLoading, success: isSuccess }"

          :disabled="isLoading || isSuccess || !form.username.trim()"

          @click="submit"

        >

          <span v-if="isSuccess" class="btn-inner">

            <svg viewBox="0 0 20 20" width="16" height="16" fill="none">

              <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

            </svg>

            prêt !

          </span>

          <span v-else-if="isLoading" class="btn-inner">

            <span class="spinner" />

          </span>

          <span v-else class="btn-inner">

            jouer

          </span>

        </button>



      </div>



      <!-- Info -->

      <div class="info-section">

        <p>Un nouveau joueur sera créé à chaque partie</p>

      </div>



    </div>

  </div>

</template>



<script setup lang="ts">

import { useLoginMain } from './LoginMainScript'



const emit = defineEmits(['login'])



const {

  form,

  errors,

  focused,

  isLoading,

  isSuccess,

  shaking,

  bgSymbols,

  validateField,

  validateAll,

  submit,

  triggerShake

} = useLoginMain(emit)

</script>



<style scoped>

@import './LoginMainStyle.css';

</style>
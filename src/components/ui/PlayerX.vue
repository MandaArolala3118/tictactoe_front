<template>
  <div class="x-wrapper" :class="{ visible: isVisible }">
    <svg
      class="x-svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f25f5c" />
          <stop offset="100%" stop-color="#ffb997" />
        </linearGradient>
      </defs>

      <!-- Glow lignes (derrière) -->
      <line class="x-glow" x1="22" y1="22" x2="78" y2="78" stroke="#f25f5c" stroke-width="14" stroke-linecap="round" />
      <line class="x-glow" x1="78" y1="22" x2="22" y2="78" stroke="#f25f5c" stroke-width="14" stroke-linecap="round" />

      <!-- Trait 1 : haut-gauche → bas-droite -->
      <line
        ref="line1Ref"
        class="x-line"
        x1="22" y1="22"
        x2="78" y2="78"
        stroke="url(#xGradient)"
        stroke-width="8"
        stroke-linecap="round"
      />

      <!-- Trait 2 : haut-droite → bas-gauche -->
      <line
        ref="line2Ref"
        class="x-line"
        x1="78" y1="22"
        x2="22" y2="78"
        stroke="url(#xGradient)"
        stroke-width="8"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  /**
   * Déclenche l'animation de dessin du X.
   * Passer à `true` pour jouer l'animation.
   */
  animate: {
    type: Boolean,
    default: false,
  },
  /** Taille du composant en pixels */
  size: {
    type: Number,
    default: 90,
  },
})

const line1Ref = ref(null)
const line2Ref = ref(null)
const isVisible = ref(false)

// Longueur diagonale d'une ligne de (22,22) à (78,78)
const LINE_LENGTH = Math.sqrt((78 - 22) ** 2 + (78 - 22) ** 2) // ~79.2

function playAnimation() {
  const l1 = line1Ref.value
  const l2 = line2Ref.value
  if (!l1 || !l2) return

  isVisible.value = false

  // Reset les deux lignes
  ;[l1, l2].forEach((l) => {
    l.style.transition = 'none'
    l.style.strokeDasharray = LINE_LENGTH
    l.style.strokeDashoffset = LINE_LENGTH
  })

  // Force reflow
  void l1.getBoundingClientRect()

  isVisible.value = true

  // Ligne 1 en premier
  l1.style.transition = 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  l1.style.strokeDashoffset = '0'

  // Ligne 2 légèrement décalée
  setTimeout(() => {
    l2.style.transition = 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    l2.style.strokeDashoffset = '0'
  }, 180)
}

onMounted(() => {
  if (props.animate) playAnimation()
})

watch(
  () => props.animate,
  (val) => { if (val) playAnimation() }
)

defineExpose({ play: playAnimation })
</script>

<style scoped>
.x-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind('size + "px"');
  height: v-bind('size + "px"');
}

.x-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.x-glow {
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.4s ease 0.1s;
}

.x-wrapper.visible .x-glow {
  opacity: 0.18;
}

.x-line {
  stroke-dasharray: v-bind('LINE_LENGTH + "px"');
  stroke-dashoffset: v-bind('LINE_LENGTH + "px"');
}
</style>
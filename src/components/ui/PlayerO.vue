<template>
  <div class="o-wrapper" :class="{ visible: isVisible }">
    <svg
      class="o-svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="oGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7f5af0" />
          <stop offset="100%" stop-color="#c4b5fd" />
        </linearGradient>
      </defs>

      <!-- Glow ring (derrière) -->
      <circle
        class="o-glow"
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="#7f5af0"
        stroke-width="14"
      />

      <!-- Anneau principal animé -->
      <circle
        ref="ringRef"
        class="o-ring"
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="url(#oGradient)"
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
   * Déclenche l'animation de dessin du O.
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

const ringRef = ref(null)
const isVisible = ref(false)

const CIRCUMFERENCE = 2 * Math.PI * 34 // ~213.6

function playAnimation() {
  const ring = ringRef.value
  if (!ring) return

  isVisible.value = false
  ring.style.strokeDasharray = CIRCUMFERENCE
  ring.style.strokeDashoffset = CIRCUMFERENCE

  // Force reflow
  void ring.getBoundingClientRect()

  isVisible.value = true
  ring.style.transition = 'stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1)'
  ring.style.strokeDashoffset = '0'
}

// Joue l'animation dès le montage si `animate` est vrai
onMounted(() => {
  if (props.animate) {
    playAnimation()
  }
})

// Rejoue l'animation chaque fois que `animate` passe à true
watch(
  () => props.animate,
  (val) => {
    if (val) playAnimation()
  }
)

// Expose pour usage via ref parent : monRef.value.play()
defineExpose({ play: playAnimation })
</script>

<style scoped>
.o-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind('size + "px"');
  height: v-bind('size + "px"');
}

.o-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Glow flou derrière l'anneau */
.o-glow {
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.4s ease 0.1s;
}

.o-wrapper.visible .o-glow {
  opacity: 0.18;
}

/* Anneau principal — état initial masqué */
.o-ring {
  stroke-dasharray: v-bind('CIRCUMFERENCE + "px"');
  stroke-dashoffset: v-bind('CIRCUMFERENCE + "px"');
}
</style>
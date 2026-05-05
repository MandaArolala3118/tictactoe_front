import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  playerName: { type: String, default: 'Joueur_42' },
  roomCode:   { type: String, default: 'XO-7F3K' },
  /** Durée totale en secondes (défaut 1h = 3600) */
  duration:   { type: Number, default: 3600 },
})

const emit = defineEmits(['cancel', 'expired', 'invite'])

// ── Timer ─────────────────────────────────────────────
const remaining = ref(props.duration)
const CIRC = 2 * Math.PI * 34 // ~213.6

const hours   = computed(() => String(Math.floor(remaining.value / 3600)).padStart(2, '0'))
const minutes = computed(() => String(Math.floor((remaining.value % 3600) / 60)).padStart(2, '0'))
const seconds = computed(() => String(remaining.value % 60).padStart(2, '0'))

const progressPercent = computed(() => (remaining.value / props.duration) * 100)
const progressOffset  = computed(() => CIRC * (1 - remaining.value / props.duration))
const isUrgent        = computed(() => remaining.value <= 300) // 5 dernières minutes

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

// ── Copier le code ────────────────────────────────────
const copied = ref(false)
function copyCode() {
  navigator.clipboard?.writeText(props.roomCode)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ── Partager ──────────────────────────────────────────
function shareInvite() {
  emit('invite', props.roomCode)
}

// ── Fond décoratif ─────────────────────────────────────
const bgSymbols = ['X','O','X','O','X','O','X','O','X']
const bgDelays  = ['0.1s','0.4s','0.7s','0.3s','0.6s','0.2s','0.5s','0.15s','0.45s']

export {
  props,
  emit,
  remaining,
  CIRC,
  hours,
  minutes,
  seconds,
  progressPercent,
  progressOffset,
  isUrgent,
  copied,
  copyCode,
  shareInvite,
  bgSymbols,
  bgDelays
}

// Export individual prop values for template access
export const playerName = computed(() => props.playerName)
export const roomCode = computed(() => props.roomCode)

import { ref, computed, onMounted, onUnmounted } from 'vue'
import InvitationService from '../../../services/invitationService'

export interface CreateGameProps {
  playerName?: string
  roomCode?: string
  duration?: number
  userId?: string
}

export interface CreateGameEmits {
  (e: 'cancel'): void
  (e: 'expired'): void
}

export function useCreateGame(props: CreateGameProps, emit: CreateGameEmits) {
  const duration = props.duration || 3600
  
  // Timer
  const remaining = ref(duration)
  const CIRC = 2 * Math.PI * 34 // ~213.6

  const hours = computed(() => String(Math.floor(remaining.value / 3600)).padStart(2, '0'))
  const minutes = computed(() => String(Math.floor((remaining.value % 3600) / 60)).padStart(2, '0'))
  const seconds = computed(() => String(remaining.value % 60).padStart(2, '0'))

  const progressPercent = computed(() => (remaining.value / duration) * 100)
  const progressOffset = computed(() => CIRC * (1 - remaining.value / duration))
  const isUrgent = computed(() => remaining.value <= 300) // 5 dernières minutes

  let interval: number | null = null

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

  // Copier le code
  const copied = ref(false)
  function copyCode() {
    navigator.clipboard?.writeText(props.roomCode || 'XO-7F3K')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }

  // Annuler et supprimer l'invitation
  const isCancelling = ref(false)
  async function handleCancel() {
    if (!props.roomCode || !props.userId) {
      emit('cancel')
      return
    }

    try {
      isCancelling.value = true
      
      // Récupérer l'invitation par game key
      const invitation = await InvitationService.getByGameKey(props.roomCode)
      
      if (invitation && invitation.id) {
        // Supprimer l'invitation
        await InvitationService.delete(invitation.id)
        console.log('Invitation supprimée avec succès')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invitation:', error)
      // Continuer quand même avec l'annulation même si la suppression échoue
    } finally {
      isCancelling.value = false
      emit('cancel')
    }
  }

  // Lifecycle
  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    // Timer
    remaining,
    CIRC,
    hours,
    minutes,
    seconds,
    progressPercent,
    progressOffset,
    isUrgent,
    
    // Actions
    copied,
    copyCode,
    isCancelling,
    handleCancel,
    startTimer,
    stopTimer
  }
}

import { ref } from 'vue'
import InvitationService from '../../../services/invitationService'

export interface JoinGameProps {
  // Pas de props requis pour le moment
}

export interface JoinGameEmits {
  (e: 'back'): void
  (e: 'join', code: string): void
}

export function useJoinGame(_props: JoinGameProps, emit: JoinGameEmits) {
  const gameCode = ref('')
  const isLoading = ref(false)
  const error = ref('')

  async function handleJoin() {
    const code = gameCode.value.trim()
    if (!code) return

    try {
      isLoading.value = true
      error.value = ''
      
      // Vérifier si l'invitation existe avec getByGameKey
      const invitation = await InvitationService.getByGameKey(code)
      
      if (invitation) {
        emit('join', code)
      }
    } catch (err) {
      error.value = 'Code de partie invalide ou expiré'
      console.error('Erreur lors de la vérification du code:', err)
    } finally {
      isLoading.value = false
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleJoin()
    }
  }

  return {
    gameCode,
    isLoading,
    error,
    handleJoin,
    handleKeyPress
  }
}

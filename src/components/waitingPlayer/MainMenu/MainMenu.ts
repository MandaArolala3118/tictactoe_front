import { ref } from 'vue'
import InvitationService from '../../../services/invitationService'

export interface MainMenuProps {
  username?: string
  userId: string
}

export interface MainMenuEmits {
  (e: 'join-game'): void
  (e: 'create-game', gameKey: string): void
}

export function useMainMenu(props: MainMenuProps, emit: MainMenuEmits) {
  const isLoading = ref(false)

  async function handleCreateGame() {
    try {
      isLoading.value = true
      
      // Générer une clé de jeu aléatoire
      const gameKey = generateGameKey()
      
      // Créer l'invitation avec la méthode createPartyGame
      await InvitationService.createPartyGame(gameKey, { id: props.userId })
      
      // Émettre l'événement avec la clé de jeu générée
      emit('create-game', gameKey)
    } catch (error) {
      console.error('Erreur lors de la création de la partie:', error)
      // TODO: Afficher une notification d'erreur à l'utilisateur
    } finally {
      isLoading.value = false
    }
  }

  function generateGameKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  return {
    isLoading,
    handleCreateGame
  }
}

import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private serverUrl = import.meta.env.VITE_SOCKET_URL;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      this.socket.on('connect', () => {
        console.log('Connecté au WebSocket:', this.socket?.id)
        resolve()
      })

      this.socket.on('disconnect', () => {
        console.log('Déconnecté du WebSocket')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket:', error)
        reject(error)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Rejoindre la room d'un utilisateur
  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join-user-room', userId)
    }
  }

  // Suivre une invitation spécifique
  trackInvitation(gameKey: string): void {
    if (this.socket) {
      this.socket.emit('track-invitation', gameKey)
    }
  }

  // Écouter les événements d'invitation créée
  onInvitationCreated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('invitation-created', callback)
    }
  }

  // Écouter les événements d'invitation mise à jour
  onInvitationUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('invitation-updated', callback)
    }
  }

  // Écouter les événements game-ready (quand une partie est prête)
  onGameReady(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('game-ready', callback)
    }
  }

  // Arrêter d'écouter un événement
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Obtenir l'ID de socket
  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

export default new WebSocketService()

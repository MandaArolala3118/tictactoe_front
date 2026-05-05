import type { Invitation, CreateInvitationRequest } from '../models';
import { InvitationModel } from '../models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class InvitationService {
  private static baseUrl = `${API_BASE_URL}/invitations`;


  // Obtenir une invitation par ID
  static async getById(id: string): Promise<InvitationModel> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invitation not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation = await response.json();
      return InvitationModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching invitation by ID:', error);
      throw error;
    }
  }

  // Obtenir une invitation par clé de jeu
  static async getByGameKey(gameKey: string): Promise<InvitationModel> {
    try {
      const response = await fetch(`${this.baseUrl}/key/${gameKey}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invitation not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation = await response.json();
      return InvitationModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching invitation by game key:', error);
      throw error;
    }
  }

  // Obtenir les invitations d'un utilisateur
  static async getByUser(userId: string): Promise<InvitationModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation[] = await response.json();
      return data.map(invitation => InvitationModel.fromAPI(invitation));
    } catch (error) {
      console.error('Error fetching invitations by user:', error);
      throw error;
    }
  }

  // Créer une nouvelle invitation
  static async create(invitationData: CreateInvitationRequest): Promise<InvitationModel> {
    try {
      // Validation des données
      const errors = InvitationModel.validate(invitationData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(InvitationModel.toAPI(invitationData)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation = await response.json();
      return InvitationModel.fromAPI(data);
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  // Mettre à jour une invitation
  static async update(id: string, invitationData: Partial<Invitation>): Promise<InvitationModel> {
    try {
      // Validation des données
      const errors = InvitationModel.validate(invitationData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(InvitationModel.toAPI(invitationData)),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invitation not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation = await response.json();
      return InvitationModel.fromAPI(data);
    } catch (error) {
      console.error('Error updating invitation:', error);
      throw error;
    }
  }

  // Supprimer une invitation
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invitation not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // No content returned on successful deletion
    } catch (error) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  }

  // Accepter une invitation
  static async accept(id: string): Promise<InvitationModel> {
    try {
      return await this.update(id, { status: 'accepted' });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Refuser une invitation
  static async decline(id: string): Promise<InvitationModel> {
    try {
      return await this.update(id, { status: 'declined' });
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  }

  // Marquer une invitation comme expirée
  static async expire(id: string): Promise<InvitationModel> {
    try {
      return await this.update(id, { status: 'expired' });
    } catch (error) {
      console.error('Error expiring invitation:', error);
      throw error;
    }
  }

  // Créer une invitation avec génération de clé
  static async createInvitation(fromUserId: string, gameId: string): Promise<InvitationModel> {
    try {
      const gameKey = this.generateGameKey();
      
      return await this.create({
        from_user_id: fromUserId,
        game_id: gameId,
        game_key: gameKey,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating invitation with key:', error);
      throw error;
    }
  }

  // Générer une clé de jeu unique
  private static generateGameKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Vérifier si une clé de jeu est disponible
  static async checkGameKeyAvailability(gameKey: string): Promise<boolean> {
    try {
      await this.getByGameKey(gameKey);
      return false; // Key exists
    } catch (error) {
      if (error instanceof Error && error.message === 'Invitation not found') {
        return true; // Key is available
      }
      throw error;
    }
  }

  // Créer une invitation pour une partie avec gameKey et user
  static async createPartyGame(gameKey: string, user: { id: string }): Promise<InvitationModel> {
    try {
      // Validation des paramètres
      if (!gameKey || typeof gameKey !== 'string' || gameKey.trim().length === 0) {
        throw new Error('Game key is required');
      }
      
      if (!user || !user.id) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`${this.baseUrl}/party`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameKey: gameKey.trim(),
          user: {
            id: user.id
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Invitation = await response.json();
      return InvitationModel.fromAPI(data);
    } catch (error) {
      console.error('Error creating party invitation:', error);
      throw error;
    }
  }
}

export default InvitationService;

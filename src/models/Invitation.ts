// Modèle Invitation pour le frontend
export interface Invitation {
  id: string;
  from_user_id: string;
  game_id: string;
  game_key: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export class InvitationModel implements Invitation {
  id: string;
  from_user_id: string;
  game_id: string;
  game_key: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;

  constructor(data: Invitation) {
    this.id = data.id;
    this.from_user_id = data.from_user_id;
    this.game_id = data.game_id;
    this.game_key = data.game_key;
    this.status = data.status;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation
  static validate(invitationData: Partial<Invitation>): string[] {
    const errors: string[] = [];
    
    if (!invitationData.from_user_id) {
      errors.push('From user ID is required');
    }
    if (!invitationData.game_id) {
      errors.push('Game ID is required');
    }
    if (!invitationData.game_key || invitationData.game_key.trim().length === 0) {
      errors.push('Game key is required');
    }
    if (invitationData.status && !['pending', 'accepted', 'declined', 'expired'].includes(invitationData.status)) {
      errors.push('Invalid status');
    }
    
    return errors;
  }

  // Formatage pour l'API
  static toAPI(invitationData: Partial<Invitation>): Partial<Invitation> {
    return {
      from_user_id: invitationData.from_user_id,
      game_id: invitationData.game_id,
      game_key: invitationData.game_key?.trim() || '',
      status: invitationData.status || 'pending',
      expires_at: invitationData.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
  }

  // Créer une instance depuis les données API
  static fromAPI(data: any): InvitationModel {
    return new InvitationModel(data);
  }

  // Vérifier si l'invitation est en attente
  get isPending(): boolean {
    return this.status === 'pending';
  }

  // Vérifier si l'invitation est acceptée
  get isAccepted(): boolean {
    return this.status === 'accepted';
  }

  // Vérifier si l'invitation est refusée
  get isDeclined(): boolean {
    return this.status === 'declined';
  }

  // Vérifier si l'invitation est expirée
  get isExpired(): boolean {
    return this.status === 'expired' || new Date() > new Date(this.expires_at);
  }

  // Vérifier si l'invitation est toujours valide
  get isValid(): boolean {
    return this.isPending && !this.isExpired;
  }

  // Obtenir le temps restant avant expiration
  get timeRemaining(): number {
    const now = new Date().getTime();
    const expires = new Date(this.expires_at).getTime();
    return Math.max(0, expires - now);
  }

  // Formater le temps restant
  get formattedTimeRemaining(): string {
    const remaining = this.timeRemaining;
    if (remaining === 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Less than 1m';
    }
  }

  // Formater la date de création
  get formattedCreatedAt(): string {
    return new Date(this.created_at).toLocaleString();
  }

  // Formater la date d'expiration
  get formattedExpiresAt(): string {
    return new Date(this.expires_at).toLocaleString();
  }
}

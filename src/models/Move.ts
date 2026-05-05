// Modèle Move pour le frontend
export interface Move {
  id: string;
  game_id: string;
  player_id: string;
  position: number;
  move_number: number;
  played_at: string;
  created_at: string;
  updated_at: string;
}

export class MoveModel implements Move {
  id: string;
  game_id: string;
  player_id: string;
  position: number;
  move_number: number;
  played_at: string;
  created_at: string;
  updated_at: string;

  constructor(data: Move) {
    this.id = data.id;
    this.game_id = data.game_id;
    this.player_id = data.player_id;
    this.position = data.position;
    this.move_number = data.move_number;
    this.played_at = data.played_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation
  static validate(moveData: Partial<Move>): string[] {
    const errors: string[] = [];
    
    if (!moveData.game_id) {
      errors.push('Game ID is required');
    }
    if (!moveData.player_id) {
      errors.push('Player ID is required');
    }
    if (moveData.position === undefined || moveData.position === null) {
      errors.push('Position is required');
    }
    if (moveData.position !== undefined && (moveData.position < 0 || moveData.position > 8)) {
      errors.push('Position must be between 0 and 8');
    }
    if (!moveData.move_number || moveData.move_number < 1) {
      errors.push('Move number must be greater than 0');
    }
    
    return errors;
  }

  // Formatage pour l'API
  static toAPI(moveData: Partial<Move>): Partial<Move> {
    return {
      game_id: moveData.game_id,
      player_id: moveData.player_id,
      position: moveData.position,
      move_number: moveData.move_number,
      played_at: moveData.played_at || new Date().toISOString()
    };
  }

  // Créer une instance depuis les données API
  static fromAPI(data: any): MoveModel {
    return new MoveModel(data);
  }

  // Obtenir la position sur le plateau (0-8 -> grille 3x3)
  get boardPosition(): { row: number; col: number } {
    return {
      row: Math.floor(this.position / 3),
      col: this.position % 3
    };
  }

  // Formater la date du mouvement
  get formattedDate(): string {
    return new Date(this.played_at).toLocaleString();
  }

  // Obtenir le symbole du joueur (X ou O basé sur le move_number)
  get playerSymbol(): 'X' | 'O' {
    return this.move_number % 2 === 1 ? 'X' : 'O';
  }
}

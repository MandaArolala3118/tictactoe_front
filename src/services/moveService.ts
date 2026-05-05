import type { Move, CreateMoveRequest, MoveFilters } from '../models';
import { MoveModel } from '../models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class MoveService {
  private static baseUrl = `${API_BASE_URL}/moves`;

  // Obtenir tous les mouvements
  static async getAll(): Promise<MoveModel[]> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Move[] = await response.json();
      return data.map(move => MoveModel.fromAPI(move));
    } catch (error) {
      console.error('Error fetching moves:', error);
      throw error;
    }
  }

  // Obtenir un mouvement par ID
  static async getById(id: string): Promise<MoveModel> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Move not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Move = await response.json();
      return MoveModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching move by ID:', error);
      throw error;
    }
  }

  // Obtenir les mouvements d'un jeu (triés par ordre)
  static async getByGame(gameId: string): Promise<MoveModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/game/${gameId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Move[] = await response.json();
      return data.map(move => MoveModel.fromAPI(move));
    } catch (error) {
      console.error('Error fetching moves by game:', error);
      throw error;
    }
  }

  // Créer un nouveau mouvement
  static async create(moveData: CreateMoveRequest): Promise<MoveModel> {
    try {
      // Validation des données
      const errors = MoveModel.validate(moveData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(MoveModel.toAPI(moveData)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Move = await response.json();
      return MoveModel.fromAPI(data);
    } catch (error) {
      console.error('Error creating move:', error);
      throw error;
    }
  }

  // Supprimer un mouvement
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Move not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // No content returned on successful deletion
    } catch (error) {
      console.error('Error deleting move:', error);
      throw error;
    }
  }

  // Jouer un mouvement (avec validation complète)
  static async playMove(gameId: string, playerId: string, position: number): Promise<MoveModel> {
    try {
      // Obtenir les mouvements existants pour déterminer le numéro du mouvement
      const existingMoves = await this.getByGame(gameId);
      const moveNumber = existingMoves.length + 1;

      const moveData: CreateMoveRequest = {
        game_id: gameId,
        player_id: playerId,
        position: position,
        move_number: moveNumber
      };

      return await this.create(moveData);
    } catch (error) {
      console.error('Error playing move:', error);
      throw error;
    }
  }

  // Vérifier si une position est déjà jouée
  static async isPositionPlayed(gameId: string, position: number): Promise<boolean> {
    try {
      const moves = await this.getByGame(gameId);
      return moves.some(move => move.position === position);
    } catch (error) {
      console.error('Error checking position:', error);
      throw error;
    }
  }

  // Obtenir le dernier mouvement d'un jeu
  static async getLastMove(gameId: string): Promise<MoveModel | null> {
    try {
      const moves = await this.getByGame(gameId);
      return moves.length > 0 ? moves[moves.length - 1] : null;
    } catch (error) {
      console.error('Error fetching last move:', error);
      throw error;
    }
  }

  // Obtenir le nombre de mouvements dans un jeu
  static async getMoveCount(gameId: string): Promise<number> {
    try {
      const moves = await this.getByGame(gameId);
      return moves.length;
    } catch (error) {
      console.error('Error counting moves:', error);
      throw error;
    }
  }

  // Obtenir les mouvements d'un joueur
  static async getByPlayer(playerId: string): Promise<MoveModel[]> {
    try {
      const moves = await this.getAll();
      return moves.filter(move => move.player_id === playerId);
    } catch (error) {
      console.error('Error fetching moves by player:', error);
      throw error;
    }
  }

  // Obtenir les mouvements d'un joueur dans un jeu spécifique
  static async getByPlayerInGame(gameId: string, playerId: string): Promise<MoveModel[]> {
    try {
      const moves = await this.getByGame(gameId);
      return moves.filter(move => move.player_id === playerId);
    } catch (error) {
      console.error('Error fetching player moves in game:', error);
      throw error;
    }
  }

  // Filtrer les mouvements
  static async filter(filters: MoveFilters): Promise<MoveModel[]> {
    try {
      let moves = await this.getAll();
      
      if (filters.game_id) {
        moves = moves.filter(move => move.game_id === filters.game_id);
      }
      
      if (filters.player_id) {
        moves = moves.filter(move => move.player_id === filters.player_id);
      }
      
      return moves;
    } catch (error) {
      console.error('Error filtering moves:', error);
      throw error;
    }
  }

  // Reconstruire l'état du plateau à partir des mouvements
  static async reconstructBoard(gameId: string): Promise<(string | null)[]> {
    try {
      const moves = await this.getByGame(gameId);
      const board = Array(9).fill(null);
      
      moves.forEach(move => {
        if (move.position >= 0 && move.position < 9) {
          board[move.position] = move.playerSymbol;
        }
      });
      
      return board;
    } catch (error) {
      console.error('Error reconstructing board:', error);
      throw error;
    }
  }

  // Valider un mouvement avant de le jouer
  static async validateMove(gameId: string, _playerId: string, position: number): Promise<string[]> {
    const errors: string[] = [];
    
    // Validation de position
    if (position < 0 || position > 8) {
      errors.push('Position must be between 0 and 8');
    }
    
    // Vérifier si la position est déjà jouée
    if (await this.isPositionPlayed(gameId, position)) {
      errors.push('Position already played');
    }
    
    return errors;
  }

  // Obtenir les mouvements récents (derniers N mouvements)
  static async getRecentMoves(gameId: string, count: number = 5): Promise<MoveModel[]> {
    try {
      const moves = await this.getByGame(gameId);
      return moves.slice(-count);
    } catch (error) {
      console.error('Error fetching recent moves:', error);
      throw error;
    }
  }

  // Calculer la durée d'un jeu
  static async getGameDuration(gameId: string): Promise<number> {
    try {
      const moves = await this.getByGame(gameId);
      
      if (moves.length === 0) {
        return 0;
      }
      
      const firstMove = moves[0];
      const lastMove = moves[moves.length - 1];
      
      return new Date(lastMove.played_at).getTime() - new Date(firstMove.played_at).getTime();
    } catch (error) {
      console.error('Error calculating game duration:', error);
      throw error;
    }
  }

  // Formater la durée d'un jeu
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}

export default MoveService;

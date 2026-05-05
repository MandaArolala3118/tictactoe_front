import type { Game, CreateGameRequest, GameFilters } from '../models';
import { GameModel } from '../models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class GameService {
  private static baseUrl = `${API_BASE_URL}/games`;

  // Obtenir tous les jeux
  static async getAll(): Promise<GameModel[]> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Game[] = await response.json();
      return data.map(game => GameModel.fromAPI(game));
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  // Obtenir un jeu par ID
  static async getById(id: string): Promise<GameModel> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Game = await response.json();
      return GameModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching game by ID:', error);
      throw error;
    }
  }

  // Obtenir les jeux d'un joueur
  static async getByPlayer(playerId: string): Promise<GameModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/player/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Game[] = await response.json();
      return data.map(game => GameModel.fromAPI(game));
    } catch (error) {
      console.error('Error fetching games by player:', error);
      throw error;
    }
  }

  // Créer un nouveau jeu
  static async create(gameData: CreateGameRequest): Promise<GameModel> {
    try {
      // Validation des données
      const errors = GameModel.validate(gameData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(GameModel.toAPI(gameData)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Game = await response.json();
      return GameModel.fromAPI(data);
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  // Mettre à jour un jeu
  static async update(id: string, gameData: Partial<Game>): Promise<GameModel> {
    try {
      // Validation des données
      const errors = GameModel.validate(gameData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(GameModel.toAPI(gameData)),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: Game = await response.json();
      return GameModel.fromAPI(data);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  // Supprimer un jeu
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // No content returned on successful deletion
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }

  // Joindre un jeu en tant que joueur O
  static async joinGame(gameId: string, playerId: string): Promise<GameModel> {
    try {
      const game = await this.getById(gameId);
      
      if (game.player_o_id) {
        throw new Error('Game is already full');
      }
      
      return await this.update(gameId, {
        player_o_id: playerId,
        status: 'playing'
      });
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  }

  // Quitter un jeu
  static async leaveGame(gameId: string, playerId: string): Promise<GameModel> {
    try {
      const game = await this.getById(gameId);
      
      if (game.player_x_id === playerId) {
        throw new Error('Player X cannot leave the game');
      }
      
      if (game.player_o_id !== playerId) {
        throw new Error('Player is not in this game');
      }
      
      return await this.update(gameId, {
        player_o_id: null,
        status: 'waiting'
      });
    } catch (error) {
      console.error('Error leaving game:', error);
      throw error;
    }
  }

  // Démarrer un jeu
  static async startGame(gameId: string): Promise<GameModel> {
    try {
      const game = await this.getById(gameId);
      
      if (!game.player_o_id) {
        throw new Error('Cannot start game without two players');
      }
      
      if (game.status !== 'waiting') {
        throw new Error('Game is already started or finished');
      }
      
      return await this.update(gameId, {
        status: 'playing',
        current_turn: 'X'
      });
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  // Filtrer les jeux
  static async filter(filters: GameFilters): Promise<GameModel[]> {
    try {
      let games = await this.getAll();
      
      if (filters.player_id) {
        games = games.filter(game => 
          game.player_x_id === filters.player_id || 
          game.player_o_id === filters.player_id
        );
      }
      
      if (filters.status) {
        games = games.filter(game => game.status === filters.status);
      }
      
      return games;
    } catch (error) {
      console.error('Error filtering games:', error);
      throw error;
    }
  }

  // Obtenir les jeux disponibles (en attente de joueur O)
  static async getAvailableGames(): Promise<GameModel[]> {
    try {
      const games = await this.getAll();
      return games.filter(game => game.status === 'waiting' && !game.player_o_id);
    } catch (error) {
      console.error('Error fetching available games:', error);
      throw error;
    }
  }

  // Obtenir les jeux en cours
  static async getActiveGames(): Promise<GameModel[]> {
    try {
      return await this.filter({ status: 'playing' });
    } catch (error) {
      console.error('Error fetching active games:', error);
      throw error;
    }
  }

  // Obtenir les jeux terminés
  static async getFinishedGames(): Promise<GameModel[]> {
    try {
      return await this.filter({ status: 'finished' });
    } catch (error) {
      console.error('Error fetching finished games:', error);
      throw error;
    }
  }
}

export default GameService;

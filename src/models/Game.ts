// Modèle Game pour le frontend
export interface GameState {
  board: (string | null)[];
  winner: string | null;
  isDraw: boolean;
}

export interface Game {
  id: string;
  player_x_id: string;
  player_o_id: string | null;
  state: GameState;
  current_turn: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export class GameModel implements Game {
  id: string;
  player_x_id: string;
  player_o_id: string | null;
  state: GameState;
  current_turn: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  created_at: string;
  updated_at: string;

  constructor(data: Game) {
    this.id = data.id;
    this.player_x_id = data.player_x_id;
    this.player_o_id = data.player_o_id;
    this.state = data.state;
    this.current_turn = data.current_turn;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation
  static validate(gameData: Partial<Game>): string[] {
    const errors: string[] = [];
    
    if (!gameData.player_x_id) {
      errors.push('Player X is required');
    }
    if (gameData.current_turn && !['X', 'O'].includes(gameData.current_turn)) {
      errors.push('Current turn must be X or O');
    }
    if (gameData.status && !['waiting', 'playing', 'finished', 'abandoned'].includes(gameData.status)) {
      errors.push('Invalid status');
    }
    
    return errors;
  }

  // Formatage pour l'API
  static toAPI(gameData: Partial<Game>): Partial<Game> {
    return {
      player_x_id: gameData.player_x_id,
      player_o_id: gameData.player_o_id || null,
      state: gameData.state || {
        board: Array(9).fill(null),
        winner: null,
        isDraw: false
      },
      current_turn: gameData.current_turn || 'X',
      status: gameData.status || 'waiting'
    };
  }

  // Créer une instance depuis les données API
  static fromAPI(data: any): GameModel {
    return new GameModel(data);
  }

  // Vérifier si le jeu est terminé
  get isFinished(): boolean {
    return this.status === 'finished' || this.status === 'abandoned';
  }

  // Vérifier si le jeu est en cours
  get isPlaying(): boolean {
    return this.status === 'playing';
  }

  // Vérifier si le jeu est en attente
  get isWaiting(): boolean {
    return this.status === 'waiting';
  }

  // Obtenir le symbole du joueur actuel
  get currentPlayerSymbol(): 'X' | 'O' {
    return this.current_turn;
  }

  // Vérifier si une position est valide
  isValidPosition(position: number): boolean {
    return position >= 0 && position < 9 && this.state.board[position] === null;
  }

  // Obtenir le gagnant
  get winner(): string | null {
    return this.state.winner;
  }

  // Vérifier si c'est un match nul
  get isDraw(): boolean {
    return this.state.isDraw;
  }
}

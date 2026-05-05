// Export tous les modèles pour le frontend
export type { User } from './User';
export { UserModel } from './User';
export type { Game, GameState } from './Game';
export { GameModel } from './Game';
export type { Move } from './Move';
export { MoveModel } from './Move';
export type { Invitation } from './Invitation';
export { InvitationModel } from './Invitation';

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Types pour les requêtes
export interface CreateUserRequest {
  username: string;
}

export interface CreateGameRequest {
  player_x_id: string;
  player_o_id?: string;
  state?: import('./Game').GameState;
  current_turn?: 'X' | 'O';
  status?: 'waiting' | 'playing' | 'finished' | 'abandoned';
}

export interface CreateMoveRequest {
  game_id: string;
  player_id: string;
  position: number;
  move_number: number;
}

export interface CreateInvitationRequest {
  from_user_id: string;
  game_id: string;
  game_key: string;
  status?: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: string;
}

// Types pour les filtres et options
export interface GameFilters {
  player_id?: string;
  status?: 'waiting' | 'playing' | 'finished' | 'abandoned';
}

export interface InvitationFilters {
  from_user_id?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'expired';
  game_key?: string;
}

export interface MoveFilters {
  game_id?: string;
  player_id?: string;
}

// Types utilitaires
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'abandoned';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type PlayerSymbol = 'X' | 'O';
export type BoardPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

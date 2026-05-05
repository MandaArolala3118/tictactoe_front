// Modèle User pour le frontend
export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export class UserModel implements User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;

  constructor(data: User) {
    this.id = data.id;
    this.username = data.username;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation
  static validate(userData: Partial<User>): string[] {
    const errors: string[] = [];
    
    if (!userData.username || userData.username.trim().length === 0) {
      errors.push('Username is required');
    }
    if (userData.username && userData.username.length > 255) {
      errors.push('Username too long (max 255 characters)');
    }
    
    return errors;
  }

  // Formatage pour l'API
  static toAPI(userData: Partial<User>): Partial<User> {
    return {
      username: userData.username?.trim()
    };
  }

  // Créer une instance depuis les données API
  static fromAPI(data: any): UserModel {
    return new UserModel(data);
  }
}

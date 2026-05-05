import type { User, CreateUserRequest } from '../models';
import { UserModel } from '../models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class UserService {
  private static baseUrl = `${API_BASE_URL}/users`;


  // Obtenir un utilisateur par ID
  static async getById(id: string): Promise<UserModel> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: User = await response.json();
      return UserModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Obtenir un utilisateur par username
  static async getByUsername(username: string): Promise<UserModel> {
    try {
      const response = await fetch(`${this.baseUrl}/username/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: User = await response.json();
      return UserModel.fromAPI(data);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async create(userData: CreateUserRequest): Promise<UserModel> {
    try {
      // Validation des données
      const errors = UserModel.validate(userData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(UserModel.toAPI(userData)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: User = await response.json();
      return UserModel.fromAPI(data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }


  // Supprimer un utilisateur
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // No content returned on successful deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

}

export default UserService;

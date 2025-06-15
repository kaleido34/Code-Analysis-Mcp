/**
 * Sample TypeScript file for demonstrating code analysis
 * This file contains various patterns for complexity analysis
 */

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

export class UserManager {
  private users: Map<string, User> = new Map();

  /**
   * Adds a new user to the system
   * @param user User to add
   * @returns Success status
   */
  public addUser(user: User): boolean {
    if (!user.id || !user.name || !user.email) {
      throw new Error('Invalid user data');
    }

    if (this.users.has(user.id)) {
      return false;
    }

    this.users.set(user.id, user);
    return true;
  }

  /**
   * Complex function with high cyclomatic complexity
   * This demonstrates complexity analysis
   */
  public processUserData(user: User, options: any): string {
    let result = '';

    // Multiple decision points increase complexity
    if (user.age) {
      if (user.age < 18) {
        result += 'minor';
      } else if (user.age < 65) {
        result += 'adult';
      } else {
        result += 'senior';
      }
    }

    if (options.includeEmail && user.email) {
      result += user.email.includes('@') ? ' verified' : ' unverified';
    }

    if (options.format) {
      switch (options.format) {
        case 'json':
          return JSON.stringify({ user, result });
        case 'xml':
          return `<user>${result}</user>`;
        case 'csv':
          return `${user.id},${user.name},${result}`;
        default:
          return result;
      }
    }

    return result;
  }

  /**
   * Simple function with low complexity
   */
  public getUserCount(): number {
    return this.users.size;
  }

  /**
   * Function with error handling patterns
   */
  public async fetchUserProfile(userId: string): Promise<User | null> {
    try {
      const user = this.users.get(userId);
      
      if (!user) {
        return null;
      }

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

// Utility functions for demonstration
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

// Example of nested complexity
export function complexCalculation(data: number[]): number {
  let result = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      if (data[i] % 2 === 0) {
        result += data[i] * 2;
      } else {
        result += data[i];
      }
    } else if (data[i] < 0) {
      result -= Math.abs(data[i]);
    }
  }
  
  return result;
} 
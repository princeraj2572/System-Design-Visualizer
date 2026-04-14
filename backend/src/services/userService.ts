/**
 * User Service
 */

import pool from '@/config/database';
import { User } from '@/models/types';
import { ConflictError, NotFoundError } from '@/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/config';

export class UserService {
  /**
   * Register a new user
   */
  static async registerUser(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    // Check if user already exists
    const existingQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
    const existingResult = await pool.query(existingQuery, [email, username]);

    if (existingResult.rows.length > 0) {
      throw new ConflictError('Email or username already exists');
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const query = `
      INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username, created_at, updated_at
    `;

    const result = await pool.query(query, [
      userId,
      email,
      username,
      hashedPassword,
      now,
      now,
    ]);

    return result.rows[0];
  }

  /**
   * Login user and return JWT token
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const query = 'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (!result.rows.length) {
      throw new NotFoundError('Invalid email or password');
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new NotFoundError('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const query = 'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);

    if (!result.rows.length) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    return result.rows[0];
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: { username?: string; email?: string }
  ): Promise<User> {
    const setClause = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.username !== undefined) {
      setClause.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }

    if (updates.email !== undefined) {
      setClause.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    setClause.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(userId);

    const query = `
      UPDATE users
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
  }
}

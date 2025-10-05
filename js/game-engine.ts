/**
 * Base game engine for educational games
 */

import { playSuccessSound, playErrorSound } from './audio-utils';
import { setText } from './dom-utils';
import { setCookie, getCookie } from './storage-utils';

export interface GameConfig {
  scoreElementId?: string;
  streakElementId?: string;
  feedbackElementId?: string;
  enableSound?: boolean;
}

export interface GameState {
  score: number;
  streak: number;
  maxStreak: number;
  totalAttempts: number;
  correctAttempts: number;
}

/**
 * Base class for educational games
 */
export class GameEngine {
  protected state: GameState;
  protected config: GameConfig;

  constructor(config: GameConfig = {}) {
    this.config = {
      enableSound: true,
      ...config
    };

    this.state = {
      score: 0,
      streak: 0,
      maxStreak: 0,
      totalAttempts: 0,
      correctAttempts: 0
    };
  }

  /**
   * Record a correct answer
   */
  protected recordCorrect(): void {
    this.state.score++;
    this.state.streak++;
    this.state.maxStreak = Math.max(this.state.maxStreak, this.state.streak);
    this.state.totalAttempts++;
    this.state.correctAttempts++;

    this.updateUI();

    if (this.config.enableSound) {
      playSuccessSound();
    }

    if (this.config.feedbackElementId) {
      this.showFeedback('Correct! 🎉', 'correct');
    }
  }

  /**
   * Record an incorrect answer
   */
  protected recordIncorrect(): void {
    this.state.streak = 0;
    this.state.totalAttempts++;

    this.updateUI();

    if (this.config.enableSound) {
      playErrorSound();
    }

    if (this.config.feedbackElementId) {
      this.showFeedback('Try again! 💪', 'incorrect');
    }
  }

  /**
   * Update score and streak displays
   */
  protected updateUI(): void {
    if (this.config.scoreElementId) {
      setText(this.config.scoreElementId, `Score: ${this.state.score}`);
    }

    if (this.config.streakElementId) {
      setText(this.config.streakElementId, `Streak: ${this.state.streak}`);
    }
  }

  /**
   * Show feedback message
   */
  protected showFeedback(message: string, className: 'correct' | 'incorrect'): void {
    if (!this.config.feedbackElementId) return;

    const feedbackElement = document.getElementById(this.config.feedbackElementId);
    if (!feedbackElement) return;

    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${className}`;

    setTimeout(() => {
      feedbackElement.textContent = '';
      feedbackElement.className = 'feedback';
    }, 2000);
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.state.score;
  }

  /**
   * Get current streak
   */
  public getStreak(): number {
    return this.state.streak;
  }

  /**
   * Get accuracy percentage
   */
  public getAccuracy(): number {
    if (this.state.totalAttempts === 0) return 0;
    return Math.round((this.state.correctAttempts / this.state.totalAttempts) * 100);
  }

  /**
   * Reset game state
   */
  public reset(): void {
    this.state = {
      score: 0,
      streak: 0,
      maxStreak: this.state.maxStreak, // Keep max streak
      totalAttempts: 0,
      correctAttempts: 0
    };

    this.updateUI();
  }

  /**
   * Save game state to cookie
   */
  public saveState(gameId: string): void {
    setCookie(`${gameId}_score`, String(this.state.score));
    setCookie(`${gameId}_maxStreak`, String(this.state.maxStreak));
  }

  /**
   * Load game state from cookie
   */
  public loadState(gameId: string): void {
    const savedScore = getCookie(`${gameId}_score`);
    const savedMaxStreak = getCookie(`${gameId}_maxStreak`);

    if (savedScore) {
      this.state.score = parseInt(savedScore) || 0;
    }

    if (savedMaxStreak) {
      this.state.maxStreak = parseInt(savedMaxStreak) || 0;
    }

    this.updateUI();
  }
}

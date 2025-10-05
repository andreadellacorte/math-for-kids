/**
 * Base game engine for educational games
 */
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
export declare class GameEngine {
    protected state: GameState;
    protected config: GameConfig;
    constructor(config?: GameConfig);
    /**
     * Record a correct answer
     */
    protected recordCorrect(): void;
    /**
     * Record an incorrect answer
     */
    protected recordIncorrect(): void;
    /**
     * Update score and streak displays
     */
    protected updateUI(): void;
    /**
     * Show feedback message
     */
    protected showFeedback(message: string, className: 'correct' | 'incorrect'): void;
    /**
     * Get current score
     */
    getScore(): number;
    /**
     * Get current streak
     */
    getStreak(): number;
    /**
     * Get accuracy percentage
     */
    getAccuracy(): number;
    /**
     * Reset game state
     */
    reset(): void;
    /**
     * Save game state to cookie
     */
    saveState(gameId: string): void;
    /**
     * Load game state from cookie
     */
    loadState(gameId: string): void;
}
//# sourceMappingURL=game-engine.d.ts.map
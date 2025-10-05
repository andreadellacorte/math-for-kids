/**
 * Audio utility functions for games
 */
/**
 * Play a sound effect
 */
export declare function playSound(frequency: number, duration?: number, type?: OscillatorType): void;
/**
 * Play success sound
 */
export declare function playSuccessSound(): void;
/**
 * Play error sound
 */
export declare function playErrorSound(): void;
/**
 * Play click sound
 */
export declare function playClickSound(): void;
/**
 * Play a sequence of notes
 */
export declare function playMelody(notes: {
    frequency: number;
    duration: number;
}[]): void;
/**
 * Musical note frequencies (A4 = 440 Hz)
 */
export declare const NOTE_FREQUENCIES: {
    readonly C4: 261.63;
    readonly D4: 293.66;
    readonly E4: 329.63;
    readonly F4: 349.23;
    readonly G4: 392;
    readonly A4: 440;
    readonly B4: 493.88;
    readonly C5: 523.25;
    readonly D5: 587.33;
    readonly E5: 659.25;
    readonly F5: 698.46;
    readonly G5: 783.99;
    readonly A5: 880;
    readonly B5: 987.77;
};
export type NoteName = keyof typeof NOTE_FREQUENCIES;
//# sourceMappingURL=audio-utils.d.ts.map
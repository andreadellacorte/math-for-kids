/**
 * Audio utility functions for games
 */

/**
 * Play a sound effect
 */
export function playSound(frequency: number, duration: number = 200, type: OscillatorType = 'sine'): void {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return;
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

/**
 * Play success sound
 */
export function playSuccessSound(): void {
  playSound(523.25, 100); // C5
  setTimeout(() => playSound(659.25, 100), 100); // E5
  setTimeout(() => playSound(783.99, 200), 200); // G5
}

/**
 * Play error sound
 */
export function playErrorSound(): void {
  playSound(200, 300, 'square');
}

/**
 * Play click sound
 */
export function playClickSound(): void {
  playSound(440, 50);
}

/**
 * Play a sequence of notes
 */
export function playMelody(notes: { frequency: number; duration: number }[]): void {
  let delay = 0;

  notes.forEach(note => {
    setTimeout(() => playSound(note.frequency, note.duration), delay);
    delay += note.duration + 50; // Add small gap between notes
  });
}

/**
 * Musical note frequencies (A4 = 440 Hz)
 */
export const NOTE_FREQUENCIES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
  B5: 987.77
} as const;

export type NoteName = keyof typeof NOTE_FREQUENCIES;

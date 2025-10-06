/**
 * notation-game game logic
 * Migrated from notation-game.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

interface Note {
    name: string;
    solfege: string;
    position: string;
    offset: number;
    octave: number;
}

class NotationGame {
            private notes: Note[];
            private currentSequence: Note[];
            private userSequence: Note[];
            private score: number;
            private level: number;
            private streak: number;
            private audioContext: AudioContext | null;
            private scoreElement!: HTMLElement | null;
            private levelElement!: HTMLElement | null;
            private streakElement!: HTMLElement | null;
            private staffElement!: HTMLElement | null;
            private userSequenceElement!: HTMLElement | null;
            private keyboardElement!: HTMLElement | null;
            private newSequenceBtn!: HTMLElement | null;
            private playBtn!: HTMLButtonElement | null;
            private checkBtn!: HTMLButtonElement | null;
            private clearBtn!: HTMLButtonElement | null;

            constructor() {
                this.notes = [
                    { name: 'C', solfege: 'Do', position: 'below', offset: 10, octave: 4 },
                    { name: 'C#', solfege: 'Di', position: 'below', offset: 5, octave: 4 },
                    { name: 'D', solfege: 'Re', position: 'line-4', offset: 0, octave: 4 },
                    { name: 'D#', solfege: 'Ri', position: 'line-4', offset: -5, octave: 4 },
                    { name: 'E', solfege: 'Mi', position: 'space-3', offset: -10, octave: 4 },
                    { name: 'F', solfege: 'Fa', position: 'line-3', offset: -20, octave: 4 },
                    { name: 'F#', solfege: 'Fi', position: 'line-3', offset: -25, octave: 4 },
                    { name: 'G', solfege: 'Sol', position: 'space-2', offset: -30, octave: 4 },
                    { name: 'G#', solfege: 'Si', position: 'space-2', offset: -35, octave: 4 },
                    { name: 'A', solfege: 'La', position: 'line-2', offset: -40, octave: 4 },
                    { name: 'A#', solfege: 'Li', position: 'line-2', offset: -45, octave: 4 },
                    { name: 'B', solfege: 'Ti', position: 'space-1', offset: -50, octave: 4 },
                    { name: 'C', solfege: 'Do', position: 'line-1', offset: -60, octave: 5 },
                    { name: 'C#', solfege: 'Di', position: 'space-above', offset: -70, octave: 5 }
                ];

                this.currentSequence = [];
                this.userSequence = [];
                this.score = 0;
                this.level = 1;
                this.streak = 0;

                // Audio context for playing notes
                this.audioContext = null;
                this.initAudio();

                this.initializeElements();
                this.createStaff();
                this.createKeyboard();
                this.attachEventListeners();
                this.updateDisplay();
            }

            async initAudio(): Promise<void> {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (error) {
                    console.warn('Audio context not available:', error);
                }
            }

            initializeElements(): void {
                this.scoreElement = document.getElementById('score');
                this.levelElement = document.getElementById('level');
                this.streakElement = document.getElementById('streak');
                this.staffElement = document.getElementById('staff');
                this.userSequenceElement = document.getElementById('userSequence');
                this.keyboardElement = document.getElementById('keyboard');

                this.newSequenceBtn = document.getElementById('newSequenceBtn');
                this.playBtn = document.getElementById('playBtn');
                this.checkBtn = document.getElementById('checkBtn');
                this.clearBtn = document.getElementById('clearBtn');
            }

            createStaff(): void {
                this.staffElement!.innerHTML = '';

                // Create staff lines
                for (let i = 0; i < 5; i++) {
                    const line = document.createElement('div');
                    line.className = 'staff-line';
                    line.style.top = `${40 + i * 30}px`;
                    this.staffElement!.appendChild(line);
                }

                // Add treble clef
                const clef = document.createElement('div');
                clef.className = 'clef';
                clef.textContent = '𝄞';
                this.staffElement!.appendChild(clef);
            }

            createKeyboard(): void {
                this.keyboardElement!.innerHTML = '';

                const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
                const blackKeyPositions = [0, 1, 3, 4, 5]; // Positions relative to white keys
                const blackKeyNames = ['C#', 'D#', 'F#', 'G#', 'A#'];

                // Create white keys
                whiteKeys.forEach((note, index) => {
                    const key = document.createElement('div');
                    key.className = 'key white-key';
                    key.dataset.note = note;
                    key.textContent = note;
                    key.addEventListener('click', () => this.handleKeyClick(note));
                    this.keyboardElement!.appendChild(key);
                });

                // Create black keys with proper positioning
                blackKeyNames.forEach((name, index) => {
                    const key = document.createElement('div');
                    key.className = 'key black-key';
                    key.dataset.note = name;
                    key.textContent = name;

                    // Position black keys between white keys
                    const whiteKeyWidth = 52; // 50px + 2px margin
                    const position = blackKeyPositions[index];
                    key.style.left = `${(position + 1) * whiteKeyWidth}px`;

                    key.addEventListener('click', () => this.handleKeyClick(name));
                    this.keyboardElement!.appendChild(key);
                });
            }

            attachEventListeners(): void {
                this.newSequenceBtn!.addEventListener('click', () => this.generateNewSequence());
                this.playBtn!.addEventListener('click', () => this.playSequence());
                this.checkBtn!.addEventListener('click', () => this.checkAnswer());
                this.clearBtn!.addEventListener('click', () => this.clearUserInput());
            }

            generateNewSequence(): void {
                // Reset game state
                this.currentSequence = [];
                this.userSequence = [];
                this.clearStaffNotes();
                this.clearUserInput();

                // Generate 6 random notes from the do-la hexachord
                for (let i = 0; i < 6; i++) {
                    const randomNote = this.notes[Math.floor(Math.random() * this.notes.length)];
                    this.currentSequence.push(randomNote);
                }

                this.displayNotesOnStaff();
                this.playBtn!.disabled = false;
                this.checkBtn!.disabled = false;
            }

            displayNotesOnStaff(): void {
                this.clearStaffNotes();

                this.currentSequence.forEach((note, index) => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'note';
                    noteElement.textContent = '♩';

                    // Position horizontally
                    noteElement.style.left = `${120 + index * 80}px`;

                    // Position vertically based on note
                    noteElement.style.top = `${70 + note.offset}px`;

                    this.staffElement!.appendChild(noteElement);
                });
            }

            clearStaffNotes(): void {
                const notes = this.staffElement!.querySelectorAll('.note');
                notes.forEach((note: Element) => note.remove());
            }

            handleKeyClick(noteName: string): void {
                // Find all possible notes with this name
                const possibleNotes = this.notes.filter(n => n.name === noteName);
                if (possibleNotes.length === 0) return;

                // If there are multiple octaves for this note, try to match the current sequence
                let selectedNote = possibleNotes[0]; // Default to first match

                if (possibleNotes.length > 1 && this.currentSequence.length > 0) {
                    // Try to find the note that matches the next expected note in the sequence
                    const currentIndex = this.userSequence.length;
                    if (currentIndex < this.currentSequence.length) {
                        const expectedNote = this.currentSequence[currentIndex];
                        const matchingNote = possibleNotes.find(n =>
                            n.name === expectedNote.name &&
                            (n.octave || 4) === (expectedNote.octave || 4)
                        );
                        if (matchingNote) {
                            selectedNote = matchingNote;
                        }
                    }
                }

                this.userSequence.push(selectedNote);
                this.updateUserSequenceDisplay();

                // Visual feedback
                const key = document.querySelector(`[data-note="${noteName}"]`) as HTMLElement;
                if (key) {
                    key.classList.add('active');
                    setTimeout(() => key.classList.remove('active'), 200);
                }

                // Play note sound
                this.playNote(selectedNote);
            }

            updateUserSequenceDisplay(): void {
                const sequenceText = this.userSequence.map(note =>
                    `${note.name}${note.octave || 4} (${note.solfege})`
                ).join(' → ');

                this.userSequenceElement!.textContent = sequenceText || 'Your sequence will appear here...';
            }

            clearUserInput(): void {
                this.userSequence = [];
                this.updateUserSequenceDisplay();

                // Remove all visual feedback from keys
                document.querySelectorAll('.key').forEach((key: Element) => {
                    key.classList.remove('correct', 'incorrect', 'active');
                });
            }

            async playSequence(): Promise<void> {
                if (!this.audioContext) return;

                for (let i = 0; i < this.currentSequence.length; i++) {
                    this.playNote(this.currentSequence[i]);
                    await this.sleep(600); // Pause between notes
                }
            }

            playNote(note: Note): void {
                if (!this.audioContext) return;

                // Calculate frequency based on note and octave
                const baseFrequencies: { [key: string]: number } = {
                    'C': 261.63,
                    'C#': 277.18,
                    'D': 293.66,
                    'D#': 311.13,
                    'E': 329.63,
                    'F': 349.23,
                    'F#': 369.99,
                    'G': 392.00,
                    'G#': 415.30,
                    'A': 440.00,
                    'A#': 466.16,
                    'B': 493.88
                };

                const baseFreq = baseFrequencies[note.name];
                if (!baseFreq) return;

                // Adjust frequency for octave (C4 is base, C5 is double frequency)
                const octaveMultiplier = Math.pow(2, (note.octave || 4) - 4);
                const frequency = baseFreq * octaveMultiplier;

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }

            sleep(ms: number): Promise<void> {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            checkAnswer(): void {
                if (this.userSequence.length === 0) {
                    this.userSequenceElement!.textContent = 'Please play some notes first!';
                    return;
                }

                const isCorrect = this.sequencesMatch();
                this.showResults(isCorrect);

                if (isCorrect) {
                    this.score += 15 + (this.level * 5);
                    this.streak++;

                    if (this.streak % 3 === 0) {
                        this.level++;
                    }
                } else {
                    this.streak = 0;
                }

                this.updateDisplay();

                // Reset for next round
                setTimeout(() => {
                    this.clearUserInput();
                    this.playBtn!.disabled = true;
                    this.checkBtn!.disabled = true;
                }, 3000);
            }

            sequencesMatch(): boolean {
                if (this.userSequence.length !== this.currentSequence.length) {
                    return false;
                }

                for (let i = 0; i < this.currentSequence.length; i++) {
                    const userNote = this.userSequence[i];
                    const currentNote = this.currentSequence[i];

                    if (userNote.name !== currentNote.name ||
                        (userNote.octave || 4) !== (currentNote.octave || 4)) {
                        return false;
                    }
                }

                return true;
            }

            showResults(isCorrect: boolean): void {
                // Show correct/incorrect feedback on keys
                this.currentSequence.forEach((note, index) => {
                    const key = document.querySelector(`[data-note="${note.name}"]`) as HTMLElement;
                    const userNote = this.userSequence[index];

                    if (key) {
                        if (userNote && userNote.name === note.name) {
                            key.classList.add('correct');
                        } else {
                            key.classList.add('incorrect');
                        }
                    }
                });

                if (isCorrect) {
                    this.userSequenceElement!.innerHTML = '🎉 Perfect! You read the notes correctly!';
                } else {
                    const correctSequence = this.currentSequence.map(note =>
                        `${note.name}${note.octave || 4} (${note.solfege})`
                    ).join(' → ');
                    this.userSequenceElement!.innerHTML = `❌ Not quite right.<br>Correct sequence: ${correctSequence}`;
                }
            }

            updateDisplay(): void {
                this.scoreElement!.textContent = this.score.toString();
                this.levelElement!.textContent = this.level.toString();
                this.streakElement!.textContent = this.streak.toString();
            }
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new NotationGame();
        });

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}

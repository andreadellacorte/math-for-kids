// @ts-nocheck
/**
 * instruments-game game logic
 * Migrated from instruments-game.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

class InstrumentsGame {
            constructor() {
                this.instruments = [
                    {
                        name: 'Violin',
                        family: 'String',
                        visual: 'images/instruments/violin.jpg',
                        description: 'A small string instrument played with a bow'
                    },
                    {
                        name: 'Cello',
                        family: 'String',
                        visual: 'images/instruments/cello.jpg',
                        description: 'A large string instrument played with a bow, held between the knees'
                    },
                    {
                        name: 'Trumpet',
                        family: 'Wind',
                        visual: 'images/instruments/trumpet.jpg',
                        description: 'A brass wind instrument with valves'
                    },
                    {
                        name: 'Horn',
                        family: 'Wind',
                        visual: 'images/instruments/horn.jpg',
                        description: 'A brass wind instrument with a curved shape'
                    },
                    {
                        name: 'Trombone',
                        family: 'Wind',
                        visual: 'images/instruments/trombone.jpg',
                        description: 'A brass wind instrument with a sliding tube'
                    },
                    {
                        name: 'Flute',
                        family: 'Wind',
                        visual: 'images/instruments/flute.jpg',
                        description: 'A woodwind instrument played by blowing across a hole'
                    },
                    {
                        name: 'Oboe',
                        family: 'Wind',
                        visual: 'images/instruments/oboe.jpg',
                        description: 'A woodwind instrument with a double reed'
                    },
                    {
                        name: 'Clarinet',
                        family: 'Wind',
                        visual: 'images/instruments/clarinet.jpg',
                        description: 'A woodwind instrument with a single reed'
                    },
                    {
                        name: 'Bassoon',
                        family: 'Wind',
                        visual: 'images/instruments/bassoon.jpg',
                        description: 'A large woodwind instrument with a double reed'
                    },
                    {
                        name: 'Bass Drum',
                        family: 'Percussion',
                        visual: 'images/instruments/bass_drum.jpg',
                        description: 'A large drum that produces low-pitched sounds'
                    },
                    {
                        name: 'Timpani',
                        family: 'Percussion',
                        visual: 'images/instruments/timpani.jpg',
                        description: 'Tunable drums also called kettledrums'
                    }
                ];

                this.currentInstrument = null;
                this.currentQuestion = null;
                this.selectedAnswer = null;
                this.score = 0;
                this.level = 1;
                this.streak = 0;
                this.gameMode = 'identify';

                this.initializeElements();
                this.attachEventListeners();
                this.updateDisplay();
            }

            initializeElements() {
                this.scoreElement = document.getElementById('score');
                this.levelElement = document.getElementById('level');
                this.streakElement = document.getElementById('streak');
                this.instrumentDisplay = document.getElementById('instrumentDisplay');
                this.instrumentVisual = document.getElementById('instrumentVisual');
                this.instrumentName = document.getElementById('instrumentName');
                this.questionText = document.getElementById('questionText');
                this.resultDisplay = document.getElementById('resultDisplay');
                this.optionsContainer = document.getElementById('optionsContainer');
                this.gameModeSelect = document.getElementById('gameMode');

                this.newQuestionBtn = document.getElementById('newQuestionBtn');
                this.showAnswerBtn = document.getElementById('showAnswerBtn');
            }

            attachEventListeners() {
                this.newQuestionBtn.addEventListener('click', () => this.generateNewQuestion());
                this.showAnswerBtn.addEventListener('click', () => this.showAnswer());
                this.gameModeSelect.addEventListener('change', (e) => {
                    this.gameMode = e.target.value;
                });
            }

            generateNewQuestion() {
                // Reset game state
                this.selectedAnswer = null;
                this.resultDisplay.style.display = 'none';
                this.clearOptions();

                // Select random instrument
                this.currentInstrument = this.instruments[Math.floor(Math.random() * this.instruments.length)];

                // Determine question type based on game mode
                if (this.gameMode === 'mixed') {
                    this.currentQuestion = Math.random() < 0.5 ? 'identify' : 'family';
                } else {
                    this.currentQuestion = this.gameMode;
                }

                this.displayInstrument();
                this.generateOptions();

                this.showAnswerBtn.disabled = false;
            }

            displayInstrument() {
                this.instrumentVisual.src = this.currentInstrument.visual;
                this.instrumentVisual.alt = this.currentInstrument.name;

                if (this.currentQuestion === 'identify') {
                    this.instrumentName.textContent = '?';
                    this.questionText.textContent = 'What instrument is this?';
                } else if (this.currentQuestion === 'family') {
                    this.instrumentName.textContent = this.currentInstrument.name;
                    this.questionText.textContent = 'What family does this instrument belong to?';
                }
            }

            generateOptions() {
                this.optionsContainer.innerHTML = '';

                let options = [];
                let correctAnswer = '';

                if (this.currentQuestion === 'identify') {
                    // Generate instrument name options
                    correctAnswer = this.currentInstrument.name;
                    options = [correctAnswer];

                    // Add 3 random wrong answers
                    const otherInstruments = this.instruments.filter(inst => inst.name !== correctAnswer);
                    while (options.length < 4) {
                        const randomInst = otherInstruments[Math.floor(Math.random() * otherInstruments.length)];
                        if (!options.includes(randomInst.name)) {
                            options.push(randomInst.name);
                        }
                    }
                } else if (this.currentQuestion === 'family') {
                    // Generate family options
                    correctAnswer = this.currentInstrument.family;
                    options = ['String', 'Wind', 'Percussion'];
                }

                // Shuffle options
                options = this.shuffleArray(options);

                // Create option buttons
                options.forEach(option => {
                    const button = document.createElement('button');
                    button.className = 'option-button';
                    button.textContent = option;
                    button.addEventListener('click', () => this.selectAnswer(option, button, correctAnswer));
                    this.optionsContainer.appendChild(button);
                });
            }

            selectAnswer(answer, button, correctAnswer) {
                // Disable all buttons
                const allButtons = document.querySelectorAll('.option-button');
                allButtons.forEach(btn => {
                    btn.style.pointerEvents = 'none';
                });

                this.selectedAnswer = answer;
                const isCorrect = answer === correctAnswer;

                // Show visual feedback
                if (isCorrect) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                    // Highlight correct answer
                    allButtons.forEach(btn => {
                        if (btn.textContent === correctAnswer) {
                            btn.classList.add('correct');
                        }
                    });
                }

                this.showResult(isCorrect, correctAnswer);

                if (isCorrect) {
                    this.score += 15 + (this.level * 5);
                    this.streak++;

                    if (this.streak % 5 === 0) {
                        this.level++;
                    }
                } else {
                    this.streak = 0;
                }

                this.updateDisplay();

                // Reset for next round
                setTimeout(() => {
                    this.clearOptions();
                    this.showAnswerBtn.disabled = true;
                }, 3000);
            }

            showResult(isCorrect, correctAnswer) {
                this.resultDisplay.style.display = 'flex';
                this.resultDisplay.className = `result-display ${isCorrect ? 'correct' : 'incorrect'}`;

                if (isCorrect) {
                    this.resultDisplay.textContent = '🎉 Correct! Well done!';
                } else {
                    if (this.currentQuestion === 'identify') {
                        this.resultDisplay.textContent = `❌ Incorrect. This is a ${correctAnswer}.`;
                    } else {
                        this.resultDisplay.textContent = `❌ Incorrect. The ${this.currentInstrument.name} belongs to the ${correctAnswer} family.`;
                    }
                }

                // Show instrument description
                setTimeout(() => {
                    this.resultDisplay.textContent += ` ${this.currentInstrument.description}`;
                }, 1500);
            }

            showAnswer() {
                this.instrumentName.textContent = this.currentInstrument.name;
                this.questionText.textContent = `This is a ${this.currentInstrument.name} from the ${this.currentInstrument.family} family.`;

                // Highlight correct answer
                const allButtons = document.querySelectorAll('.option-button');
                const correctAnswer = this.currentQuestion === 'identify' ?
                    this.currentInstrument.name :
                    this.currentInstrument.family;

                allButtons.forEach(button => {
                    if (button.textContent === correctAnswer) {
                        button.classList.add('correct');
                    }
                    button.style.pointerEvents = 'none';
                });

                this.showAnswerBtn.disabled = true;

                // Show description
                this.resultDisplay.style.display = 'flex';
                this.resultDisplay.className = 'result-display';
                this.resultDisplay.style.background = '#e2e3e5';
                this.resultDisplay.style.color = '#383d41';
                this.resultDisplay.style.border = '2px solid #d6d8db';
                this.resultDisplay.textContent = this.currentInstrument.description;
            }

            clearOptions() {
                const allButtons = document.querySelectorAll('.option-button');
                allButtons.forEach(button => {
                    button.style.pointerEvents = 'auto';
                    button.classList.remove('selected', 'correct', 'incorrect');
                });
            }

            shuffleArray(array) {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            }

            updateDisplay() {
                this.scoreElement.textContent = this.score;
                this.levelElement.textContent = this.level;
                this.streakElement.textContent = this.streak;
            }
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new InstrumentsGame();
        });

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}

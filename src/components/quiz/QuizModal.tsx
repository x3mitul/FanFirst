'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, CheckCircle2, XCircle, Trophy, Zap, Flame, X } from 'lucide-react';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    timeLimit: number;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (score: number, correctAnswers: number, totalQuestions: number) => void;
    artistName: string;
}

// Hardcoded questions for demo - in production, fetch from API
const getQuestionsForArtist = (artistName: string): QuizQuestion[] => {
    // Generic questions that work for any artist/team
    return [
        {
            id: '1',
            question: `What year was ${artistName} founded/formed?`,
            options: ['1960s', '1970s', '1980s', '1990s'],
            correctAnswer: '1960s',
            timeLimit: 7
        },
        {
            id: '2',
            question: `Which venue is most associated with ${artistName}?`,
            options: ['Madison Square Garden', 'Staples Center', 'United Center', 'TD Garden'],
            correctAnswer: 'Staples Center',
            timeLimit: 7
        },
        {
            id: '3',
            question: `How many championships/major awards has ${artistName} won?`,
            options: ['5-10', '11-15', '16-20', '20+'],
            correctAnswer: '16-20',
            timeLimit: 7
        },
        {
            id: '4',
            question: `Which of these is a famous moment in ${artistName} history?`,
            options: ['The Comeback', 'The Dynasty', 'The Miracle', 'The Legacy'],
            correctAnswer: 'The Dynasty',
            timeLimit: 7
        },
        {
            id: '5',
            question: `What color is most associated with ${artistName}?`,
            options: ['Purple & Gold', 'Red & Black', 'Blue & White', 'Green & Yellow'],
            correctAnswer: 'Purple & Gold',
            timeLimit: 7
        }
    ];
};

export default function QuizModal({ isOpen, onClose, onComplete, artistName }: QuizModalProps) {
    const [questions] = useState<QuizQuestion[]>(() => getQuestionsForArtist(artistName));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(7);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [phase, setPhase] = useState<'playing' | 'completed'>('playing');
    const [responseTimes, setResponseTimes] = useState<number[]>([]);

    const questionStartTime = useRef<number>(Date.now());

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setTimeLeft(questions[0]?.timeLimit || 7);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setCorrectCount(0);
            setStreak(0);
            setPhase('playing');
            setResponseTimes([]);
            questionStartTime.current = Date.now();
        }
    }, [isOpen, questions]);

    // Timer countdown
    useEffect(() => {
        if (!isOpen || phase !== 'playing' || timeLeft <= 0 || isAnswered) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleTimeout();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, phase, timeLeft, isAnswered]);

    const handleTimeout = () => {
        if (!isAnswered) {
            setIsAnswered(true);
            setStreak(0);
            setResponseTimes(prev => [...prev, questions[currentIndex].timeLimit * 1000]);
            setTimeout(() => moveToNext(), 1500);
        }
    };

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;

        const responseTime = Date.now() - questionStartTime.current;
        const isCorrect = answer === questions[currentIndex].correctAnswer;

        setSelectedAnswer(answer);
        setIsAnswered(true);
        setResponseTimes(prev => [...prev, responseTime]);

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setStreak(prev => prev + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => moveToNext(), 1200);
    };

    const moveToNext = () => {
        if (currentIndex + 1 >= questions.length) {
            setPhase('completed');
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setTimeLeft(questions[currentIndex + 1].timeLimit);
            questionStartTime.current = Date.now();
        }
    };

    const handleComplete = () => {
        // Calculate score
        const accuracy = (correctCount / questions.length) * 100;
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const speedScore = Math.max(0, 100 - (avgTime / 100));
        const finalScore = (accuracy * 0.5) + (speedScore * 0.3) + (streak * 10 * 0.2);

        onComplete(finalScore, correctCount, questions.length);
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden"
            >
                {phase === 'playing' ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-gray-400">
                                    Question {currentIndex + 1}/{questions.length}
                                </span>
                                {streak > 1 && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                                        <Flame className="w-3 h-3" />
                                        {streak}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono ${timeLeft <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                                    }`}>
                                    <Clock className="w-4 h-4" />
                                    {timeLeft}s
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-800">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-6">
                                        {currentQuestion.question}
                                    </h3>

                                    <div className="space-y-3">
                                        {currentQuestion.options.map((option, i) => {
                                            const isSelected = selectedAnswer === option;
                                            const isCorrect = option === currentQuestion.correctAnswer;
                                            const showResult = isAnswered;

                                            return (
                                                <motion.button
                                                    key={i}
                                                    onClick={() => handleAnswer(option)}
                                                    disabled={isAnswered}
                                                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                                    className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${showResult && isCorrect
                                                            ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                                            : showResult && isSelected && !isCorrect
                                                                ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                                                : isAnswered
                                                                    ? 'bg-gray-800/50 text-gray-500'
                                                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50'
                                                        }`}
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="flex-1">{option}</span>
                                                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    /* Results */
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic mb-2">Quiz Complete!</h2>
                        <p className="text-gray-400 mb-6">You answered {correctCount} of {questions.length} correctly</p>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-center">
                                <div className="text-xl font-bold text-purple-400">{Math.round((correctCount / questions.length) * 100)}%</div>
                                <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                            <div className="p-3 rounded-xl bg-pink-500/10 text-center">
                                <div className="text-xl font-bold text-pink-400">{streak}</div>
                                <div className="text-xs text-gray-500">Max Streak</div>
                            </div>
                            <div className="p-3 rounded-xl bg-green-500/10 text-center">
                                <div className="text-xl font-bold text-green-400">+{correctCount * 5}</div>
                                <div className="text-xs text-gray-500">Fandom Pts</div>
                            </div>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Continue to Purchase
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

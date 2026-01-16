"use client";

import { useEffect, useRef, useCallback } from 'react';

export interface BehaviorData {
    mouseMovements: MouseMovement[];
    clicks: ClickEvent[];
    scrollEvents: ScrollEvent[];
    keystrokes: KeystrokeEvent[];
    sessionStart: number;
    lastActivity: number;
}

interface MouseMovement {
    x: number;
    y: number;
    timestamp: number;
    velocity: number;
}

interface ClickEvent {
    x: number;
    y: number;
    timestamp: number;
    targetType: string;
}

interface ScrollEvent {
    scrollY: number;
    timestamp: number;
    delta: number;
}

interface KeystrokeEvent {
    timestamp: number;
    timeSinceLastKey: number;
}

interface BehaviorScore {
    score: number; // 0-100, higher = more human-like
    confidence: number; // 0-1, how confident in the score
    flags: string[];
    details: {
        mouseScore: number;
        clickScore: number;
        scrollScore: number;
        keystrokeScore: number;
        sessionScore: number;
    };
}

const MAX_EVENTS = 100;

export function useBehaviorTracker() {
    const behaviorData = useRef<BehaviorData>({
        mouseMovements: [],
        clicks: [],
        scrollEvents: [],
        keystrokes: [],
        sessionStart: 0,
        lastActivity: 0,
    });

    const lastMousePos = useRef({ x: 0, y: 0, timestamp: 0 });
    const lastKeystroke = useRef(0);
    
    // Initialize timestamps on mount to avoid impure function during render
    useEffect(() => {
        const now = Date.now();
        behaviorData.current.sessionStart = now;
        behaviorData.current.lastActivity = now;
    }, []);

    // Track mouse movements
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const now = Date.now();
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dt = now - lastMousePos.current.timestamp;
        const velocity = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

        if (behaviorData.current.mouseMovements.length < MAX_EVENTS) {
            behaviorData.current.mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: now,
                velocity,
            });
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY, timestamp: now };
        behaviorData.current.lastActivity = now;
    }, []);

    // Track clicks
    const handleClick = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (behaviorData.current.clicks.length < MAX_EVENTS) {
            behaviorData.current.clicks.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now(),
                targetType: target.tagName.toLowerCase(),
            });
        }
        behaviorData.current.lastActivity = Date.now();
    }, []);

    // Track scroll
    const handleScroll = useCallback(() => {
        const now = Date.now();
        const lastScroll = behaviorData.current.scrollEvents[behaviorData.current.scrollEvents.length - 1];
        const delta = lastScroll ? window.scrollY - lastScroll.scrollY : 0;

        if (behaviorData.current.scrollEvents.length < MAX_EVENTS) {
            behaviorData.current.scrollEvents.push({
                scrollY: window.scrollY,
                timestamp: now,
                delta,
            });
        }
        behaviorData.current.lastActivity = now;
    }, []);

    // Track keystrokes (timing only, not content)
    const handleKeyDown = useCallback(() => {
        const now = Date.now();
        const timeSinceLastKey = now - lastKeystroke.current;

        if (behaviorData.current.keystrokes.length < MAX_EVENTS) {
            behaviorData.current.keystrokes.push({
                timestamp: now,
                timeSinceLastKey,
            });
        }

        lastKeystroke.current = now;
        behaviorData.current.lastActivity = now;
    }, []);

    useEffect(() => {
        // Throttled mouse move handler - reduced frequency for performance
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttledMouseMove = (e: MouseEvent) => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    handleMouseMove(e);
                    throttleTimeout = null;
                }, 100); // 10 samples per second (was 20)
            }
        };

        // Use passive listeners for better scroll performance
        window.addEventListener('mousemove', throttledMouseMove, { passive: true });
        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousemove', throttledMouseMove);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
            if (throttleTimeout) clearTimeout(throttleTimeout);
        };
    }, [handleMouseMove, handleClick, handleScroll, handleKeyDown]);

    // Analyze behavior and return score
    const analyzeBehavior = useCallback((): BehaviorScore => {
        const data = behaviorData.current;
        const flags: string[] = [];

        // 1. Mouse Movement Analysis
        let mouseScore = 50;
        if (data.mouseMovements.length >= 5) {
            // Check for velocity variance (humans have irregular speeds)
            const velocities = data.mouseMovements.map(m => m.velocity);
            const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
            const velocityVariance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;

            // Humans have high variance, bots are consistent
            if (velocityVariance > 0.5) {
                mouseScore += 25;
            } else if (velocityVariance < 0.1) {
                mouseScore -= 20;
                flags.push('low_mouse_variance');
            }

            // Check for straight lines (bots move in straight lines)
            let straightLineCount = 0;
            for (let i = 2; i < data.mouseMovements.length; i++) {
                const p1 = data.mouseMovements[i - 2];
                const p2 = data.mouseMovements[i - 1];
                const p3 = data.mouseMovements[i];

                const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
                const angleDiff = Math.abs(angle1 - angle2);

                if (angleDiff < 0.1) straightLineCount++;
            }

            const straightLineRatio = straightLineCount / (data.mouseMovements.length - 2);
            if (straightLineRatio > 0.8) {
                mouseScore -= 25;
                flags.push('straight_mouse_paths');
            } else if (straightLineRatio < 0.3) {
                mouseScore += 15;
            }
        } else {
            mouseScore = 30;
            flags.push('insufficient_mouse_data');
        }

        // 2. Click Analysis
        let clickScore = 50;
        if (data.clicks.length >= 2) {
            // Check timing between clicks
            const clickIntervals: number[] = [];
            for (let i = 1; i < data.clicks.length; i++) {
                clickIntervals.push(data.clicks[i].timestamp - data.clicks[i - 1].timestamp);
            }

            // Too fast clicks are suspicious
            const fastClicks = clickIntervals.filter(i => i < 100).length;
            if (fastClicks > clickIntervals.length * 0.5) {
                clickScore -= 30;
                flags.push('suspiciously_fast_clicks');
            }

            // Check for variety in click positions
            const uniquePositions = new Set(data.clicks.map(c => `${Math.round(c.x / 50)},${Math.round(c.y / 50)}`));
            if (uniquePositions.size > data.clicks.length * 0.5) {
                clickScore += 20;
            }
        } else {
            clickScore = 40;
        }

        // 3. Scroll Analysis
        let scrollScore = 50;
        if (data.scrollEvents.length >= 3) {
            // Check for smooth scrolling (humans scroll smoothly)
            const scrollDeltas = data.scrollEvents.map(s => Math.abs(s.delta));

            // Very large jumps are suspicious
            const largeJumps = scrollDeltas.filter(d => d > 1000).length;
            if (largeJumps > scrollDeltas.length * 0.3) {
                scrollScore -= 20;
                flags.push('large_scroll_jumps');
            } else {
                scrollScore += 20;
            }
        } else {
            scrollScore = 40;
        }

        // 4. Keystroke Analysis
        let keystrokeScore = 50;
        if (data.keystrokes.length >= 5) {
            // Check timing variance
            const intervals = data.keystrokes.map(k => k.timeSinceLastKey).filter(t => t > 0 && t < 2000);
            if (intervals.length >= 3) {
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;

                // Humans have high variance in typing
                if (variance > 5000) {
                    keystrokeScore += 25;
                } else if (variance < 500) {
                    keystrokeScore -= 20;
                    flags.push('robotic_typing');
                }
            }
        } else {
            keystrokeScore = 50; // Neutral if no typing
        }

        // 5. Session Analysis
        let sessionScore = 50;
        const sessionDuration = (data.lastActivity - data.sessionStart) / 1000; // seconds

        // Too short sessions are suspicious
        if (sessionDuration < 5) {
            sessionScore -= 20;
            flags.push('session_too_short');
        } else if (sessionDuration > 30) {
            sessionScore += 20;
        }

        // Total interaction count
        const totalInteractions = data.mouseMovements.length + data.clicks.length + data.scrollEvents.length;
        if (totalInteractions < 10) {
            sessionScore -= 15;
            flags.push('low_interaction_count');
        } else if (totalInteractions > 50) {
            sessionScore += 15;
        }

        // Calculate final score
        const finalScore = Math.round(
            (mouseScore * 0.30) +
            (clickScore * 0.20) +
            (scrollScore * 0.15) +
            (keystrokeScore * 0.15) +
            (sessionScore * 0.20)
        );

        // Clamp between 0-100
        const clampedScore = Math.max(0, Math.min(100, finalScore));

        // Calculate confidence based on data amount
        const confidence = Math.min(1, totalInteractions / 50);

        return {
            score: clampedScore,
            confidence,
            flags,
            details: {
                mouseScore: Math.max(0, Math.min(100, mouseScore)),
                clickScore: Math.max(0, Math.min(100, clickScore)),
                scrollScore: Math.max(0, Math.min(100, scrollScore)),
                keystrokeScore: Math.max(0, Math.min(100, keystrokeScore)),
                sessionScore: Math.max(0, Math.min(100, sessionScore)),
            },
        };
    }, []);

    // Reset behavior data
    const resetBehavior = useCallback(() => {
        behaviorData.current = {
            mouseMovements: [],
            clicks: [],
            scrollEvents: [],
            keystrokes: [],
            sessionStart: Date.now(),
            lastActivity: Date.now(),
        };
    }, []);

    // Get current data snapshot
    const getBehaviorData = useCallback(() => ({ ...behaviorData.current }), []);

    return {
        analyzeBehavior,
        resetBehavior,
        getBehaviorData,
    };
}

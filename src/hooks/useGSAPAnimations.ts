"use client";

import { useEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pin a section during scroll
 * @param ref - Reference to the element to pin
 * @param duration - How long to pin (in viewport heights)
 */
export function usePinSection(
    ref: RefObject<HTMLElement | null>,
    duration: number = 1
) {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        const trigger = ScrollTrigger.create({
            trigger: element,
            pin: true,
            start: "top top",
            end: `+=${window.innerHeight * duration}`,
            pinSpacing: true,
        });

        return () => {
            trigger.kill();
        };
    }, [ref, duration]);
}

/**
 * Fade in elements with stagger effect
 * @param containerRef - Reference to container element
 * @param selector - CSS selector for children to animate
 * @param stagger - Delay between each element
 */
export function useFadeInStagger(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    stagger: number = 0.1
) {
    useEffect(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll(selector);

        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(
                    elements,
                    {
                        opacity: 0,
                        y: 50,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: stagger,
                        ease: "power3.out",
                    }
                );
            },
            once: true,
        });

        return () => {
            trigger.kill();
        };
    }, [containerRef, selector, stagger]);
}

/**
 * Scroll-scrubbed animation
 * @param ref - Reference to element
 * @param from - Starting properties
 * @param to - Ending properties
 * @param start - ScrollTrigger start position
 * @param end - ScrollTrigger end position
 */
export function useScrollScrub(
    ref: RefObject<HTMLElement | null>,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    start: string = "top bottom",
    end: string = "bottom top"
) {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        gsap.fromTo(element, from, {
            ...to,
            scrollTrigger: {
                trigger: element,
                start: start,
                end: end,
                scrub: 1,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.vars.trigger === element) {
                    trigger.kill();
                }
            });
        };
    }, [ref, from, to, start, end]);
}

/**
 * Zoom element on scroll
 * @param ref - Reference to element
 * @param scaleFrom - Starting scale
 * @param scaleTo - Ending scale
 */
export function useZoomOnScroll(
    ref: RefObject<HTMLElement | null>,
    scaleFrom: number = 1,
    scaleTo: number = 1.1
) {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        gsap.fromTo(
            element,
            { scale: scaleFrom },
            {
                scale: scaleTo,
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.vars.trigger === element) {
                    trigger.kill();
                }
            });
        };
    }, [ref, scaleFrom, scaleTo]);
}

/**
 * Zoom in and then out effect
 * @param ref - Reference to element
 * @param maxScale - Maximum scale to reach
 */
export function useZoomInOut(
    ref: RefObject<HTMLElement | null>,
    maxScale: number = 1.2
) {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            onEnter: () => {
                const timeline = gsap.timeline();

                timeline
                    .to(element, {
                        scale: maxScale,
                        duration: 0.6,
                        ease: "power2.out",
                    })
                    .to(element, {
                        scale: 1,
                        duration: 0.6,
                        ease: "power2.in",
                    });
            },
            once: true,
        });

        return () => {
            trigger.kill();
        };
    }, [ref, maxScale]);
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ARTIST_NAMES = [
    "TAYLOR SWIFT",
    "ARIANA GRANDE",
    "BILLIE EILISH",
    "OLIVIA RODRIGO",
    "DOJA CAT",
    "THE WEEKND",
    "DRAKE",
    "BAD BUNNY",
    "HARRY STYLES",
    "DUA LIPA",
    "POST MALONE",
    "TRAVIS SCOTT",
    "RIHANNA",
    "BEYONCÉ",
    "SABRINA CARPENTER",
    "CHARLIE XCX",
    "SZA",
    "KENDRICK LAMAR",
    "PESO PLUMA",
    "TATE MCRAE",
    "TYLER THE CREATOR",
    "LANA DEL REY",
    "KAROL G",
    "IMAGINE DRAGONS",
    "COLDPLAY",
    "ED SHEERAN",
    "JUSTIN BIEBER",
    "ADELE",
    "BRUNO MARS",
    "SHAWN MENDES",
];

export function ScatteredArtistNames() {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightBarRef = useRef<HTMLDivElement>(null);
    const [highlightPosition, setHighlightPosition] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const textElements = containerRef.current.querySelectorAll(".artist-name");

        // Create scroll-triggered highlight bar movement
        const handleScroll = () => {
            if (!containerRef.current || !highlightBarRef.current) return;

            const scrollY = window.scrollY;
            const containerTop = containerRef.current.offsetTop;
            const containerHeight = containerRef.current.offsetHeight;
            const relativeScroll = scrollY - containerTop + window.innerHeight / 2;

            // Calculate position within container (0 to 1)
            const progress = Math.max(0, Math.min(1, relativeScroll / containerHeight));
            const position = progress * containerHeight;

            setHighlightPosition(position);

            // Animate the highlight bar position with GSAP for smoothness
            gsap.to(highlightBarRef.current, {
                y: position,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        // Animate each text element on scroll
        textElements.forEach((el, index) => {
            gsap.fromTo(
                el,
                {
                    opacity: 0.3,
                    x: index % 2 === 0 ? -100 : 100,
                },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        end: "top 30%",
                        scrub: 1,
                    },
                }
            );
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full py-24 overflow-hidden bg-black">
            {/* Animated Highlight Bar - Spans Full Width */}
            <div
                ref={highlightBarRef}
                className="absolute left-0 right-0 pointer-events-none z-40"
                style={{
                    top: 0,
                    height: '120px',
                    willChange: 'transform',
                }}
            >
                <div
                    className="relative w-full h-full"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(204, 255, 0, 0.95) 50%, transparent)',
                        boxShadow: '0 0 100px rgba(204, 255, 0, 0.8), 0 0 200px rgba(204, 255, 0, 0.5), inset 0 0 50px rgba(204, 255, 0, 0.3)',
                    }}
                >
                    {/* Top edge glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"
                        style={{
                            boxShadow: '0 0 40px rgba(204, 255, 0, 1), 0 0 80px rgba(204, 255, 0, 0.7)'
                        }}
                    />
                    {/* Bottom edge glow */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"
                        style={{
                            boxShadow: '0 0 40px rgba(204, 255, 0, 1), 0 0 80px rgba(204, 255, 0, 0.7)'
                        }}
                    />
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-4">
                {/* Scattered artist names in two columns */}
                <div className="relative min-h-[2600px]">
                    {ARTIST_NAMES.map((name, index) => {
                        const isLeft = index % 2 === 0;
                        const topPosition = index * 85;
                        const isInHighlight = Math.abs(highlightPosition - topPosition) < 60;

                        return (
                            <div
                                key={name}
                                className={`artist-name absolute font-black text-7xl uppercase tracking-tighter whitespace-nowrap transition-all duration-200
                                    ${isLeft ? 'left-4' : 'right-4 text-right'}
                                    ${isInHighlight ? 'text-black scale-110 z-50' : 'text-white'}
                                `}
                                style={{
                                    top: `${topPosition}px`,
                                    textShadow: isInHighlight ? 'none' : '0 0 60px rgba(204, 255, 0, 0.4)',
                                    mixBlendMode: isInHighlight ? 'multiply' : 'normal',
                                }}
                            >
                                {name}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface AdvancedCursorTrailProps {
    enabled?: boolean;
}

// Your trail images from public/trail-images
const TRAIL_IMAGES = [
    "/trail-images/image1.avif",
    "/trail-images/image2.jpg",
    "/trail-images/image3.jpg",
    "/trail-images/image4.jpg",
    "/trail-images/image5.jpg",
    "/trail-images/image6.jpg",
    "/trail-images/image7.jpg",
    "/trail-images/image8.jpg",
    "/trail-images/image9.jpg",
    "/trail-images/image10.jpg",
    "/trail-images/image11.jpg",
    "/trail-images/image12.jpg",
    "/trail-images/image13.jpg",
    "/trail-images/image14.jpg",
];

// Timing configuration
const CONFIG = {
    imageLifespan: 1000,      // How long each image stays visible
    mouseThreshold: 150,      // Distance mouse must move before spawning new image
    inDuration: 750,          // Fade in duration
    outDuration: 1000,        // Fade out duration
    staggerIn: 100,           // Delay between multiple images appearing
    staggerOut: 25,           // Delay between multiple images disappearing
    slideDuration: 10000,     // Duration for slide animation
    slideEasing: "power2.inOut", // Easing for animations
    imageSize: 400,           // Size of images in pixels
};

interface TrailImage {
    id: number;
    x: number;
    y: number;
    imageIndex: number;
}

export function AdvancedCursorTrail({ enabled = true }: AdvancedCursorTrailProps) {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [trailImages, setTrailImages] = useState<TrailImage[]>([]);
    const lastSpawnPos = useRef({ x: 0, y: 0 });
    const imageCounter = useRef(0);
    const currentImageIndex = useRef(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!enabled || !mounted) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Update main cursor immediately
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.1,
                    ease: "power3.out",
                });
            }

            // Calculate distance from last spawn point
            const dx = e.clientX - lastSpawnPos.current.x;
            const dy = e.clientY - lastSpawnPos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Spawn new image if threshold is exceeded
            if (distance > CONFIG.mouseThreshold) {
                spawnImage(e.clientX, e.clientY);
                lastSpawnPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        const spawnImage = (x: number, y: number) => {
            const newImage: TrailImage = {
                id: imageCounter.current++,
                x,
                y,
                imageIndex: currentImageIndex.current,
            };

            // Cycle to next image
            currentImageIndex.current = (currentImageIndex.current + 1) % TRAIL_IMAGES.length;

            setTrailImages((prev) => [...prev, newImage]);

            // Remove image after lifespan
            setTimeout(() => {
                setTrailImages((prev) => prev.filter((img) => img.id !== newImage.id));
            }, CONFIG.imageLifespan + CONFIG.inDuration + CONFIG.outDuration);
        };

        const handleMouseEnter = () => {
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.3,
                });
            }
        };

        const handleMouseLeave = () => {
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                });
            }
            // Clear all trail images
            setTrailImages([]);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [enabled, mounted]);

    if (!enabled || !mounted) return null;

    return (
        <>
            {/* Hide default cursor */}
            <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

            <div className="fixed inset-0 pointer-events-none z-[9999]">
                {/* Main Cursor */}
                <div
                    ref={cursorRef}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6"
                    style={{ left: -100, top: -100 }}
                >
                    <div className="w-full h-full rounded-full border-2 border-primary bg-primary/30 backdrop-blur-sm shadow-lg shadow-primary/50" />
                </div>

                {/* Trail Images - One at a time */}
                {trailImages.map((image) => (
                    <TrailImageComponent
                        key={image.id}
                        image={image}
                        config={CONFIG}
                    />
                ))}
            </div>
        </>
    );
}

// Separate component for each trail image with animations
function TrailImageComponent({
    image,
    config
}: {
    image: TrailImage;
    config: typeof CONFIG;
}) {
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imageRef.current) return;

        const timeline = gsap.timeline();

        // Fade in
        timeline.fromTo(
            imageRef.current,
            {
                scale: 0,
                opacity: 0,
            },
            {
                scale: 1,
                opacity: 1,
                duration: config.inDuration / 1000,
                ease: config.slideEasing,
            }
        );

        // Stay visible
        timeline.to(imageRef.current, {
            duration: config.imageLifespan / 1000,
        });

        // Fade out
        timeline.to(imageRef.current, {
            scale: 0.8,
            opacity: 0,
            duration: config.outDuration / 1000,
            ease: config.slideEasing,
        });

        return () => {
            timeline.kill();
        };
    }, [config]);

    return (
        <div
            ref={imageRef}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
                left: image.x,
                top: image.y,
                width: config.imageSize,
                height: config.imageSize,
            }}
        >
            <div className="relative w-full h-full">
                <img
                    src={TRAIL_IMAGES[image.imageIndex]}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                />
                {/* Glow overlay */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        boxShadow: `0 0 ${config.imageSize * 0.6}px rgba(204, 255, 0, 0.3)`,
                    }}
                />
            </div>
        </div>
    );
}

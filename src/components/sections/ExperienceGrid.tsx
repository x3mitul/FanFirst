"use client";

import React from 'react';
import { motion } from 'framer-motion';

const categories = [
    { name: 'CONCERTS', count: '156 Shows' },
    { name: 'FESTIVALS', count: '23 Shows' },
    { name: 'SPORTS', count: '89 Shows' },
    { name: 'THEATER', count: '45 Shows' },
    { name: 'COMEDY', count: '34 Shows' },
];

export default function ExperienceGrid() {
    return (
        <section className="bg-black py-24 px-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-white text-5xl font-black mb-16 tracking-tight">
                    DISCOVER <br />
                    <span className="text-primary">EXPERIENCE</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 border-l border-white/10">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative h-[400px] border-r border-white/10 p-8 flex flex-col justify-center items-center cursor-pointer overflow-hidden"
                        >
                            {/* Hover Background Glow */}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 text-center">
                                <h3 className="text-white text-xl font-bold tracking-widest mb-2 group-hover:text-primary transition-colors duration-300">
                                    {cat.name}
                                </h3>
                                <p className="text-white/40 text-xs uppercase tracking-widest">
                                    {cat.count}
                                </p>
                            </div>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

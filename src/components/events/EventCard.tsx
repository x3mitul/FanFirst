"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Event } from "@/lib/types";
import { formatDate, formatPrice, cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  featured?: boolean;
  index?: number;
  isInView?: boolean;
}

export function EventCard({ event, index = 0, isInView = false }: EventCardProps) {
  const [isColored, setIsColored] = useState(false);
  const availableTickets = event.ticketTiers.reduce((sum, tier) => sum + tier.available, 0);
  const lowestPrice = Math.min(...event.ticketTiers.map((t) => t.price));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="w-full"
    >
      <Link href={`/events/${event.id}`} className="block">
        <article className={cn(
          "group relative bg-black border h-full flex overflow-hidden transition-all duration-300",
          isInView
            ? "border-[#dfff00] shadow-[0_0_30px_rgba(223,255,0,0.3)]"
            : "border-zinc-800 hover:border-[#ccff00]"
        )}>
          {/* Image Container - Left Side */}
          <div className="relative w-64 flex-shrink-0 overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
            />

            {/* Hard Tags */}
            <div className="absolute top-0 left-0 flex flex-col gap-0 z-10">
              <span className={cn(
                "px-3 py-1.5 text-xs font-black uppercase tracking-wider w-fit",
                event.status === "on-sale" && "bg-[#dfff00] text-black",
                event.status === "sold-out" && "bg-red-600 text-white",
                event.status === "upcoming" && "bg-white text-black"
              )}>
                {event.status.replace("-", " ")}
              </span>
              <span className="bg-black text-[#dfff00] text-xs font-bold px-3 py-1 border-b border-r border-zinc-800 w-fit">
                {event.category}
              </span>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-0 right-0 bg-[#dfff00] text-black px-4 py-2 font-black text-xl tracking-tighter shadow-[0_0_20px_rgba(223,255,0,0.5)]">
              {formatPrice(lowestPrice)}
            </div>
          </div>

          {/* Content - Right Side */}
          <div className="p-6 flex flex-col flex-1 relative bg-gradient-to-br from-black to-zinc-900">
            <h3 className="text-3xl font-black uppercase mb-3 leading-tight text-white group-hover:text-[#dfff00] transition-colors">
              {event.title}
            </h3>

            <div className="space-y-3 mb-auto">
              <div className="flex items-center gap-3 text-sm font-mono text-gray-400">
                <Calendar className="w-4 h-4 text-[#dfff00]" />
                <span className="uppercase">{formatDate(event.date)} @ {event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-mono text-gray-400">
                <MapPin className="w-4 h-4 text-[#dfff00]" />
                <span className="uppercase">{event.venue}, {event.location}</span>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#dfff00] shadow-[0_0_10px_rgba(223,255,0,0.3)]">
                  <Image src={event.artistImage} alt={event.artist} width={32} height={32} className="object-cover" />
                </div>
                <span className="text-sm font-bold uppercase text-gray-400 group-hover:text-[#dfff00] transition-colors">{event.artist}</span>
              </div>

              <div className="flex items-center gap-2 text-[#dfff00] font-mono text-sm font-bold">
                <Ticket className="w-4 h-4" />
                <span>{availableTickets} LEFT</span>
              </div>
            </div>

            {/* Hover Decoration */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowIcon />
            </div>

            {/* Neon accent line */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#dfff00] to-[#ccff00] opacity-0 transition-opacity duration-300",
              isInView && "opacity-100 shadow-[0_0_20px_rgba(223,255,0,0.5)]"
            )} />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#dfff00] transform -rotate-45">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

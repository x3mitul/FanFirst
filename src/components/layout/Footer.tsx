import Link from "next/link";
import { Ticket, Twitter, Instagram, Github, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { label: "EVENTS", href: "/events" },
    { label: "MARKET", href: "/resale" },
    { label: "PROTOCOL", href: "/how-it-works" },
    { label: "STATUS", href: "/status" },
  ],
  company: [
    { label: "MANIFESTO", href: "/about" },
    { label: "JOBS", href: "/careers" },
    { label: "TRANSMISSIONS", href: "/blog" },
  ],
  legal: [
    { label: "PRIVACY", href: "/privacy" },
    { label: "TERMS", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/fanfirst", label: "TWITTER" },
  { icon: Instagram, href: "https://instagram.com/fanfirst", label: "INSTAGRAM" },
  { icon: Github, href: "https://github.com/fanfirst", label: "GITHUB" },
];

export function Footer() {
  return (
    <footer className="bg-black border-t-2 border-zinc-800 text-white relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", 
               backgroundSize: "40px 40px" 
             }} 
        />

      <div className="relative z-10 max-w-7xl mx-auto border-x-2 border-zinc-800">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 border-b-2 border-zinc-800">
             <div className="col-span-1 lg:col-span-2 p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-zinc-800 bg-zinc-950/50">
                <Link href="/" className="flex items-center gap-2 mb-6 group w-fit">
                    <div className="bg-primary text-black p-2 border border-primary group-hover:bg-transparent group-hover:text-primary transition-all duration-300">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <span className="text-3xl font-black uppercase tracking-tighter">
                        FanFirst<span className="text-primary">.</span>
                    </span>
                 </Link>
                 <p className="text-zinc-400 font-mono text-sm max-w-md uppercase leading-relaxed">
                    System Version 2.0.4 <br/>
                    Eliminating scalpers through algorithmic verification and blockchain provenance.
                    <span className="block mt-4 text-primary">{'//'} NO BOTS ALLOWED</span>
                 </p>
             </div>

             <div className="col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3">
                 <div className="p-8 border-r-2 border-b-2 sm:border-b-0 border-zinc-800">
                    <h4 className="font-black text-primary mb-6 uppercase tracking-widest text-xs">Navigation</h4>
                    <ul className="space-y-4">
                        {footerLinks.product.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="flex items-center group">
                                    <span className="font-bold uppercase text-sm group-hover:text-primary transition-colors">{link.label}</span>
                                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                 </div>
                 <div className="p-8 border-r-2 border-zinc-800">
                    <h4 className="font-black text-primary mb-6 uppercase tracking-widest text-xs">Corp</h4>
                    <ul className="space-y-4">
                        {footerLinks.company.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="font-bold uppercase text-sm hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                 </div>
                 <div className="p-8 col-span-2 sm:col-span-1 border-t-2 sm:border-t-0 border-zinc-800">
                     <h4 className="font-black text-primary mb-6 uppercase tracking-widest text-xs">Connect</h4>
                     <ul className="space-y-4">
                        {socialLinks.map((social) => (
                            <li key={social.label}>
                                <a href={social.href} className="flex items-center gap-2 group text-sm font-bold uppercase hover:text-primary transition-colors">
                                    <social.icon className="w-4 h-4" />
                                    <span>{social.label}</span>
                                </a>
                            </li>
                        ))}
                     </ul>
                 </div>
             </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center bg-primary text-black font-bold uppercase text-xs tracking-wider">
            <div className="flex gap-6 mb-4 md:mb-0">
                <span>© 2024 FanFirst Protocol</span>
                <span className="hidden md:inline">|</span>
                <span>System Status: Operational</span>
            </div>
            <div className="flex gap-6">
                {footerLinks.legal.map((link) => (
                     <Link key={link.href} href={link.href} className="hover:underline decoration-2 underline-offset-4">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>

      </div>
    </footer>
  );
}

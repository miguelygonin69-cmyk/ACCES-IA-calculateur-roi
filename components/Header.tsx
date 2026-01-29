import React from 'react';
import { Sparkles, Phone } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          {/* Logo style "Pépite d'or" sans fond - Couleur Bleu Nuit #1a365d via variable theme */}
          <Sparkles className="h-8 w-8 text-brand-dark fill-brand-dark drop-shadow-sm" />
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-brand-dark tracking-tight uppercase">Acces IA</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-widest">STRATEGIE & SOLUTIONS</p>
          </div>
        </div>

        {/* Contact Minimaliste */}
        <div className="hidden md:flex items-center gap-4">
            <div className="text-right hidden lg:block">
                <p className="text-xs text-gray-400 font-medium">Besoin d'aide pour interpréter ?</p>
                <p className="text-sm font-bold text-brand-dark">Consultation Gratuite</p>
            </div>
            <a href="tel:0744880610" className="flex items-center gap-2 bg-brand-dark hover:bg-slate-800 text-white px-5 py-2 rounded-full transition-all shadow-md transform hover:-translate-y-0.5 text-sm font-medium">
                <Phone size={14} />
                <span>07 44 88 06 10</span>
            </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
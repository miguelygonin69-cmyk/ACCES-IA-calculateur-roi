import React from 'react';
import { Sparkles, ChevronDown, Phone } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-dark text-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="p-1">
            <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Nexalis Solutions</h1>
            <p className="text-[10px] md:text-xs text-gray-300 font-medium tracking-wider">CONSEIL EN STRATÉGIE & PERFORMANCE IA</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 text-sm font-medium items-center">
            
            {/* Expertise Dropdown */}
            <li className="group relative">
              <button className="flex items-center gap-1 hover:text-brand-accent transition-colors duration-200 focus:outline-none">
                Expertise
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">IA</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Automatisation</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Changement d’organisation</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Nouvel outil / process</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Accompagnement</a>
                </div>
              </div>
            </li>

            {/* Secteurs Dropdown */}
            <li className="group relative">
              <button className="flex items-center gap-1 hover:text-brand-accent transition-colors duration-200 focus:outline-none">
                Secteurs
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Dirigeants de PME / TPE</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 hover:text-brand-accent transition-colors border-l-4 border-transparent hover:border-brand-accent">Responsables d’équipe</a>
                </div>
              </div>
            </li>

            {/* Contact Phone Button */}
            <li>
              <a href="tel:0744880610" className="flex items-center gap-2 bg-brand-accent hover:bg-green-600 text-white px-5 py-2.5 rounded-full transition-all shadow-md transform hover:-translate-y-0.5 font-bold">
                <Phone size={16} />
                <span>07 44 88 06 10</span>
              </a>
            </li>

          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
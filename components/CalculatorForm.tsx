import React, { useState } from 'react';
import { CalculatorInputs, Industry } from '../types';
import { Calculator, ArrowRight, Users, Euro, Clock, HelpCircle } from 'lucide-react';

interface Props {
  onCalculate: (data: CalculatorInputs) => void;
  isLoading: boolean;
}

const CalculatorForm: React.FC<Props> = ({ onCalculate, isLoading }) => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    employees: 20,
    hourlyWage: 35,
    hoursRepetitive: 8,
    industry: Industry.SERVICES
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'industry' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent"></div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-2 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-brand-primary" />
          Paramètres de l'étude
        </h2>
        <p className="text-gray-500 text-sm">Ajustez les curseurs pour refléter la réalité de votre structure.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 flex-grow">
        
        {/* Secteur */}
        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-semibold text-gray-700">
            Secteur d'activité
          </label>
          <div className="relative">
            <select
              id="industry"
              name="industry"
              value={inputs.industry}
              onChange={handleChange}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer appearance-none font-medium text-gray-700"
            >
              {Object.values(Industry).map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
        </div>

        {/* Employés Slider */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center">
            <label htmlFor="employees" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={18} className="text-brand-primary" />
              Nombre d'employés
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                <input
                    type="number"
                    value={inputs.employees}
                    onChange={handleChange}
                    name="employees"
                    className="w-12 text-right font-bold text-brand-dark outline-none border-none p-0 text-sm"
                />
                <span className="text-xs text-gray-400 ml-1">pers.</span>
            </div>
          </div>
          <input
            type="range"
            name="employees"
            min="1"
            max="500"
            step="1"
            value={inputs.employees}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
        </div>

        {/* Salaire Slider */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
           <div className="flex justify-between items-center">
            <label htmlFor="hourlyWage" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Euro size={18} className="text-brand-primary" />
              Salaire horaire moyen
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                <input
                    type="number"
                    value={inputs.hourlyWage}
                    onChange={handleChange}
                    name="hourlyWage"
                    className="w-12 text-right font-bold text-brand-dark outline-none border-none p-0 text-sm"
                />
                <span className="text-xs text-gray-400 ml-1">€</span>
            </div>
          </div>
          <input
            type="range"
            name="hourlyWage"
            min="15"
            max="200"
            step="1"
            value={inputs.hourlyWage}
            onChange={handleChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
        </div>

        {/* Heures répétitives Slider */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center">
            <label htmlFor="hoursRepetitive" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
               <Clock size={18} className="text-brand-primary" />
              Tâches répétitives / semaine
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                <input
                    type="number"
                    value={inputs.hoursRepetitive}
                    onChange={handleChange}
                    name="hoursRepetitive"
                    className="w-12 text-right font-bold text-brand-dark outline-none border-none p-0 text-sm"
                />
                <span className="text-xs text-gray-400 ml-1">h/pers</span>
            </div>
          </div>
          <input
            type="range"
            name="hoursRepetitive"
            min="0"
            max="35"
            step="0.5"
            value={inputs.hoursRepetitive}
            onChange={handleChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex items-start gap-2 mt-2">
            <HelpCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-snug">
              Par employé (saisie, e-mails, reporting, etc.)
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 mt-6 rounded-xl font-bold text-white text-lg shadow-lg shadow-brand-primary/30 transition-all flex items-center justify-center gap-3
            ${isLoading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-primary hover:bg-blue-800 hover:scale-[1.02] active:scale-[0.98]'}
          `}
        >
          {isLoading ? (
             <span className="flex items-center gap-2">Calcul en cours...</span>
          ) : (
             <>Calculer mon ROI <ArrowRight className="h-5 w-5" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default CalculatorForm;
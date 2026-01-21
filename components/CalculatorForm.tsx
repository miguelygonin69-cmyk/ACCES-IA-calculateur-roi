import React, { useState } from 'react';
import { CalculatorInputs, Industry } from '../types';
import { Calculator, ArrowRight, Users, Euro, Clock } from 'lucide-react';

interface Props {
  onCalculate: (data: CalculatorInputs) => void;
  isLoading: boolean;
}

const CalculatorForm: React.FC<Props> = ({ onCalculate, isLoading }) => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    employees: 10,
    hourlyWage: 25,
    hoursRepetitive: 5,
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-dark mb-2 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-brand-accent" />
          Vos Données
        </h2>
        <p className="text-gray-600 text-sm">Remplissez ce formulaire ou utilisez les curseurs pour estimer votre potentiel.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 flex-grow">
        
        {/* Secteur */}
        <div>
          <label htmlFor="industry" className="block text-sm font-bold text-gray-700 mb-2">
            Secteur d'activité
          </label>
          <select
            id="industry"
            name="industry"
            value={inputs.industry}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-dark focus:border-brand-dark transition-all bg-gray-50 cursor-pointer"
          >
            {Object.values(Industry).map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Employés Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="employees" className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Users size={16} className="text-brand-dark" />
              Nombre d'employés concernés
            </label>
            <span className="text-brand-accent font-bold bg-green-50 px-2 py-1 rounded text-sm">
              {inputs.employees} pers.
            </span>
          </div>
          <input
            type="range"
            name="employees"
            min="1"
            max="200"
            step="1"
            value={inputs.employees}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent mb-2"
          />
          <input
            type="number"
            id="employees"
            name="employees"
            min="1"
            value={inputs.employees}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-dark focus:border-brand-dark transition-all"
          />
        </div>

        {/* Salaire Slider */}
        <div>
           <div className="flex justify-between items-center mb-2">
            <label htmlFor="hourlyWage" className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Euro size={16} className="text-brand-dark" />
              Salaire horaire moyen (chargé)
            </label>
            <span className="text-brand-accent font-bold bg-green-50 px-2 py-1 rounded text-sm">
              {inputs.hourlyWage} €/h
            </span>
          </div>
          <input
            type="range"
            name="hourlyWage"
            min="15"
            max="150"
            step="1"
            value={inputs.hourlyWage}
            onChange={handleChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent mb-2"
          />
          <input
            type="number"
            id="hourlyWage"
            name="hourlyWage"
            min="1"
            value={inputs.hourlyWage}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-dark focus:border-brand-dark transition-all"
          />
        </div>

        {/* Heures répétitives Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="hoursRepetitive" className="flex items-center gap-2 text-sm font-bold text-gray-700">
               <Clock size={16} className="text-brand-dark" />
              Heures répétitives / semaine
            </label>
            <span className="text-brand-accent font-bold bg-green-50 px-2 py-1 rounded text-sm">
              {inputs.hoursRepetitive} h
            </span>
          </div>
          <input
            type="range"
            name="hoursRepetitive"
            min="0"
            max="35"
            step="0.5"
            value={inputs.hoursRepetitive}
            onChange={handleChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent mb-2"
          />
           <input
            type="number"
            id="hoursRepetitive"
            name="hoursRepetitive"
            min="0"
            step="0.5"
            value={inputs.hoursRepetitive}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-dark focus:border-brand-dark transition-all"
          />
          <p className="text-xs text-gray-500 mt-2 italic">
            Ex: Saisie de données, reporting, emails standards...
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 mt-6 rounded-lg font-bold text-white text-lg shadow-md transition-all flex items-center justify-center gap-2
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-accent hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'}
          `}
        >
          {isLoading ? 'Calcul en cours...' : 'Calculer mon ROI'}
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
};

export default CalculatorForm;
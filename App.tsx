import React, { useState, useRef } from 'react';
import Header from './components/Header';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import { CalculatorInputs, CalculationResult, ChartDataPoint } from './types';
import { generateStrategicInsight } from './services/geminiService';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null); // Store inputs for the report
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = async (data: CalculatorInputs) => {
    setLoading(true);
    setResults(null); // Reset to trigger animation if needed or clear old state
    setAiInsight(null);
    setInputs(data); // Save inputs for the report context

    // Business Logic Constants
    const WEEKS_PER_YEAR = 47;
    const EFFICIENCY_FACTOR = 0.75; // AI solves 75% of repetitive tasks

    // Calculations
    const totalRepetitiveHoursPerYear = data.employees * data.hoursRepetitive * WEEKS_PER_YEAR;
    const totalHoursSaved = Math.round(totalRepetitiveHoursPerYear * EFFICIENCY_FACTOR);
    const annualSavings = Math.round(totalHoursSaved * data.hourlyWage);
    const threeYearRoi = annualSavings * 3;
    
    // Cost Basis Calculation for Chart
    const currentCostRepetitive = totalRepetitiveHoursPerYear * data.hourlyWage;
    const costWithAi = currentCostRepetitive - annualSavings; // Remaining cost of repetitive tasks

    const calculatedResults: CalculationResult = {
      totalHoursSaved,
      annualSavings,
      threeYearRoi,
      currentCost: currentCostRepetitive,
      costWithAi
    };

    const newChartData: ChartDataPoint[] = [
      { name: 'Coût Actuel', montant: currentCostRepetitive, fill: '#ef4444' }, // Red for cost
      { name: 'Coût avec IA', montant: costWithAi, fill: '#1a365d' }, // Brand Dark
      { name: 'Économies', montant: annualSavings, fill: '#38a169' }, // Brand Accent
    ];

    // Artificial delay for UX (0.5s) then set math results
    setTimeout(async () => {
      setResults(calculatedResults);
      setChartData(newChartData);
      
      // Scroll to results on mobile
      if (window.innerWidth < 768 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      // Fetch AI Insight
      const insight = await generateStrategicInsight(data, calculatedResults);
      setAiInsight(insight);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* Hero Text - Hidden in Print */}
        <div className="text-center mb-10 max-w-2xl mx-auto print:hidden">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
            Calculez l'impact de l'IA sur votre rentabilité
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez combien de temps et d'argent votre entreprise perd sur des tâches répétitives et ce que l'automatisation intelligente peut vous rapporter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section - Hidden in Print */}
          <div className="lg:col-span-5 w-full print:hidden">
            <CalculatorForm onCalculate={handleCalculate} isLoading={loading} />
          </div>

          {/* Results Section - Full Width in Print */}
          <div className="lg:col-span-7 w-full print:col-span-12 print:w-full" ref={resultsRef}>
            {results && inputs ? (
              <ResultsDisplay 
                results={results} 
                chartData={chartData} 
                aiInsight={aiInsight}
                isAiLoading={loading || (results && !aiInsight)}
                inputs={inputs}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col justify-center items-center opacity-60 print:hidden">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                   <Sparkles className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500">En attente de données</h3>
                <p className="text-gray-400 mt-2 max-w-sm">
                  Remplissez le formulaire ci-contre pour générer votre projection financière et stratégique.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-brand-dark text-white py-8 mt-12 print:hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-75 text-sm">
            © {new Date().getFullYear()} Nexalis Solutions. Tous droits réservés.
          </p>
          <p className="opacity-50 text-xs mt-2">
            Les résultats sont des estimations basées sur les données fournies et des moyennes du secteur.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
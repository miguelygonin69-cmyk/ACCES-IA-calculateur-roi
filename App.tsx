import React, { useState, useRef } from 'react';
import Header from './components/Header';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import { CalculatorInputs, CalculationResult, ChartDataPoint } from './types';
import { generateStrategicInsight } from './services/geminiService';
import { Sparkles, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = async (data: CalculatorInputs) => {
    setLoading(true);
    setResults(null); 
    setAiInsight(null);
    setInputs(data);

    // Business Logic
    const WEEKS_PER_YEAR = 47;
    const EFFICIENCY_FACTOR = 0.75; 

    const totalRepetitiveHoursPerYear = data.employees * data.hoursRepetitive * WEEKS_PER_YEAR;
    const totalHoursSaved = Math.round(totalRepetitiveHoursPerYear * EFFICIENCY_FACTOR);
    const annualSavings = Math.round(totalHoursSaved * data.hourlyWage);
    const threeYearRoi = annualSavings * 3;
    
    const currentCostRepetitive = totalRepetitiveHoursPerYear * data.hourlyWage;
    const costWithAi = currentCostRepetitive - annualSavings; 

    const calculatedResults: CalculationResult = {
      totalHoursSaved,
      annualSavings,
      threeYearRoi,
      currentCost: currentCostRepetitive,
      costWithAi
    };

    // Graphique : Coût actuel vs Coût avec IA vs Économies générées
    const newChartData: ChartDataPoint[] = [
      { name: 'Coût actuel', montant: currentCostRepetitive, fill: '#ef4444' }, // Rouge (Alerte)
      { name: 'Coût avec IA', montant: costWithAi, fill: '#1a365d' }, // Bleu Nuit (Brand Dark)
      { name: 'Économies générées', montant: annualSavings, fill: '#38a169' }, // Vert Émeraude (Brand Accent)
    ];

    // Simulation délai calcul + Appel API
    setTimeout(async () => {
      setResults(calculatedResults);
      setChartData(newChartData);
      
      if (window.innerWidth < 1024 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Appel Gemini
      const insight = await generateStrategicInsight(data, calculatedResults);
      setAiInsight(insight);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-dark text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
             <TrendingUp size={14} /> Simulateur de Performance
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-6 leading-tight">
            Calculateur ROI Intelligence Artificielle
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Estimez instantanément le ROI potentiel de l'intégration de l'IA générative dans vos processus opérationnels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:col-span-5 w-full print:hidden z-10">
            <CalculatorForm onCalculate={handleCalculate} isLoading={loading} />
          </div>

          {/* Results Section */}
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
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center h-full min-h-[400px] flex flex-col justify-center items-center print:hidden">
                <div className="bg-white p-6 rounded-full shadow-soft mb-6 animate-float">
                   <Sparkles className="h-12 w-12 text-brand-accent/40" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">En attente de configuration</h3>
                <p className="text-gray-400 max-w-xs mx-auto text-sm">
                  Complétez les paramètres à gauche pour générer votre audit financier personnalisé.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-12 print:hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="text-brand-dark font-bold text-sm mb-1">Nexalis Solutions</p>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} - Outil d'aide à la décision. Les résultats sont des estimations.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { CalculationResult, ChartDataPoint, CalculatorInputs } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp, Wallet, Sparkles, CalendarDays, Copy, Check, Download, Loader2, Info } from 'lucide-react';

interface Props {
  results: CalculationResult;
  chartData: ChartDataPoint[];
  aiInsight: string | null;
  isAiLoading: boolean;
  inputs: CalculatorInputs;
}

const ResultsDisplay: React.FC<Props> = ({ results, chartData, aiInsight, isAiLoading, inputs }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    
    // 1. Cibler l'élément source original
    const originalElement = document.getElementById('results-container');
    if (!originalElement) {
        setIsGeneratingPdf(false);
        return;
    }

    // 2. Créer un clone profond pour ne PAS perturber l'affichage actuel (évite les bugs Recharts/React)
    const clone = originalElement.cloneNode(true) as HTMLElement;

    // 3. Manipuler uniquement le clone (Nettoyage)
    
    // Supprimer la barre d'outils du clone
    const toolbar = clone.querySelector('#action-toolbar');
    if (toolbar) toolbar.remove();

    // Supprimer le CTA du clone
    const cta = clone.querySelector('#cta-section');
    if (cta) cta.remove();

    // Afficher l'en-tête dans le clone (il a la classe 'hidden' par défaut)
    const header = clone.querySelector('#report-header');
    if (header) {
      header.classList.remove('hidden');
      header.classList.remove('print:block'); // Sécurité
      header.classList.add('block');
    }

    // 4. Créer un conteneur temporaire hors écran avec une largeur fixe (simule un écran de bureau/A4)
    // Cela garantit que le PDF a toujours la même mise en page, même généré depuis un mobile.
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '800px'; // Largeur fixe idéale pour A4
    wrapper.style.backgroundColor = '#ffffff'; // Fond blanc forcé
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 5. Configuration de html2pdf
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Rapport-ROI-Nexalis-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false, // DÉSACTIVER les logs dans la console
        windowWidth: 800 // Simule une fenêtre de 800px pour le rendu
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(clone).save();
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Une erreur est survenue lors de la création du PDF.");
    } finally {
      // 6. Nettoyage
      document.body.removeChild(wrapper);
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    const text = `
Rapport ROI - Nexalis Solutions
-------------------------------
Secteur: ${inputs.industry}
Employés: ${inputs.employees}

RÉSULTATS:
- Heures économisées/an: ${formatNumber(results.totalHoursSaved)} h
- Économies annuelles: ${formatCurrency(results.annualSavings)}
- Gain sur 3 ans: ${formatCurrency(results.threeYearRoi)}

ANALYSE IA:
${aiInsight || 'Analyse en cours...'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div id="results-container" className="space-y-6 animate-fade-in print:space-y-4 bg-white p-2 md:p-0">
      
      {/* --- Action Toolbar --- */}
      <div id="action-toolbar" className="flex flex-wrap justify-end gap-3 print:hidden mb-2">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-brand-dark transition-colors shadow-sm"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          {copied ? 'Copié !' : 'Copier le résumé'}
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-dark rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
        >
          {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isGeneratingPdf ? 'Génération...' : 'Télécharger le PDF'}
        </button>
      </div>

      {/* --- REPORT HEADER (Visible ONLY during PDF Gen or Print) --- */}
      <div id="report-header" className="hidden print:block border-b-2 border-brand-dark pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="p-1">
                <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark uppercase tracking-tight">Nexalis Solutions</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Conseil en Stratégie & Performance IA</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">RAPPORT D'ANALYSE D'OPPORTUNITÉ</h2>
            <p className="text-sm text-gray-500 mt-1">Généré le {currentDate}</p>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100 flex gap-8 text-sm">
           <div>
             <span className="block text-gray-500 font-semibold uppercase text-xs">Secteur</span>
             <span className="font-bold text-gray-800">{inputs.industry}</span>
           </div>
           <div>
             <span className="block text-gray-500 font-semibold uppercase text-xs">Périmètre</span>
             <span className="font-bold text-gray-800">{inputs.employees} collaborateurs</span>
           </div>
           <div>
             <span className="block text-gray-500 font-semibold uppercase text-xs">Salaire Moyen</span>
             <span className="font-bold text-gray-800">{inputs.hourlyWage}€ /heure</span>
           </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-brand-dark print:border border-gray-200 print:shadow-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full print:bg-transparent print:p-0">
              <Clock className="h-5 w-5 text-brand-dark" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Heures Économisées / An</h3>
          </div>
          <p className="text-3xl font-bold text-brand-dark">{formatNumber(results.totalHoursSaved)} h</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-brand-accent print:border border-gray-200 print:shadow-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-full print:bg-transparent print:p-0">
              <Wallet className="h-5 w-5 text-brand-accent" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Économies Annuelles</h3>
          </div>
          <p className="text-3xl font-bold text-brand-accent">{formatCurrency(results.annualSavings)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-indigo-500 print:border border-gray-200 print:shadow-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-full print:bg-transparent print:p-0">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Projection sur 3 ans</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{formatCurrency(results.threeYearRoi)}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-md print:shadow-none print:border print:border-gray-200 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-brand-dark mb-6">Comparatif des Coûts & Gains</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `${val / 1000}k€`} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f7fafc' }}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="montant" radius={[6, 6, 0, 0]} barSize={50}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-r from-brand-dark to-blue-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden print:bg-none print:bg-white print:text-black print:border print:border-gray-300 print:shadow-none print:break-inside-avoid">
        <div className="absolute top-0 right-0 p-4 opacity-10 print:hidden">
          <Sparkles size={120} />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-brand-accent print:text-brand-dark">
            <Sparkles className="h-5 w-5" />
            Analyse Stratégique IA
          </h3>
          
          <div className="text-sm md:text-base leading-relaxed text-gray-100 min-h-[80px] print:text-gray-800">
            {isAiLoading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-2 w-2 bg-white rounded-full animate-bounce print:bg-gray-400" style={{ animationDelay: '0ms'}}></div>
                <div className="h-2 w-2 bg-white rounded-full animate-bounce print:bg-gray-400" style={{ animationDelay: '150ms'}}></div>
                <div className="h-2 w-2 bg-white rounded-full animate-bounce print:bg-gray-400" style={{ animationDelay: '300ms'}}></div>
                <span className="text-gray-300 italic print:text-gray-500">Notre IA analyse votre potentiel...</span>
              </div>
            ) : aiInsight ? (
              <p>"{aiInsight}"</p>
            ) : (
              <p className="italic opacity-80">Lancez le calcul pour obtenir une analyse personnalisée.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Methodology Section (Trust Builder) */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 print:break-inside-avoid">
        <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <Info size={16} />
            Méthodologie & Hypothèses de calcul
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
                <p className="mb-1"><span className="font-medium text-gray-700">Base annuelle :</span> 47 semaines travaillées (hors congés payés).</p>
                <p><span className="font-medium text-gray-700">Coût employeur :</span> Basé sur le salaire horaire chargé saisi.</p>
            </div>
            <div>
                <p className="mb-1"><span className="font-medium text-gray-700">Facteur d'efficacité IA :</span> 75% de réduction du temps sur les tâches identifiées comme répétitives.</p>
                <p><span className="font-medium text-gray-700">ROI 3 ans :</span> Projection linéaire sans ajustement d'inflation.</p>
            </div>
        </div>
      </div>

      {/* CTA Section - Hidden in Print or PDF */}
      <div id="cta-section" className="text-center pt-8 print:hidden">
        <a 
          href="https://calendly.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-brand-accent hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg"
        >
          <CalendarDays className="h-6 w-6" />
          Réserver un appel découverte
        </a>
        <p className="text-gray-500 text-sm mt-3">Discutons de vos résultats et de la mise en œuvre.</p>
      </div>

       {/* Footer for Print Only */}
       <div className="hidden print:block text-center mt-12 pt-8 border-t border-gray-200 text-xs text-gray-500">
          <p>Nexalis Solutions - contact@nexalis-solutions.com - 07 44 88 06 10</p>
          <p>Document généré automatiquement à titre indicatif.</p>
       </div>

    </div>
  );
};

export default ResultsDisplay;
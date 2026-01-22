import React, { useState } from 'react';
import { CalculationResult, ChartDataPoint, CalculatorInputs } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp, Wallet, Sparkles, Copy, Check, Download, Loader2, AlertTriangle, Target, Calendar } from 'lucide-react';

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

  // Perte mensuelle (Coût de l'inaction)
  const monthlyLoss = Math.round(results.currentCost / 12);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    
    const originalElement = document.getElementById('results-container');
    if (!originalElement) { setIsGeneratingPdf(false); return; }

    const A4_WIDTH_PX = 794; 
    
    // 1. Overlay blanc qui couvre tout l'écran
    // IMPORTANT : On aligne tout en haut à gauche (0,0) sans Flexbox center
    // Cela évite que html2canvas ne "coupe" le début de l'image à cause d'un offset X
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor = '#ffffff';
    overlay.style.overflow = 'hidden'; // Pas de scrollbars
    
    // 2. Conteneur spécifique pour la capture (Format A4)
    const printContainer = document.createElement('div');
    printContainer.style.width = `${A4_WIDTH_PX}px`;
    printContainer.style.backgroundColor = '#ffffff'; 
    // Marges internes du document PDF (padding CSS)
    printContainer.style.padding = '30px 40px'; 
    printContainer.style.boxSizing = 'border-box'; // Le padding est inclus dans les 794px
    printContainer.className = 'font-sans text-slate-900'; 

    // 3. Clonage
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Nettoyage et style du clone
    clone.classList.remove('animate-fade-in');
    clone.style.animation = 'none';
    clone.style.width = '100%';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    
    // CORRECTION LAYOUT : On force la grille 3 colonnes
    // Le format A4 avec padding (714px) est < 768px (breakpoint md), donc Tailwind passerait en 1 colonne.
    // On force manuellement la classe grid-cols-3.
    const grids = clone.querySelectorAll('.md\\:grid-cols-3');
    grids.forEach(el => {
      el.classList.remove('md:grid-cols-3', 'grid-cols-1');
      el.classList.add('grid-cols-3');
    });

    // Retrait des éléments inutiles
    const toolbar = clone.querySelector('#action-toolbar');
    if (toolbar) toolbar.remove();
    const cta = clone.querySelector('#cta-section');
    if (cta) cta.remove();

    // Affichage Header
    const header = clone.querySelector('#report-header');
    if (header) {
      header.classList.remove('hidden');
      header.classList.add('block');
    }

    printContainer.appendChild(clone);
    overlay.appendChild(printContainer);
    document.body.appendChild(overlay);

    // Feedback visuel
    const feedback = document.createElement('div');
    feedback.innerText = "Génération du rapport PDF...";
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.background = '#0f172a';
    feedback.style.color = 'white';
    feedback.style.padding = '16px 32px';
    feedback.style.borderRadius = '12px';
    feedback.style.zIndex = '10000';
    feedback.style.fontWeight = '600';
    feedback.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    document.body.appendChild(feedback);

    // Pause pour rendu
    await new Promise(resolve => setTimeout(resolve, 1500));

    const opt = {
      margin: 0, // On utilise le padding du printContainer pour les marges
      filename: `Nexalis_Audit_ROI_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollY: 0,
        scrollX: 0, // CRITIQUE : Force le début de capture à gauche
        windowWidth: A4_WIDTH_PX,
        width: A4_WIDTH_PX,
        x: 0, // CRITIQUE : Force l'origine X
        y: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(printContainer).save();
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
      if (document.body.contains(feedback)) document.body.removeChild(feedback);
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    const text = `Rapport ROI Nexalis Solutions\nSecteur: ${inputs.industry}\nGain annuel estimé: ${formatCurrency(results.annualSavings)}\nAnalyse: ${aiInsight}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="results-container" className="space-y-6 animate-fade-in bg-white md:bg-transparent relative">
      
      {/* Actions */}
      <div id="action-toolbar" className="flex justify-end gap-3 print:hidden mb-2">
        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
        <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-dark rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70">
          {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isGeneratingPdf ? 'Export PDF...' : 'Exporter PDF'}
        </button>
      </div>

      {/* Header PDF Only */}
      <div id="report-header" className="hidden mb-8 border-b-2 border-brand-primary pb-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-brand-dark">Nexalis Solutions</h1>
            <span className="text-sm text-gray-500">Rapport d'opportunité IA</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
            Audit généré le {new Date().toLocaleDateString('fr-FR')} pour une entreprise du secteur <b>{inputs.industry}</b> ({inputs.employees} employés).
        </div>
      </div>

      {/* Warning: Cost of Inaction */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
             <AlertTriangle className="text-orange-600 h-6 w-6" />
        </div>
        <div>
            <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide mb-1">Coût de l'inaction</h4>
            <p className="text-orange-800 text-sm leading-relaxed">
                Sans modernisation, vos processus actuels vous coûtent environ <span className="font-bold underline decoration-orange-300 decoration-2">{formatCurrency(monthlyLoss)} chaque mois</span>.
            </p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productivité</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{formatNumber(results.totalHoursSaved)} h</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-brand-primary" />
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Heures économisées / an</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 ring-2 ring-brand-accent/10 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/10 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider">Économies Annuelles</p>
                    <p className="text-2xl font-extrabold text-brand-accent mt-1">{formatCurrency(results.annualSavings)}</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                    <Wallet className="h-5 w-5 text-brand-accent" />
                </div>
            </div>
             <p className="text-xs text-green-700/80 mt-auto bg-green-50 inline-block px-2 py-1 rounded font-medium self-start">
                + Impact marge immédiat
            </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-full">
             <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ROI 3 Ans</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{formatCurrency(results.threeYearRoi)}</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Estimation du ROI sur 3 ans</p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-brand-dark rounded-2xl p-6 shadow-card text-white relative overflow-hidden print:bg-white print:text-black print:border print:border-gray-200">
         <div className="absolute -right-10 -top-10 bg-white/5 w-40 h-40 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="flex items-center gap-2 text-brand-accent font-bold mb-4 uppercase text-xs tracking-widest">
                <Sparkles size={14} /> Recommandation Stratégique
            </h3>
            <div className="font-serif italic text-lg leading-relaxed text-gray-100 print:text-gray-800 border-l-4 border-brand-accent pl-4">
                {isAiLoading ? (
                    <span className="animate-pulse">Analyse de vos données en cours par nos modèles...</span>
                ) : (
                    aiInsight || "Génération de l'analyse..."
                )}
            </div>
         </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 print:break-inside-avoid">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Target size={18} className="text-brand-primary" />
            Comparatif des coûts & gains
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Call to Action */}
      <div id="cta-section" className="mt-8 text-center bg-brand-primary/5 rounded-xl p-8 border border-brand-primary/10 print:hidden">
        <h4 className="font-bold text-brand-dark text-lg mb-2">Transformez ce potentiel en réalité</h4>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">Ces chiffres sont théoriques. Pour une analyse fine de vos process et une feuille de route d'implémentation, parlons-en.</p>
        <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <Calendar size={18} />
            Réserver un appel découverte
        </a>
      </div>
    </div>
  );
};

export default ResultsDisplay;
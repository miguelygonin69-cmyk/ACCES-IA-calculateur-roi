import React, { useState } from 'react';
import { CalculationResult, ChartDataPoint, CalculatorInputs } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp, Wallet, Sparkles, Copy, Check, Download, Loader2, AlertTriangle, Target, Calendar, ArrowRight } from 'lucide-react';

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

  const monthlyLoss = Math.round(results.currentCost / 12);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val);

  // Fonction utilitaire pour parser le markdown simple en éléments React stylisés
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Séparer par lignes mais garder les sauts de ligne pour l'analyse
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Titres H2 (## Titre)
      if (line.trim().startsWith('##')) {
        return (
          <h4 key={index} className="text-brand-accent font-bold text-lg mt-6 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
            {line.replace(/##/g, '').trim()}
          </h4>
        );
      }
      
      // Listes à puces (- Item)
      if (line.trim().startsWith('-')) {
        const content = line.trim().substring(1).trim();
        // Gestion du gras (**Gras**)
        const parts = content.split(/(\*\*.*?\*\*)/g);
        
        return (
          <div key={index} className="flex items-start gap-3 mb-3 pl-2 group">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0 group-hover:scale-150 transition-transform"></span>
            <p className="text-gray-300 text-sm leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
              })}
            </p>
          </div>
        );
      }

      // Paragraphes normaux (sauter les lignes vides excessives)
      if (line.trim() === '') return <div key={index} className="h-2"></div>;

      // Gestion du gras dans les paragraphes standards
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-gray-300 text-sm leading-relaxed mb-2">
           {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
           })}
        </p>
      );
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    
    const originalElement = document.getElementById('results-container');
    if (!originalElement) { 
      setIsGeneratingPdf(false); 
      return; 
    }

    // Largeur A4 en pixels (210mm à 96 DPI)
    const A4_WIDTH_PX = 700;
    
    window.scrollTo(0, 0);

    // Overlay plein écran
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 9999;
      overflow: auto;
      padding: 20px;
    `;

    // Conteneur calibré A4
    const container = document.createElement('div');
    container.style.cssText = `
      width: ${A4_WIDTH_PX}px;
      margin: 0 auto;
      background: white;
      font-family: 'Inter', sans-serif;
      padding: 30px;
      box-sizing: border-box;
    `;

    // Clone du contenu
    const clone = originalElement.cloneNode(true) as HTMLElement;
    clone.classList.remove('animate-fade-in', 'md:bg-transparent');
    clone.style.cssText = 'width: 100%; margin: 0; box-shadow: none;';
    
    // Forcer grille 3 colonnes pour les KPIs
    const grids = clone.querySelectorAll('.md\\:grid-cols-3');
    grids.forEach(el => {
      (el as HTMLElement).classList.remove('md:grid-cols-3', 'grid-cols-1');
      (el as HTMLElement).classList.add('grid-cols-3');
      (el as HTMLElement).style.display = 'grid';
      (el as HTMLElement).style.gridTemplateColumns = '1fr 1fr 1fr';
      (el as HTMLElement).style.gap = '12px';
    });

    // Retirer éléments non nécessaires
    clone.querySelector('#action-toolbar')?.remove();
    clone.querySelector('#cta-section')?.remove();

    // Afficher le header
    const header = clone.querySelector('#report-header');
    if (header) {
      (header as HTMLElement).classList.remove('hidden');
      (header as HTMLElement).style.display = 'block';
    }

    // Conversion pour impression (textes clairs sur fonds sombres)
    const aiSection = clone.querySelector('#ai-section');
    if (aiSection) {
       (aiSection as HTMLElement).classList.remove('bg-brand-dark', 'text-white');
       (aiSection as HTMLElement).classList.add('bg-white', 'text-slate-900', 'border', 'border-gray-200');
       
       const title = aiSection.querySelector('h3');
       if (title) title.classList.remove('text-brand-accent');
       if (title) title.classList.add('text-brand-dark');
       
       // Note: Since we are parsing manually now, the PDF generation might lose styles if we rely only on class changes.
       // However, html2pdf should capture the DOM state. 
       // Just ensuring text colors are readable.
       const textElements = aiSection.querySelectorAll('p, div, span, li');
       textElements.forEach(el => {
           if (el.classList.contains('text-gray-300')) {
             el.classList.remove('text-gray-300');
             el.classList.add('text-slate-600');
           }
           if (el.classList.contains('text-white')) {
             el.classList.remove('text-white');
             el.classList.add('text-slate-900');
           }
       });
       
       const strongs = aiSection.querySelectorAll('strong');
       strongs.forEach(el => {
            el.classList.remove('text-white');
            el.classList.add('text-brand-dark');
       });

       const h4s = aiSection.querySelectorAll('h4');
       h4s.forEach(el => {
            el.classList.remove('text-brand-accent', 'border-white/10');
            el.classList.add('text-brand-primary', 'border-gray-200');
       });
    }

    // Réduire taille graphique pour PDF
    const chartContainer = clone.querySelector('.h-64');
    if (chartContainer) {
      (chartContainer as HTMLElement).style.height = '200px';
    }

    container.appendChild(clone);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Message de chargement
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #1a365d;
      color: white;
      padding: 16px 28px;
      border-radius: 12px;
      z-index: 10001;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    feedback.innerText = "📄 Génération du PDF en cours...";
    document.body.appendChild(feedback);

    // Attendre le rendu complet
    await new Promise(resolve => setTimeout(resolve, 2500));

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Acces_IA_Audit_ROI_${inputs.industry}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: A4_WIDTH_PX + 60,
        windowWidth: A4_WIDTH_PX + 60,
        backgroundColor: '#ffffff',
        removeContainer: false,
        imageTimeout: 0,
        onclone: (clonedDoc: Document) => {
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            const bbox = svg.getBoundingClientRect();
            svg.setAttribute('width', bbox.width.toString());
            svg.setAttribute('height', bbox.height.toString());
          });
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.print:break-inside-avoid', '.no-break']
      }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      document.body.removeChild(overlay);
      document.body.removeChild(feedback);
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    const text = `Rapport ROI Acces IA - ${inputs.industry}\nGain estimé: ${formatCurrency(results.annualSavings)}\n\nAnalyse:\n${aiInsight || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="results-container" className="space-y-6 animate-fade-in bg-white md:bg-transparent relative">
      
      {/* Toolbar */}
      <div id="action-toolbar" className="flex justify-end gap-3 print:hidden mb-2">
        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
        <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-dark rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70">
          {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isGeneratingPdf ? 'Génération...' : 'Exporter PDF'}
        </button>
      </div>

      {/* Header Print */}
      <div id="report-header" className="hidden mb-8 border-b-2 border-brand-dark pb-4 print:block">
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <Sparkles className="h-6 w-6 text-brand-dark fill-brand-dark" />
                 <h1 className="text-2xl font-bold text-brand-dark uppercase">Acces IA</h1>
             </div>
            <div className="text-right">
                <span className="block text-sm text-gray-500 font-medium">AUDIT DE PERFORMANCE & IA</span>
                <span className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            Entreprise du secteur <b>{inputs.industry}</b> ({inputs.employees} employés) | Salaire moyen: {inputs.hourlyWage}€/h
        </div>
      </div>

      {/* Alert Cost */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
             <AlertTriangle className="text-orange-600 h-6 w-6" />
        </div>
        <div>
            <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide mb-1">Opportunité Immédiate</h4>
            <p className="text-orange-800 text-sm leading-relaxed">
                L'optimisation de vos processus permettrait de réallouer <span className="font-bold underline decoration-orange-300 decoration-2">{formatCurrency(monthlyLoss)} chaque mois</span> vers des activités à plus forte valeur ajoutée.
            </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productivité</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{formatNumber(results.totalHoursSaved)} h</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-brand-dark" />
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-brand-dark h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Heures économisées / an</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 ring-2 ring-brand-accent/10 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/10 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider">Gain Annuel</p>
                    <p className="text-2xl font-extrabold text-brand-accent mt-1">{formatCurrency(results.annualSavings)}</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                    <Wallet className="h-5 w-5 text-brand-accent" />
                </div>
            </div>
             <p className="text-xs text-green-700/80 mt-auto bg-green-50 inline-block px-2 py-1 rounded font-medium self-start">
                + Impact marge direct
            </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-full">
             <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ROI estimé 3 Ans</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{formatCurrency(results.threeYearRoi)}</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Projection moyen terme</p>
        </div>
      </div>

      {/* AI STRATEGIC ANALYSIS SECTION */}
      <div id="ai-section" className="bg-brand-dark rounded-2xl p-6 md:p-8 shadow-card text-white relative overflow-hidden transition-all duration-300 border border-brand-dark/50">
         {/* Background Effect */}
         <div className="absolute -right-20 -top-20 bg-brand-accent/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="flex items-center gap-3 text-brand-accent font-bold uppercase text-sm tracking-widest">
                    <Sparkles size={16} className="text-brand-accent" /> Analyse Stratégique & Recommandations
                </h3>
                <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                    IA Model: Gemini 2.0 Flash
                </span>
            </div>

            {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 size={48} className="animate-spin text-brand-accent" />
                    <p className="text-gray-300 animate-pulse text-center max-w-md text-sm font-medium">
                        Notre IA analyse les données du secteur {inputs.industry} pour générer votre feuille de route...
                    </p>
                </div>
            ) : aiInsight ? (
                <div className="animate-fade-in">
                    {renderFormattedText(aiInsight)}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                    Impossible de générer l'analyse stratégique pour le moment.
                </div>
            )}
         </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 print:break-inside-avoid no-break">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Target size={18} className="text-brand-dark" />
            Comparatif Financier
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

      {/* CTA Section */}
      <div id="cta-section" className="mt-8 text-center bg-brand-accent/5 rounded-xl p-8 border border-brand-accent/10 print:hidden">
        <h4 className="font-bold text-brand-dark text-lg mb-2">Transformez ce potentiel en réalité</h4>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">Ces chiffres sont théoriques. Pour une analyse fine de vos process et une feuille de route d'implémentation, parlons-en.</p>
        <a href="https://calendly.com/miguel-ygonin69/30min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-accent hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <Calendar size={18} />
            Réserver un appel découverte
        </a>
      </div>
    </div>
  );
};

export default ResultsDisplay;
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

  const monthlyLoss = Math.round(results.currentCost / 12);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val);

  const renderStructuredAnalysis = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.trim() === '') return <div key={i} className="h-2" />;
      
      const parts = line.split('**');
      return (
        <div key={i} className={`mb-1 ${line.trim().startsWith('-') ? 'pl-4 relative' : ''}`}>
           {line.trim().startsWith('-') && <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-brand-accent rounded-full opacity-70"></span>}
           {parts.map((part, j) => 
             j % 2 === 1 ? <strong key={j} className="text-brand-accent font-bold">{part}</strong> : <span key={j}>{part.replace(/^- /, '')}</span>
           )}
        </div>
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
    
    // Forcer grille 3 colonnes
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

    // Conversion zone sombre → blanc (économie encre)
    const darkBg = clone.querySelector('.bg-brand-dark');
    if (darkBg) {
      (darkBg as HTMLElement).classList.remove('text-white', 'bg-brand-dark');
      (darkBg as HTMLElement).classList.add('text-slate-900', 'bg-gray-50', 'border', 'border-gray-300');
      darkBg.querySelectorAll('.text-gray-100').forEach(t => {
        (t as HTMLElement).classList.remove('text-gray-100');
        (t as HTMLElement).classList.add('text-slate-700');
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
      margin: [15, 15, 15, 15],
      filename: `Nexalis_Audit_ROI_${inputs.industry}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
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
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      document.body.removeChild(overlay);
      document.body.removeChild(feedback);
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

      <div id="report-header" className="hidden mb-8 border-b-2 border-brand-dark pb-4 print:block">
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <Sparkles className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                 <h1 className="text-2xl font-bold text-brand-dark uppercase">Nexalis Solutions</h1>
             </div>
            <span className="text-sm text-gray-500 font-medium">Rapport d'opportunité IA</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
            Audit généré le {new Date().toLocaleDateString('fr-FR')} pour une entreprise du secteur <b>{inputs.industry}</b> ({inputs.employees} employés).
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="bg-brand-dark rounded-2xl p-6 shadow-card text-white relative overflow-hidden print:bg-gray-50 print:text-black print:border print:border-gray-300">
         <div className="absolute -right-10 -top-10 bg-white/5 w-40 h-40 rounded-full blur-3xl print:hidden"></div>
         <div className="relative z-10">
            <h3 className="flex items-center gap-2 text-brand-accent font-bold mb-4 uppercase text-xs tracking-widest print:text-brand-dark">
                <Sparkles size={14} className="text-brand-accent print:text-brand-dark" /> Recommandation Stratégique
            </h3>
            <div className="text-sm md:text-base leading-relaxed text-gray-100 print:text-gray-800 border-l-4 border-brand-accent pl-4">
                {isAiLoading ? (
                    <span className="animate-pulse italic">Analyse de vos données en cours par nos modèles...</span>
                ) : (
                    renderStructuredAnalysis(aiInsight || "") || "Génération de l'analyse..."
                )}
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 print:break-inside-avoid no-break">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Target size={18} className="text-brand-dark" />
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

      <div id="cta-section" className="mt-8 text-center bg-brand-accent/5 rounded-xl p-8 border border-brand-accent/10 print:hidden">
        <h4 className="font-bold text-brand-dark text-lg mb-2">Transformez ce potentiel en réalité</h4>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">Ces chiffres sont théoriques. Pour une analyse fine de vos process et une feuille de route d'implémentation, parlons-en.</p>
        <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-accent hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <Calendar size={18} />
            Réserver un appel découverte
        </a>
      </div>
    </div>
  );
};

export default ResultsDisplay;
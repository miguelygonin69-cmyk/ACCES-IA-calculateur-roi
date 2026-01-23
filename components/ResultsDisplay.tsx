const handleDownloadPDF = async () => {
  setIsGeneratingPdf(true);
  
  const originalElement = document.getElementById('results-container');
  if (!originalElement) { 
    setIsGeneratingPdf(false); 
    return; 
  }

  const A4_WIDTH_PX = 794; // Standard A4 à 96 DPI
  
  // 1. Création d'un conteneur caché mais "calculable" par le navigateur
  const printContainer = document.createElement('div');
  printContainer.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${A4_WIDTH_PX}px;
    background: white;
    padding: 40px;
  `;

  // 2. Clone et nettoyage
  const clone = originalElement.cloneNode(true) as HTMLElement;
  
  // Supprimer les éléments interactifs
  clone.querySelector('#action-toolbar')?.remove();
  clone.querySelector('#cta-section')?.remove();
  
  // Forcer l'affichage du header caché
  const header = clone.querySelector('#report-header');
  if (header) {
    (header as HTMLElement).style.display = 'block';
    (header as HTMLElement).classList.remove('hidden');
  }

  // 3. CORRECTIF CRITIQUE : Forcer la taille du graphique
  // Recharts ne peut pas être "responsive" dans un PDF
  const chartWrapper = clone.querySelector('.h-64');
  if (chartWrapper) {
    (chartWrapper as HTMLElement).style.height = '350px';
    (chartWrapper as HTMLElement).style.width = '100%';
    // On enlève les classes qui pourraient gêner le rendu statique
    (chartWrapper as HTMLElement).classList.remove('h-64'); 
  }

  // 4. Gestion de la grille pour le PDF
  const grids = clone.querySelectorAll('.md\\:grid-cols-3');
  grids.forEach(el => {
    (el as HTMLElement).style.display = 'grid';
    (el as HTMLElement).style.gridTemplateColumns = 'repeat(3, 1fr)';
    (el as HTMLElement).style.gap = '15px';
  });

  printContainer.appendChild(clone);
  document.body.appendChild(printContainer);

  // Petit délai pour laisser le temps au navigateur de calculer le layout du clone
  await new Promise(resolve => setTimeout(resolve, 800));

  const opt = {
    margin: [10, 10],
    filename: `Nexalis_Audit_${inputs.industry}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, // Meilleure qualité
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: A4_WIDTH_PX
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // @ts-ignore
    await window.html2pdf().set(opt).from(printContainer).save();
  } catch (error) {
    console.error("Erreur PDF:", error);
  } finally {
    document.body.removeChild(printContainer);
    setIsGeneratingPdf(false);
  }
};
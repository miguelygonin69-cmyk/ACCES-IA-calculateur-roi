import { CalculatorInputs, CalculationResult } from "../types";

export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<string> => {
  try {
    const prompt = `Agis comme un Directeur Stratégie Senior chez McKinsey ou BCG.

CONTEXTE CLIENT :
- Secteur : ${inputs.industry}
- Effectif : ${inputs.employees} personnes
- Gain potentiel identifié : ${results.annualSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / an
- Heures "perdues" récupérables : ${results.totalHoursSaved} h / an

OBJECTIF :
Génère une analyse stratégique structurée en 3 sections distinctes :

**1. Recommandations Personnalisées**
- 3 actions concrètes prioritaires adaptées à ce secteur et cette taille d'entreprise
- Sois très spécifique et actionnable

**2. Analyse Sectorielle**
- Tendances IA spécifiques à ce secteur
- Benchmarks de ROI dans l'industrie
- Opportunités sectorielles uniques

**3. Points d'Amélioration**
- Quick wins (résultats sous 3 mois)
- Optimisations moyen terme (3-6 mois)
- Transformations long terme (6-12 mois)

Ton style : Expert mais accessible, data-driven, focus sur l'impact business concret.
Format : Markdown avec **gras** pour les titres, tirets pour les listes. Pas de titre global, commence directement par la section 1.
Longueur : 300-400 mots maximum.`;

    // Appel via Vercel AI Gateway
    const response = await fetch('https://api.vercel.com/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_TOKEN || ''}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('Failed to generate insight');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Analyse en cours...";
    
  } catch (error) {
    console.error("Erreur lors de l'appel à l'AI Gateway:", error);
    return "L'analyse IA n'est temporairement pas disponible. Veuillez réessayer dans quelques instants.";
  }
};
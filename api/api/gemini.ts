import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sécurité CORS (permet l'appel depuis votre domaine)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gestion OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accepte uniquement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { inputs, results } = req.body;

    // Validation des données
    if (!inputs || !results) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        Agis comme un Directeur Stratégie Senior chez McKinsey ou BCG.
        
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
        Longueur : 300-400 mots maximum.
      `,
      config: {
        temperature: 0.7,
      }
    });

    return res.status(200).json({ text: response.text || '' });
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate insight',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
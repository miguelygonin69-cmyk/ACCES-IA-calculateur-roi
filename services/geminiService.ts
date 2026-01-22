import { GoogleGenAI } from "@google/genai";
import { CalculatorInputs, CalculationResult } from "../types";

// Note: Dans un vrai projet Vite, on utiliserait import.meta.env.VITE_API_KEY
// Mais selon les directives strictes, nous utilisons process.env.API_KEY
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<string> => {
  // Vérification basique de la clé
  if (!apiKey) {
    console.warn("Clé API manquante. Assurez-vous d'avoir défini process.env.API_KEY");
    return "Configuration requise : La clé API n'est pas détectée. Veuillez configurer votre environnement.";
  }

  try {
    const prompt = `
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
    `;

    // Appel direct à l'API Gemini depuis le navigateur
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Utilisation du modèle rapide et performant
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Analyse terminée, mais aucune réponse textuelle générée.";
    
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return "L'analyse IA n'est pas disponible pour le moment. Vérifiez votre connexion ou votre clé API.";
  }
};
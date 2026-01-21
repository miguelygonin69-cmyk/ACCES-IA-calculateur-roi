import { GoogleGenAI } from "@google/genai";
import { CalculatorInputs, CalculationResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a strategic insight based on the calculated ROI and industry.
 */
export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<string> => {
  if (!apiKey) {
    return "Configuration de l'API manquante. Veuillez configurer votre clé API pour obtenir des analyses détaillées.";
  }

  try {
    const prompt = `
      Tu es un consultant senior en stratégie digitale et intelligence artificielle.
      
      Analyse les données suivantes pour une entreprise du secteur "${inputs.industry}" :
      - Nombre d'employés : ${inputs.employees}
      - Heures répétitives/semaine/employé : ${inputs.hoursRepetitive}
      - Économies annuelles potentielles : ${results.annualSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      
      Rédige un paragraphe court (max 80 mots), percutant et professionnel en français.
      Explique concrètement comment ces économies ou ce gain de temps peuvent être réinvestis pour créer un avantage compétitif spécifique à l'industrie "${inputs.industry}".
      Sois direct, évite le jargon générique.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster simple response
        temperature: 0.7,
      }
    });

    return response.text || "Impossible de générer l'analyse pour le moment.";
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return "Une erreur est survenue lors de la génération de l'analyse stratégique.";
  }
};
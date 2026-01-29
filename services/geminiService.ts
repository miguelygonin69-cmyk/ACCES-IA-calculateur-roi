import { GoogleGenAI, Type } from "@google/genai";
import { CalculatorInputs, CalculationResult, StrategicInsight } from "../types";

export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<StrategicInsight | null> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API Key is missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Agis comme un Directeur Stratégie Senior chez McKinsey.
      
      CONTEXTE CLIENT :
      - Secteur : ${inputs.industry}
      - Effectif : ${inputs.employees} personnes
      - Gain potentiel identifié : ${results.annualSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / an
      - Heures récupérables : ${results.totalHoursSaved} h / an
      
      TACHE :
      Génère une analyse stratégique ultra-personnalisée au format JSON pour aider ce dirigeant à franchir le pas de l'IA.
      Sois précis, concret et orienté ROI.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Une synthèse exécutive percutante de 2 phrases sur l'opportunité pour cette entreprise."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "3 actions prioritaires concrètes.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Titre de l'action (ex: Automatisation Service Client)" },
                  detail: { type: Type.STRING, description: "Description courte de la mise en place" },
                  impact: { type: Type.STRING, description: "Impact business attendu (chiffré si possible)" }
                }
              }
            },
            sectorTrends: {
              type: Type.ARRAY,
              description: "3 tendances IA spécifiques à ce secteur d'activité.",
              items: { type: Type.STRING }
            },
            roadmap: {
              type: Type.OBJECT,
              description: "Plan de mise en oeuvre",
              properties: {
                quickWins: { type: Type.STRING, description: "Action immédiate (Mois 1-3)" },
                midTerm: { type: Type.STRING, description: "Optimisation (Mois 3-6)" },
                longTerm: { type: Type.STRING, description: "Transformation (Mois 6-12)" }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as StrategicInsight;
    
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return null;
  }
};
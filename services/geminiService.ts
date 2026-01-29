import { GoogleGenAI } from "@google/genai";
import { CalculatorInputs, CalculationResult } from "../types";

export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<string | null> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API Key is missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Agis comme un Directeur de l'Innovation expert en transformation digitale.
      Ton objectif est de fournir une feuille de route claire et percutante au dirigeant d'une entreprise du secteur : ${inputs.industry}.

      DONNÉES CLÉS :
      - Effectif : ${inputs.employees} collaborateurs
      - Économies annuelles potentielles : ${results.annualSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      - Gain de temps : ${results.totalHoursSaved} heures/an (soit environ ${Math.round(results.totalHoursSaved / 1600)} ETP)

      INSTRUCTIONS DE RÉDACTION :
      Ne fais pas d'introduction générique ("Voici l'analyse..."). Attaque directement le sujet.
      Utilise le formatage Markdown pour structurer ta réponse (Titres ##, Gras **, Listes -).
      Adopte un ton professionnel, visionnaire mais pragmatique.

      STRUCTURE ATTENDUE :

      ## 🎯 Diagnostic de Performance
      Une phrase choc qui met en perspective le gain financier (${results.annualSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}) par rapport à la taille de l'entreprise (${inputs.employees} employés) et aux standards du secteur ${inputs.industry}.

      ## 🚀 3 Leviers d'Action Immédiats
      Propose 3 cas d'usage très précis pour le secteur "${inputs.industry}" (pas de généralités). Pour chaque point :
      - **Nom de l'action** : Explique concrètement ce qui est automatisé et le bénéfice opérationnel.

      ## 🔮 Vision Stratégique (N+3)
      Une conclusion puissante sur l'avantage concurrentiel que l'entreprise aura acquis dans 3 ans si elle investit maintenant (qualité de service, innovation, marge).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || null;
    
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return null;
  }
};
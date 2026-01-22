import { CalculatorInputs, CalculationResult } from "../types";

export const generateStrategicInsight = async (
  inputs: CalculatorInputs,
  results: CalculationResult
): Promise<string> => {
  try {
    // Appel vers l'API serverless sécurisée
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, results }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    const data = await response.json();
    return data.text || "Analyse en cours...";
    
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini:", error);
    return "L'analyse IA n'est temporairement pas disponible. Veuillez réessayer dans quelques instants.";
  }
};
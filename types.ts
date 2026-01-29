export enum Industry {
  ECOMMERCE = 'E-commerce',
  SERVICES = 'Services',
  INDUSTRIE = 'Industrie',
  SANTE = 'Santé',
  FINANCE = 'Finance',
  RESTAURATION = 'Restauration',
  ENTREPRISE = 'Entreprise',
  AUTRE = 'Autre'
}

export interface CalculatorInputs {
  employees: number;
  hourlyWage: number;
  hoursRepetitive: number;
  industry: Industry;
}

export interface CalculationResult {
  totalHoursSaved: number;
  annualSavings: number;
  threeYearRoi: number;
  currentCost: number;
  costWithAi: number;
}

export interface ChartDataPoint {
  name: string;
  montant: number;
  fill: string;
}

export interface StrategicInsight {
  summary: string;
  recommendations: {
    title: string;
    detail: string;
    impact: string;
  }[];
  sectorTrends: string[];
  roadmap: {
    quickWins: string;
    midTerm: string;
    longTerm: string;
  };
}
export enum Industry {
  ECOMMERCE = 'E-commerce',
  SERVICES = 'Services',
  INDUSTRIE = 'Industrie',
  SANTE = 'Santé',
  FINANCE = 'Finance',
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
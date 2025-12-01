export interface SkinAnalysisResult {
  condition_name: string;
  confidence_score: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  description: string;
  symptoms_observed: string[];
  recommendations: string[];
  treatment_options: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // Base64 string
  analysis?: SkinAnalysisResult;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
}

export interface Dermatologist {
  name: string;
  clinic_name: string;
  address: string;
  phone: string;
  rating: string;
  distance: string;
}
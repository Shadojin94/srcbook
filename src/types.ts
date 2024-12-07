export type QuestionType = 
  'text' | 'number' | 'yesno' | 'date' | 
  'radio' | 'checkbox' | 'range' | 'textarea';

export type InputType = 'text' | 'number' | 'date' | 'yesno' | 'textarea';

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: string[];
}

export interface DynamicQuestion {
  question: string;
  input_type: InputType;
  validation?: ValidationRules;
}

export interface Question {
  id?: string;
  text: string;
  type: QuestionType;
  validation?: ValidationRules;
  dependsOn?: {
    questionId: string;
    expectedValue: any;
  };
  allowImage?: boolean;
}

export interface Answer {
  questionId?: string;
  question: string;
  response: string | boolean | number | string[];
  imageAnalysis?: string;
}

export interface QuestionnaireState {
  currentQuestion: Question | null;
  answers: Answer[];
  isComplete: boolean;
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface QuestionGenerationPrompt {
  context: string;
  previousAnswers: Answer[];
  currentQuestion?: Question;
}

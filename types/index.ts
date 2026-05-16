export type InputType = "text" | "image" | "image_text";

export type TaskType =
  | "simple_atomic_task"
  | "complex_composite_task"
  | "ambiguous_task"
  | "emergency_task"
  | "multimodal_task";

export type Urgency = "low" | "medium" | "high";

export type Difficulty = "low" | "medium" | "high";

export interface UserInputCase {
  id: string;
  title: string;
  inputType: InputType;
  userText: string;
  imagePath?: string;
  subject?: string;
  detectedIntentIds: string[];
  taskType: TaskType;
  urgency: Urgency;
  needsClarification: boolean;
  recommendedTemplateId?: string;
  expectedOutput: string;
}

export interface IntentLabel {
  id: string;
  name: string;
  description: string;
}

export interface AtomicTask {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  inputNeeded: string;
  completionCriteria: string;
  failureRisk: string;
}

export interface CompositeTaskTemplate {
  id: string;
  name: string;
  triggerConditions: string[];
  atomicTaskIds: string[];
  estimatedTotalMinutes: number;
  difficulty: Difficulty;
  outputGoal: string;
}

export interface FeedbackLoop {
  id: string;
  afterTaskId: string;
  question: string;
  positiveNextAction: string;
  negativeNextAction: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  userInputCaseId: string;
  flow: string[];
  demoHighlight: string;
}

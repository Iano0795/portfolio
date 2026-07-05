export type ProcessStepEditorValue = {
  id: string | null;
  title: string;
  description: string;
  command: string;
  label: string;
  orderIndex: number;
  isActive: boolean;
};

export type ProcessStepPayload = {
  title: string;
  description: string;
  command: string;
  label: string;
  orderIndex: number;
  isActive: boolean;
};

export type ProcessStepMutationResult = {
  error?: string;
  success?: string;
};

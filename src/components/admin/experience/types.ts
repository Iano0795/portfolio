export type EditableListItem = {
  id: string;
  value: string;
};

export type ExperienceEditorValue = {
  id: string | null;
  stageLabel: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  achievements: EditableListItem[];
  orderIndex: number;
  isActive: boolean;
};

export type ExperiencePayload = {
  stageLabel: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  achievements: string[];
  orderIndex: number;
  isActive: boolean;
};

export type ExperienceMutationResult = {
  error?: string;
  success?: string;
};

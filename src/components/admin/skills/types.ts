export type SkillEditorValue = {
  id: string | null;
  name: string;
  category: string;
  level: string;
  orderIndex: number;
  isActive: boolean;
};

export type SkillPayload = {
  name: string;
  category: string;
  level: string;
  orderIndex: number;
  isActive: boolean;
};

export type SkillMutationResult = {
  error?: string;
  success?: string;
};

export type CapabilityEditorValue = {
  id: string | null;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
  isActive: boolean;
};

export type CapabilityPayload = {
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
  isActive: boolean;
};

export type CapabilityMutationResult = {
  error?: string;
  success?: string;
};

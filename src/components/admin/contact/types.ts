export type ContactLinkEditorValue = {
  id: string | null;
  label: string;
  type: string;
  url: string;
  icon: string;
  orderIndex: number;
  isActive: boolean;
};

export type ContactLinkPayload = {
  label: string;
  type: string;
  url: string;
  icon: string;
  orderIndex: number;
  isActive: boolean;
};

export type ContactMutationResult = {
  error?: string;
  success?: string;
};

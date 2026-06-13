export type EditableCredentialSkill = {
  id: string;
  value: string;
};

export type CredentialEditorValue = {
  id: string | null;
  title: string;
  issuer: string;
  credentialType: string;
  category: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
  skills: EditableCredentialSkill[];
  orderIndex: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type CredentialPayload = {
  title: string;
  issuer: string;
  credentialType: string;
  category: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
  skills: string[];
  orderIndex: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type CredentialMutationResult = {
  error?: string;
  success?: string;
};

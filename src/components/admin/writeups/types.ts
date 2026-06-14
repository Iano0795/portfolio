export type EditableListItem = {
  id: string;
  value: string;
};

export type WriteupVisibility = 'public' | 'restricted' | 'private';
export type WriteupMachineStatus = 'active' | 'retired' | 'other';

export type WriteupEditorValue = {
  id: string | null;
  projectId: string | null;
  title: string;
  slug: string;
  platform: string;
  difficulty: string;
  category: string;
  machineStatus: WriteupMachineStatus;
  visibility: WriteupVisibility;
  publicSummary: string;
  publicTeaser: string;
  tools: EditableListItem[];
  skills: EditableListItem[];
  tags: EditableListItem[];
  storageBucket: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  isFeatured: boolean;
  isActive: boolean;
  orderIndex: number;
};

export type WriteupPayload = {
  projectId: string | null;
  title: string;
  slug: string;
  platform: string;
  difficulty: string;
  category: string;
  machineStatus: WriteupMachineStatus;
  visibility: WriteupVisibility;
  publicSummary: string;
  publicTeaser: string;
  tools: string[];
  skills: string[];
  tags: string[];
  storageBucket: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  isFeatured: boolean;
  isActive: boolean;
  orderIndex: number;
};

export type WriteupMutationResult = {
  error?: string;
  success?: string;
};

export type ProjectOption = {
  id: string;
  title: string;
  slug: string;
};

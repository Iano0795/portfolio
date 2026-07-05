export type EditableListItem = {
  id: string;
  value: string;
};

export type WriteupVisibility = 'public' | 'restricted' | 'private';
export type WriteupMachineStatus = 'active' | 'retired' | 'other';
export type WriteupLabType = 'offensive' | 'defensive';

export type WriteupEditorValue = {
  id: string | null;
  projectId: string | null;
  title: string;
  slug: string;
  platform: string;
  difficulty: string;
  category: string;
  labType: WriteupLabType | '';
  machineStatus: WriteupMachineStatus;
  visibility: WriteupVisibility;
  isRequestable: boolean;
  publicSummary: string;
  publicTeaser: string;
  contentMarkdown: string;
  coverImageUrl: string;
  readingTimeMinutes: number | null;
  publishedAt: string;
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
  labType: WriteupLabType | '';
  machineStatus: WriteupMachineStatus;
  visibility: WriteupVisibility;
  isRequestable: boolean;
  publicSummary: string;
  publicTeaser: string;
  contentMarkdown: string;
  coverImageUrl: string;
  readingTimeMinutes: number | null;
  publishedAt: string;
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

export type WriteupFileMetadata = {
  storageBucket: string;
  storagePath: string;
  fileName: string;
  fileType: string;
};

export type WriteupFileUploadResult = WriteupMutationResult & {
  file?: WriteupFileMetadata;
  extractedMarkdown?: string | null;
  extractionWarning?: string | null;
};

export type ProjectOption = {
  id: string;
  title: string;
  slug: string;
};

export type WriteupMediaEditorValue = {
  id: string;
  writeupId: string;
  storageBucket: string;
  storagePath: string;
  altText: string;
  caption: string;
  orderIndex: number;
  isActive: boolean;
};

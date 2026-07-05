export type EditableListItem = {
  id: string;
  value: string;
};

export type ProjectEditorValue = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  role: string;
  shortDescription: string;
  problem: string;
  solution: string;
  outcome: string;
  stack: EditableListItem[];
  githubUrl: string;
  liveUrl: string;
  caseStudyUrl: string;
  imageUrl: string;
  orderIndex: number;
  isFeatured: boolean;
  isPrivate: boolean;
  isActive: boolean;
};

export type ProjectPayload = {
  title: string;
  slug: string;
  category: string;
  role: string;
  shortDescription: string;
  problem: string;
  solution: string;
  outcome: string;
  stack: string[];
  githubUrl: string;
  liveUrl: string;
  caseStudyUrl: string;
  imageUrl: string;
  orderIndex: number;
  isFeatured: boolean;
  isPrivate: boolean;
  isActive: boolean;
};

export type ProjectMutationResult = {
  error?: string;
  success?: string;
};

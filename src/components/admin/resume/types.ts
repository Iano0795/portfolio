export type ResumeAssetEditorValue = {
  id: string | null;
  fileName: string;
  fileUrl: string;
  versionLabel: string;
  isActive: boolean;
  uploadedAt: string;
};

export type ResumeMutationResult = {
  error?: string;
  success?: string;
};

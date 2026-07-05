export type EditableListItem = {
  id: string;
  value: string;
};

export type ProfileEditorValue = {
  name: string;
  headline: string;
  subheadline: string;
  introLine: string;
  location: string;
  availabilityStatus: string;
  currentFocus: string;
  terminalLines: EditableListItem[];
  coreStack: EditableListItem[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaContactLabel: string;
  isActive: boolean;
};

export type ProfileEditorSaveState = {
  error?: string;
  success?: string;
};

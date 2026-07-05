export type NavigationItemEditorValue = {
  id: string | null;
  sectionId: string;
  label: string;
  systemLabel: string;
  command: string;
  icon: string;
  orderIndex: number;
  isVisible: boolean;
  isActive: boolean;
};

export type NavigationItemPayload = {
  sectionId: string;
  label: string;
  systemLabel: string;
  command: string;
  icon: string;
  orderIndex: number;
  isVisible: boolean;
  isActive: boolean;
};

export type NavigationItemMutationResult = {
  error?: string;
  success?: string;
};

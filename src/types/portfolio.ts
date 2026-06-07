export type Section =
  | 'profile'
  | 'about'
  | 'capabilities'
  | 'skills'
  | 'projects'
  | 'process'
  | 'experience'
  | 'contact';

export type SectionConfig = {
  id: Section;
  label: string;
  module: string;
  command: string;
};

export type QuickCommand = {
  command: string;
  output: string;
  target?: Section;
};

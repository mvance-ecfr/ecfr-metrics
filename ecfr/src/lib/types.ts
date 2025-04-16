export interface ECfrTitle {
  number: number;
  name: string;
  latest_amended_on: string; // ISO date string (e.g., "2025-03-21")
  latest_issue_date: string; // ISO date string (e.g., "2025-03-21")
  up_to_date_as_of: string; // ISO date string (e.g., "2025-04-14")
  reserved: boolean;
}

export interface EcfrStructure {
  type:
    | 'title'
    | 'subtitle'
    | 'chapter'
    | 'subchapter'
    | 'part'
    | 'subpart'
    | 'section'
    | 'subsection'
    | 'appendix';
  label: string;
  label_level: string;
  label_description: string;
  identifier: string;
  reserved?: boolean;
  size: number;
  children?: EcfrStructure[]; // For nested structures (chapters, parts, sections)
}

export interface EcfrAgency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: EcfrAgency[];
  cfr_references: EfcrAgencyReference[];
}

export interface EfcrAgencyReference {
  title: number;
  chapter: string;
  subtitle: string | undefined;
}

export interface EcfrVersion {
  date: string;
  amendment_date: string;
  issue_date: string;
  identifier: string;
  name: string;
  part: string;
  substantive: boolean;
  removed: boolean;
  subpart: string | null;
  title: string;
  type: 'section';
}

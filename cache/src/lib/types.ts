// each date/title/chapter/part tuple represents a single piece of XML content that can have a word count
export interface WorkItem {
  agency: string;
  effective_date: string; // the day we're calculating for
  date: string; // the most recent date closest to effective date for the given title and chapter
  title: number;
  chapter: string | undefined; // either chapter or subtitle will be set
  subtitle: string | undefined;
}

export interface WorkResult {
  agency: string;
  title: number;
  chapter: string | undefined; // either chapter or subtitle will be set
  subtitle: string | undefined;
  effective_date: string;
  word_count: number;
  sections: number;
}

export interface Metric {
  effective_date: string;
  agency: string;
  total_word_count: number;
  total_section_count: number;
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

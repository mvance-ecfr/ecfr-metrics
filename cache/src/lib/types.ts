// each date/title/chapter/part tuple represents a single piece of XML content that can have a word count
export interface WorkItem {
  agency: string;
  effective_date: string; // the day we're calculating for
  chapters: WorkItemChapter[];
}

export interface WorkItemChapter {
  date: string; // the most recent date closest to effective date for the given title and chapter
  title: number;
  chapter: string | undefined; // either chapter or subtitle will be set
  subtitle: string | undefined;
}
export interface WorkResult {
  agency: string;
  effective_date: string;
  total_word_count: number;
}

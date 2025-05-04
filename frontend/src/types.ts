export interface WordCountEntry {
  agency: string;
  total_word_count: string; // it's a string in the API, we'll convert it
  total_section_count: string;
  effective_date: string;
}

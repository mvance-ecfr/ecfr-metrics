CREATE TABLE metrics (
   "agency" text NOT NULL,
   "effective_date" date NOT NULL,
   "title" numeric NOT NULL,
   "chapter_or_subtitle" text NOT NULL,
   "word_count" numeric,
   "sections" numeric,
   PRIMARY KEY ("agency", "effective_date", "title", "chapter_or_subtitle")
);

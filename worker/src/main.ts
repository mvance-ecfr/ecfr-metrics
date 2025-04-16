import { dequeueWork, enqueueWork, WorkItem, WorkItemChapter } from 'cache';
import {
  EcfrStructure,
  getStructure,
  getChapterXmlContent,
  getSubtitleXmlContent,
} from 'ecfr';
import { saveResult } from 'db';
import { AxiosError } from 'axios';
async function runWorker() {
  while (true) {
    const item = await dequeueWork();
    if (!item) {
      console.log('No more work. Sleeping...');
      await new Promise((res) => setTimeout(res, 3000));
      continue;
    }

    try {
      const wordCounts: number[] = [];
      for (const chapter of item.chapters.filter((s) => s.chapter)) {
        try {
          wordCounts.push(await chapterWordCount(item, chapter));
        } catch (err) {
          console.error(
            'Error getting chapter',
            item,
            chapter,
            'Skipping...',
            err
          );
        }
      }
      for (const chapter of item.chapters.filter((s) => s.subtitle)) {
        try {
          wordCounts.push(await subtitleWordCount(item, chapter));
        } catch (err) {
          console.error(
            'Error getting subtitle',
            item,
            chapter,
            'Skipping...',
            err
          );
        }
      }

      const totalWordCount = wordCounts.reduce((prev, next) => prev + next, 0);
      console.log(
        `Saved EffectiveDate (${item.effective_date}), Agency (${item.agency} - ${totalWordCount}`
      );
      await saveResult({
        agency: item.agency,
        effective_date: item.effective_date,
        total_word_count: totalWordCount,
      });
    } catch (err) {
      if (err instanceof AxiosError && err.status == 429) {
        console.error(
          'Failed to process work item: ',
          item,
          'because of 429 error, retrying later'
        );
        await enqueueWork(item); // try to requeue for processing again
      } else {
        console.error('Failed to process work item:', item, err);
      }
    }
  }
}

async function chapterWordCount(item: WorkItem, chapter: WorkItemChapter) {
  console.log(
    `Retrieving Agency ${item.agency} Date (${chapter.date}) Title (${chapter.title}) Chapter (${chapter.chapter})`
  );
  const retrieveStart = Date.now();
  const content = await getChapterXmlContent(
    chapter.date,
    chapter.title,
    chapter.chapter
  );
  const wordCount = countWords(content);
  const retrieveEnd = Date.now();
  console.log(
    `Retrieved Agency ${item.agency} Date (${chapter.date}) Title (${
      chapter.title
    }) Chapter (${chapter.chapter}) - ${wordCount} [${
      retrieveEnd - retrieveStart
    }ms]`
  );
  return wordCount;
}

async function subtitleWordCount(item: WorkItem, chapter: WorkItemChapter) {
  console.log(
    `Retrieving Agency ${item.agency} Date (${chapter.date}) Title (${chapter.title}) Subtitle (${chapter.subtitle})`
  );
  const structure = await getStructure(chapter.date, chapter.title);
  const subtitle = structure.children.find(
    (s) => s.identifier == chapter.subtitle
  );
  if (!subtitle) {
    console.error(
      `-----$$$$$$$______ Unable to find subtitle in structure Subtitle (${chapter.subtitle}), Date (${chapter.date}), Title (${chapter.title})`
    );
    return 0;
  }
  const parts: string[] = [];
  collectParts(parts, subtitle.children);

  const totalRetrieveStart = Date.now();
  let totalWordCount = 0;
  for (const part of parts) {
    const retrieveStart = Date.now();
    const content = await getSubtitleXmlContent(
      chapter.date,
      chapter.title,
      chapter.subtitle,
      part
    );
    const wordCount = countWords(content);
    const retrieveEnd = Date.now();
    totalWordCount += wordCount;
    console.log(
      `Retrieved Agency ${item.agency} Date (${chapter.date}) Title (${
        chapter.title
      }) Subtitle (${chapter.subtitle}) Part ${part} - ${wordCount} [${
        retrieveEnd - retrieveStart
      }ms]`
    );
  }
  const totalRetrieveEnd = Date.now();
  console.log(
    `Retrieved Subtitled Agency ${item.agency} Date (${chapter.date}) Title (${
      chapter.title
    }) Subtitle (${chapter.subtitle}) - ${totalWordCount} [${
      totalRetrieveEnd - totalRetrieveStart
    }ms]`
  );

  return totalWordCount;
}

function collectParts(parts: string[], children: EcfrStructure[]): void {
  if (!Array.isArray(children)) return; // sometimes its null
  for (const child of children) {
    if (child.reserved) continue;
    if (child.type == 'part') {
      parts.push(child.identifier);
    } else {
      collectParts(parts, child.children);
    }
  }
}
function countWords(xml: string): number {
  const text = xml.replace(/<[^>]+>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

runWorker()
  .catch((err) => {
    console.error('Worker failed:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));

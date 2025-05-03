import { dequeueWork, enqueueWork } from 'cache';
import { saveResult } from 'db';
import { AxiosError } from 'axios';
import { chapterWordCount, subtitleWordCount } from './word_count';
async function runWorker() {
  while (true) {
    const item = await dequeueWork();
    if (!item) {
      console.log('No more work. Thank you...');
      return;
    }

    try {
      if (item.chapter) {
        const [wordCount, sections] = await chapterWordCount(item);
        await saveResult({
          agency: item.agency,
          effective_date: item.effective_date,
          title: item.title,
          chapter: item.chapter,
          subtitle: item.subtitle,
          word_count: wordCount,
          sections,
        });
      } else {
        const [wordCount, sections] = await subtitleWordCount(item);
        await saveResult({
          agency: item.agency,
          effective_date: item.effective_date,
          title: item.title,
          chapter: item.chapter,
          subtitle: item.subtitle,
          word_count: wordCount,
          sections,
        });
      }
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

runWorker()
  .catch((err) => {
    console.error('Worker failed:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));

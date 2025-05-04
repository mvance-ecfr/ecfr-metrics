import { WorkItem } from 'cache';
import {
  getChapterXmlContent,
  getStructure,
  getSubtitleXmlContent,
} from 'ecfr';
import {
  collectParts,
  countWords,
  findChildByIdentifierAndType,
  SingleRegulationItem,
} from './util';
import { AxiosError } from 'axios';

export async function chapterWordCount(
  item: WorkItem
): Promise<[number, number]> {
  console.log(
    `Retrieving Agency ${item.agency} Date (${item.date}) Title (${item.title}) Chapter (${item.chapter})`
  );
  const structure = await getStructure(item.date, item.title);
  const chapter = findChildByIdentifierAndType(
    structure,
    item.chapter,
    'chapter'
  );
  if (!chapter) {
    console.error(
      `-----$$$$$$$______ Unable to find chapter in structure Chapter (${item.chapter}), Date (${item.date}), Title (${item.title})`
    );
    return [0, 0];
  }
  const sections: SingleRegulationItem[] = [];
  collectParts(sections, chapter.children as any);

  const totalRetrieveStart = Date.now();
  let totalWordCount = 0;
  for (const { part, section, appendix } of sections) {
    const retrieveStart = Date.now();
    try {
      const content = await getChapterXmlContent(
        item.date,
        item.title,
        item.chapter,
        part,
        section,
        appendix
      );
      const wordCount = countWords(content);
      const retrieveEnd = Date.now();
      totalWordCount += wordCount;
      console.log(
        `Retrieved Agency ${item.agency} Date (${item.date}) Title (${
          item.title
        }) Chapter (${item.chapter}) Part ${part} - ${wordCount} [${
          retrieveEnd - retrieveStart
        }ms]`
      );
    } catch (error: any) {
      console.error(
        `$$$___ Unable to retrieve Agency ${item.agency} Date (${
          item.date
        }) Title (${item.title}) Chapter (${
          item.chapter
        }) Part ${part} Section/Appendix ${section || appendix}. Skipping...`,
        error
      );
    }
  }
  const totalRetrieveEnd = Date.now();
  console.log(
    `Retrieved Chaptered Agency ${item.agency} Date (${item.date}) Title (${
      item.title
    }) Chapter (${item.chapter}) - ${totalWordCount} [${
      totalRetrieveEnd - totalRetrieveStart
    }ms]`
  );

  return [totalWordCount, sections.length];
}

export async function subtitleWordCount(
  item: WorkItem
): Promise<[number, number]> {
  console.log(
    `Retrieving Agency ${item.agency} Date (${item.date}) Title (${item.title}) Subtitle (${item.subtitle})`
  );
  const structure = await getStructure(item.date, item.title);
  const subtitle = findChildByIdentifierAndType(
    structure,
    item.subtitle,
    'subtitle'
  );
  if (!subtitle) {
    console.error(
      `-----$$$$$$$______ Unable to find subtitle in structure Subtitle (${item.subtitle}), Date (${item.date}), Title (${item.title})`
    );
    return [0, 0];
  }
  const sections: SingleRegulationItem[] = []; /* [part, section] */
  collectParts(sections, subtitle.children as any);

  const totalRetrieveStart = Date.now();
  let totalWordCount = 0;
  for (const { part, section, appendix } of sections) {
    const retrieveStart = Date.now();
    const content = await getSubtitleXmlContent(
      item.date,
      item.title,
      item.subtitle,
      part,
      section,
      appendix
    );
    const wordCount = countWords(content);
    const retrieveEnd = Date.now();
    totalWordCount += wordCount;
    console.log(
      `Retrieved Agency ${item.agency} Date (${item.date}) Title (${
        item.title
      }) Subtitle (${item.subtitle}) Part ${part} - ${wordCount} [${
        retrieveEnd - retrieveStart
      }ms]`
    );
  }
  const totalRetrieveEnd = Date.now();
  console.log(
    `Retrieved Subtitled Agency ${item.agency} Date (${item.date}) Title (${
      item.title
    }) Subtitle (${item.subtitle}) - ${totalWordCount} [${
      totalRetrieveEnd - totalRetrieveStart
    }ms]`
  );

  return [totalWordCount, sections.length];
}

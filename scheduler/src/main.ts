import { getVersions, getAgencies } from 'ecfr';
import { enqueueWork, WorkItemChapter } from 'cache';
import { max } from 'lodash';

const today = '2025-04-16';
async function runScheduler() {
  console.log('Getting agencies...');
  const agencies = await getAgencies();

  for (const topLevelAgency of agencies) {
    if (
      Array.isArray(topLevelAgency.children) &&
      topLevelAgency.children.length
    ) {
      for (const childAgency of topLevelAgency.children) {
        const chapters: WorkItemChapter[] = [];
        for (const ref of childAgency.cfr_references) {
          const latestVersion = await getLatestVersion(
            ref.title,
            ref.chapter,
            ref.subtitle,
            today
          );
          console.log(
            `Enqueueing work: effective ${today} Agency (${
              childAgency.sortable_name
            }), Title (${ref.title}), Chapter/Subtitle (${
              ref.chapter || ref.subtitle
            }), Date (${latestVersion.date})`
          );
          chapters.push({
            date: latestVersion.date,
            title: ref.title,
            chapter: ref.chapter,
            subtitle: ref.subtitle,
          });
        }
        await enqueueWork({
          agency: childAgency.sortable_name,
          effective_date: today,
          chapters,
        });
      }
    }
    const chapters: WorkItemChapter[] = [];
    for (const ref of topLevelAgency.cfr_references) {
      const latestVersion = await getLatestVersion(
        ref.title,
        ref.chapter,
        ref.subtitle,
        today
      );
      console.log(
        `Enqueueing work: effective ${today} Agency (${
          topLevelAgency.sortable_name
        }), Title (${ref.title}), Chapter/Subtitle (${
          ref.chapter || ref.subtitle
        }), Date (${latestVersion.date})`
      );
      chapters.push({
        date: latestVersion.date,
        title: ref.title,
        chapter: ref.chapter,
        subtitle: ref.subtitle,
      });
    }
    await enqueueWork({
      agency: topLevelAgency.sortable_name,
      effective_date: today,
      chapters,
    });
  }
}

async function getLatestVersion(
  title: number,
  chapter: string | undefined,
  subtitle: string | undefined,
  maxDate: string
) {
  const versions = await getVersions(title, chapter, subtitle, maxDate);
  const maxVersionDate = max(versions.map((v) => v.date));
  return versions.find((v) => v.date == maxVersionDate); // doesn't matter which one as we're only going to use the date anyway
}

runScheduler()
  .catch((err) => {
    console.error('Scheduler failed:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));

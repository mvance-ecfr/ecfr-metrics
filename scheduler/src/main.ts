import { getVersions, getAgencies } from 'ecfr';
import { enqueueWork, WorkItem } from 'cache';
import { max } from 'lodash';
import { hasResult, saveResult } from 'db';

const today = process.env['EFFECTIVE_DATE'] || '2025-05-01';
async function runScheduler() {
  console.log('Getting agencies...');
  const agencies = await getAgencies();
  for (const topLevelAgency of agencies) {
    for (const childAgency of topLevelAgency.children ?? []) {
      for (const ref of childAgency.cfr_references) {
        if (
          await hasResult(
            topLevelAgency.name,
            today,
            ref.title,
            ref.chapter || ref.subtitle
          )
        ) {
          console.log(
            `Already had result for Agency ${topLevelAgency.name} Title ${
              ref.title
            } Chapter/Subtitle ${
              ref.chapter || ref.subtitle
            } for effective date ${today}. Skipping...`
          );
          continue;
        }
        const latestVersion = await getLatestVersion(
          ref.title,
          ref.chapter,
          ref.subtitle,
          today
        );
        if (!latestVersion) {
          console.log(
            `Unable to find latest version Title ${ref.title} Chapter ${ref.chapter} Subtitle ${ref.subtitle} `
          );
          continue;
        }
        // save a preliminary result to the DB so we can know if we error later
        await saveResult({
          agency: topLevelAgency.name,
          effective_date: today,
          title: ref.title,
          subtitle: ref.subtitle,
          chapter: ref.chapter,
          word_count: 0,
          sections: 0,
        });
        await enqueueWork({
          agency: topLevelAgency.name,
          effective_date: today,
          date: latestVersion.date,
          title: ref.title,
          chapter: ref.chapter,
          subtitle: ref.subtitle,
        });

        console.log(
          `Enqueueing work: effective ${today} Agency (${
            topLevelAgency.name
          }), Title (${ref.title}), Chapter/Subtitle (${
            ref.chapter || ref.subtitle
          }), Date (${latestVersion.date})`
        );
      }
    }
    for (const ref of topLevelAgency.cfr_references) {
      if (
        await hasResult(
          topLevelAgency.name,
          today,
          ref.title,
          ref.chapter || ref.subtitle
        )
      ) {
        console.log(
          `Already had result for Agency ${topLevelAgency.name} Title ${
            ref.title
          } Chapter/Subtitle ${
            ref.chapter || ref.subtitle
          } for effective date ${today}. Skipping...`
        );
        continue;
      }
      const latestVersion = await getLatestVersion(
        ref.title,
        ref.chapter,
        ref.subtitle,
        today
      );
      if (!latestVersion) {
        console.log(
          `Unable to find latest version Title ${ref.title} Chapter ${ref.chapter} Subtitle ${ref.subtitle} `
        );
        continue;
      }
      console.log(
        `Enqueueing work: effective ${today} Agency (${
          topLevelAgency.name
        }), Title (${ref.title}), Chapter/Subtitle (${
          ref.chapter || ref.subtitle
        }), Date (${latestVersion.date})`
      );
      await saveResult({
        agency: topLevelAgency.name,
        effective_date: today,
        title: ref.title,
        subtitle: ref.subtitle,
        chapter: ref.chapter,
        word_count: 0,
        sections: 0,
      });
      await enqueueWork({
        agency: topLevelAgency.name,
        effective_date: today,
        date: latestVersion.date,
        title: ref.title,
        chapter: ref.chapter,
        subtitle: ref.subtitle,
      });
    }
    console.log(
      `Enqueued all work: effective ${today} Agency (${topLevelAgency.name})`
    );
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

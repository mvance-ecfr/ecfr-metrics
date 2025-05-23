import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ECfrTitle, EcfrStructure, EcfrAgency, EcfrVersion } from './types';
import { getCachedStructure, saveStructureToCache } from 'cache';

const client = axios.create();

axiosRetry(client, {
  retries: 10,
  retryCondition: (error) => {
    return true; // Retry on any error
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Exponential backoff delay
  },
});

export async function getTitles(): Promise<ECfrTitle[]> {
  const { data } = await client.get(
    'https://www.ecfr.gov/api/versioner/v1/titles.json'
  );
  return data.titles;
}

export async function getStructure(
  date: string,
  title: number
): Promise<EcfrStructure> {
  const structure = await getCachedStructure(title, date);
  if (structure) return structure;
  const { data } = await client.get(
    `https://www.ecfr.gov/api/versioner/v1/structure/${date}/title-${title}.json`
  );
  await saveStructureToCache(title, date, data);
  return data;
}

export async function getChapterXmlContent(
  date: string,
  title: number,
  chapter: string,
  part: string | undefined = undefined,
  section: string | undefined = undefined,
  appendix: string | undefined = undefined
): Promise<string> {
  const { data } = await client.get(
    `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title}.xml?chapter=${chapter}${
      part
        ? `&part=${part}${section ? `&section=${section}` : ''}${
            appendix ? `&appendix=${appendix}` : ''
          }`
        : ''
    }`,
    {
      responseType: 'text',
    }
  );
  return data;
}

export async function getSubtitleXmlContent(
  date: string,
  title: number,
  chapter: string,
  part: string | undefined = undefined,
  section: string | undefined = undefined,
  appendix: string | undefined = undefined
): Promise<string> {
  const { data } = await client.get(
    `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title}.xml?subtitle=${chapter}${
      part ? `&part=${part}` : ''
    }${section ? `&section=${section}` : ''}${
      appendix ? `&appendix=${appendix}` : ''
    }`,
    {
      responseType: 'text',
    }
  );
  return data;
}

/**
 * The agencies returned seem to have either cfr_references and/or children at the top level and a potential children level that also have cfr_references
 * No children have children so we don't need to iterate anything deeper than 2 levels to get all the children
 *
 * Since there are only 2 levels, you can think of everything having a parent agency that may have references to chapter/titles and
 * with optional children that each cfr_references (but not children themselves)
 *
 * For now I'm going to ignore the parent child relationship of agencies
 */
export async function getAgencies(): Promise<EcfrAgency[]> {
  const { data } = await client.get(
    'https://www.ecfr.gov/api/admin/v1/agencies.json'
  );
  return data.agencies;
}

export async function getVersions(
  title: number,
  chapter: string | undefined,
  subtitle: string | undefined,
  maxIssueDate: string
): Promise<EcfrVersion[]> {
  let query = `?issue_date%5Blte%5D=${maxIssueDate}`;
  if (chapter) {
    query = `${query}&chapter=${chapter}`;
  } else if (subtitle) {
    query = `${query}&subtitle=${subtitle}`;
  }
  const { data } = await client.get(
    `https://www.ecfr.gov/api/versioner/v1/versions/title-${title}.json${query}`
  );
  return data.content_versions;
}

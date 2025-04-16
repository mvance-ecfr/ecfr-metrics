import {
  getAgencies,
  getStructure,
  getTitles,
  getVersions,
  getChapterXmlContent,
} from './api';

describe('api', () => {
  it('should fetch titles with valid content', async () => {
    const titles = await getTitles();

    expect(titles.length).toBeGreaterThan(49);
  });
  it('should fetch agencies with valid content', async () => {
    const titles = await getAgencies();

    expect(titles.length).toBeGreaterThan(150);
    expect(titles[0].name).toBeDefined();
  });
  it('should fetch and return a valid EcfrVersion[]s for Title 1', async () => {
    const title = '3';

    const versions = await getVersions(title);

    expect(versions).toBeDefined();
    expect(versions.length).toBeGreaterThan(20);
    expect(versions[0].date).toBeDefined();
  });
  it('should fetch and return a valid EcfrStructure for Title 3', async () => {
    const date = '2025-04-01';
    const title = '3';

    const structure = await getStructure(date, title);

    expect(structure).toBeDefined();
    expect(structure.type).toBe('title');
    expect(structure.label).toContain('Title 3');
    expect(structure.children).toBeInstanceOf(Array);
    expect(structure.children?.length).toBeGreaterThan(0);
  });
  it('should fetch content as string only containing the given part', async () => {
    const date = '2025-04-01';
    const title = '1';
    const chapter = 'I';
    const part = '1';

    const content = await getChapterXmlContent(date, title, chapter, part);

    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
    expect(content.length).toBeLessThan(64000);
  });
});

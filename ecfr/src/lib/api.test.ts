import { getAgencies, getTitles } from './api';

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
});

import * as fs from 'fs';
import { join } from 'path';
import { collectParts } from './util';

const chapter = JSON.parse(
  fs.readFileSync(join(__dirname, 'fixtures/chapter.json'), 'utf-8')
);

test('collect chapter sections', () => {
  const sections = [];
  collectParts(sections, chapter.children);
  expect(sections.length).toBe(52); // 57 from Doge.gov for Advisory Council on Historic Preservation but that includes the 8 "reserved" + 3 "appendix"
});

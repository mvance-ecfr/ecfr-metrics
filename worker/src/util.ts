import { EcfrStructure } from 'ecfr';

export interface SingleRegulationItem {
  part: string;
  section?: string | undefined;
  appendix?: string | undefined;
}

export function countWords(xml: string): number {
  const text = xml.replace(/<[^>]+>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function findChildByIdentifierAndType(
  structure: EcfrStructure,
  identifier: string,
  type: string
): EcfrStructure | undefined {
  if (structure.identifier == identifier && structure.type == type)
    return structure;
  if (!Array.isArray(structure.children)) return undefined;
  for (const child of structure.children) {
    const result = findChildByIdentifierAndType(child, identifier, type);
    if (result) return result;
  }
  return undefined;
}

export function collectParts(
  sections: SingleRegulationItem[],
  children: EcfrStructure[]
): void {
  if (!Array.isArray(children)) return; // sometimes its null
  for (const child of children) {
    if (child.reserved) continue;
    if (child.type == 'part') {
      collectSections(sections, child.identifier, child.children);
    } else {
      collectParts(sections, child.children);
    }
  }
}
export function collectSections(
  sections: SingleRegulationItem[],
  part: string,
  children: EcfrStructure[]
): void {
  if (!Array.isArray(children)) return; // sometimes its null
  for (const child of children) {
    if (child.reserved) continue;
    if (child.type == 'section') {
      sections.push({ part, section: child.identifier });
    } else if (child.type == 'appendix') {
      sections.push({ part, appendix: child.identifier });
    } else {
      collectSections(sections, part, child.children);
    }
  }
}

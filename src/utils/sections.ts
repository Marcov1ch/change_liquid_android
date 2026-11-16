export const SECTIONS = ['replacements', 'tires', 'fuel', 'repairs', 'expenses', 'reference'] as const;

export type Section = (typeof SECTIONS)[number];

export function parseSection(value: string | undefined): Section {
  return (SECTIONS as readonly string[]).includes(value ?? '')
    ? (value as Section)
    : 'replacements';
}

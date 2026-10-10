export type SectionId = 'myself' | 'lego' | 'community' | 'awards';

export interface NavItem {
  id: SectionId | 'home';
  label: string;
  /** Màu của mục menu khi phần này đang mở (BRIEF mục 3). */
  color: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', color: 'var(--c-orange)' },
  { id: 'myself', label: 'MYSELF', color: 'var(--c-blue)' },
  { id: 'lego', label: 'LEGO', color: 'var(--c-pink)' },
  { id: 'community', label: 'COMMUNITY', color: 'var(--c-green)' },
  { id: 'awards', label: 'AWARDS', color: 'var(--c-purple)' },
];

export const SECTION_IDS: SectionId[] = ['myself', 'lego', 'community', 'awards'];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as string[]).includes(value);
}

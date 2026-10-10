import type { SectionId } from './sections';

/**
 * Bốn mục trong khối xanh "Meet four sides of me" (BRIEF mục 4 + 5).
 * Số đo: scripts/measure-myself.mjs, scripts/measure-myself-detail.mjs — đơn vị là px ở khổ
 * thiết kế 1440, tính từ mép trên / mép trái của khối xanh (khối xanh ở y=1590 trong phần,
 * xem src/sections/Myself.module.css).
 */
export interface MeetItem {
  id: SectionId;
  label: string;
  desc: string;
  /** Mép trái của cột chữ (mũi tên cũng bắt đầu ở đây). */
  x: number;
  /** Mép trên hộp dòng của nhãn (line-height 1.2 × 48px). */
  labelTop: number;
  /** Mép trên hộp dòng của mô tả (Roboto 20px, line-height 23px). */
  descTop: number;
  /** Mép trên của hình mũi tên (cao 14px). */
  arrowTop: number;
  /** Bề rộng hình mũi tên — trong thiết kế dài đúng bằng bề rộng dòng mô tả. */
  arrowWidth: number;
}

export const MEET_ITEMS: MeetItem[] = [
  {
    id: 'myself',
    label: 'MYSELF',
    desc: 'The person behind the projects.',
    x: 260,
    labelTop: 318.77,
    descTop: 374.88,
    arrowTop: 414.8,
    arrowWidth: 274.5,
  },
  {
    id: 'lego',
    label: 'LEGO',
    desc: 'What I enjoy building in my own time.',
    x: 895,
    labelTop: 311.77,
    descTop: 374.88,
    arrowTop: 414.8,
    arrowWidth: 332,
  },
  {
    id: 'community',
    label: 'COMMUNITY',
    desc: 'The teams and causes I contribute to.',
    x: 260,
    labelTop: 561.77,
    descTop: 617.88,
    arrowTop: 657.8,
    arrowWidth: 332,
  },
  {
    id: 'awards',
    label: 'AWARDS',
    desc: 'Research, recognition, and learning along the way.',
    x: 895,
    labelTop: 561.77,
    descTop: 617.88,
    arrowTop: 657.8,
    arrowWidth: 445,
  },
];

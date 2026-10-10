import legoTypes from './lego-types.json';

/** Một khối trong file dữ liệu cụm lego (sinh bởi scripts/measure-lego.mjs). */
export interface LegoBlock {
  /** Loại ảnh, ví dụ "lego-13" → src/assets/lego/lego-13.webp */
  type: string;
  /** Vị trí mép trái / mép trên, % theo chiều rộng / chiều cao khung. */
  x: number;
  y: number;
  /** Chiều rộng, % theo chiều rộng khung (chiều cao theo tỉ lệ ảnh). */
  w: number;
  /** Góc xoay thêm (độ); ảnh gốc đã xoay sẵn nên thường là 0. */
  rotation: number;
  /** Thứ tự lớp. */
  z: number;
}

export interface LegoCluster {
  source?: string;
  /** Kích thước khung ở khổ thiết kế 1440. */
  frame: { width: number; height: number };
  blocks: LegoBlock[];
}

const urls = import.meta.glob<string>('../assets/lego/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function legoUrl(type: string): string {
  const url = urls[`../assets/lego/${type}.webp`];
  if (!url) throw new Error(`Thiếu ảnh lego: ${type}`);
  return url;
}

export function legoAspect(type: string): number {
  return (legoTypes as Record<string, { aspect: number }>)[type].aspect;
}

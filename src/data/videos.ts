import cover1 from '../assets/lego-page/video-cover-1.webp';
import cover2 from '../assets/lego-page/video-cover-2.webp';

/**
 * Nguồn video của phần LEGO — file cấu hình DUY NHẤT (BRIEF mục 7).
 *
 * - File MP4 trong dự án: đặt vào public/videos/ rồi ghi `src: '/videos/ten-file.mp4'`.
 *   (File trên 25MB nên nén trước; GitHub chặn file trên 100MB.)
 * - Hoặc YouTube/Vimeo: ghi `embedUrl`, ví dụ 'https://www.youtube-nocookie.com/embed/VIDEO_ID'
 *   hoặc 'https://player.vimeo.com/video/VIDEO_ID'.
 * - Chưa có gì: để cả hai là null → chỉ hiện ảnh bìa, không báo lỗi.
 *
 * Ảnh bìa đã có sẵn nút play như thiết kế.
 */
export interface VideoSource {
  id: string;
  /** Mô tả cho trình đọc màn hình. */
  label: string;
  poster: string;
  src: string | null;
  embedUrl: string | null;
}

export const LEGO_VIDEOS: VideoSource[] = [
  { id: 'lego-video-1', label: 'LEGO build video 1', poster: cover1, src: null, embedUrl: null },
  { id: 'lego-video-2', label: 'LEGO build video 2', poster: cover2, src: null, embedUrl: null },
];

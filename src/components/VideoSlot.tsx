import { useEffect, useRef, useState } from 'react';
import type { VideoSource } from '../data/videos';
import styles from './VideoSlot.module.css';

/**
 * Khung video (BRIEF mục 7): hiện ảnh bìa; chỉ phát khi người xem bấm.
 * MP4: <video> có thanh điều khiển (play/pause, tua, âm lượng, toàn màn hình), preload="none".
 * YouTube/Vimeo: iframe nạp khi bấm. Chưa có nguồn: chỉ ảnh bìa, không báo lỗi.
 */
export function VideoSlot({ video, className }: { video: VideoSource; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSource = Boolean(video.src || video.embedUrl);

  useEffect(() => {
    if (playing) void videoRef.current?.play().catch(() => {});
  }, [playing]);

  return (
    <div className={`${styles.slot} ${className ?? ''}`}>
      {playing && video.src && (
        <video
          ref={videoRef}
          className={styles.media}
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          preload="none"
        />
      )}
      {playing && !video.src && video.embedUrl && (
        <iframe
          className={styles.media}
          src={`${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
          title={video.label}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
      {!playing && (
        <button
          type="button"
          className={styles.cover}
          disabled={!hasSource}
          aria-label={hasSource ? `Play: ${video.label}` : video.label}
          onClick={() => setPlaying(true)}
        >
          <img src={video.poster} alt="" draggable={false} loading="lazy" />
        </button>
      )}
    </div>
  );
}

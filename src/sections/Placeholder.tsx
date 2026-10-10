import type { CSSProperties, ReactNode } from 'react';
import styles from './Placeholder.module.css';

/**
 * Khung giữ chỗ cho bước 2: vùng cụm lego + tiêu đề thật + khối nội dung tạm,
 * với chiều cao lấy từ design-ref (đơn vị px ở khổ 1440) để thử cuộn/điều hướng.
 */
export function Placeholder({
  label,
  clusterHeight,
  bodyHeight,
  titleSize,
  gutter = 82,
  children,
}: {
  label: string;
  clusterHeight: number;
  bodyHeight: number;
  titleSize: number;
  gutter?: number;
  children: ReactNode;
}) {
  return (
    <div
      className={styles.root}
      style={
        {
          '--cluster-h': clusterHeight,
          '--body-h': bodyHeight,
          '--title-fs': titleSize,
          '--sec-gutter': gutter,
        } as CSSProperties
      }
    >
      <div className={styles.cluster}>Cụm lego {label} (bước 3)</div>
      <h2 className={`display ${styles.title}`}>{children}</h2>
      <div className={styles.body}>Nội dung {label} (bước 4–5)</div>
    </div>
  );
}

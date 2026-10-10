import type { CSSProperties, ReactNode } from 'react';
import styles from './Placeholder.module.css';

/**
 * Khung giữ chỗ: tiêu đề thật + khối nội dung tạm (cụm lego dùng chung nằm phía trên),
 * với chiều cao lấy từ design-ref (đơn vị px ở khổ 1440) để thử cuộn/điều hướng.
 */
export function Placeholder({
  label,
  bodyHeight,
  titleSize,
  gutter = 82,
  children,
}: {
  label: string;
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
          '--body-h': bodyHeight,
          '--title-fs': titleSize,
          '--sec-gutter': gutter,
        } as CSSProperties
      }
    >
      <h2 className={`display ${styles.title}`} data-lego-avoid>
        {children}
      </h2>
      <div className={styles.body}>Nội dung {label} (bước 4–5)</div>
    </div>
  );
}

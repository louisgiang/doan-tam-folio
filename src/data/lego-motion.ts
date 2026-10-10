/**
 * Mọi thông số chuyển động của lego (BRIEF mục 6) nằm ở đây.
 * Đơn vị độ dài: px ở khổ thiết kế 1440 (tự co giãn theo màn hình).
 */

/** 6A — cụm lego đầu mỗi phần: rơi vô tận. */
export const FALL = {
  /** Đứng yên đúng như thiết kế bao lâu trước khi bắt đầu rơi (ms). */
  startDelay: 900,
  /** Vận tốc rơi giới hạn của khối lớn, rơi hết chiều cao vùng (px/giây). */
  speed: 70,
  /**
   * Độ chênh tốc độ ngẫu nhiên giữa các khối (0.05 = ±5%).
   * Lưu ý: chênh càng nhiều thì khối nhanh càng phải chờ ẩn lâu phía trên khung
   * (mọi khối dùng chung một chu kỳ để mật độ luôn giống thiết kế).
   */
  speedJitter: 0.05,
  /** Hệ số tốc độ của khối nhỏ nhất so với khối lớn nhất (khối nhỏ chậm hơn để tạo chiều sâu). */
  smallBlockSpeed: 0.88,
  /** Thời gian để đạt vận tốc giới hạn (giây) — nhanh dần lúc đầu rồi đều. */
  accelTime: 0.9,
  /**
   * Tốc độ xoay tối đa (độ/giây); mỗi khối ngẫu nhiên 40–100% giá trị này, chiều ngẫu nhiên.
   * Góc đặt lại mỗi lượt rơi, nên trong một lượt khối xoay tối đa khoảng spin × chu kỳ.
   */
  spin: 3,
  /** Bắt đầu mờ khi tâm khối rơi tới tỉ lệ này của chiều cao vùng lego. */
  fadeStart: 0.68,
  /** Mờ hẳn khi tâm khối tới tỉ lệ này của chiều cao vùng lego. */
  fadeEnd: 1,
  /** Khối nằm thẳng trên tiêu đề phải mờ hẳn trước mép trên dòng chữ, cách thêm khoảng này (px). */
  textMargin: 4,
  /** Khi xuất hiện lại phía trên khung: hiện dần trong đoạn rơi này (tỉ lệ chiều cao vùng lego). */
  fadeIn: 0.18,
  /** Khoảng cách phía trên mép khung nơi khối xuất hiện lại (px, tính từ mép dưới khối). */
  respawnGap: 10,
};

/** 6B — lego ở đáy khối / chân trang: đung đưa nhẹ. */
export const SWAY = {
  /** Biên độ xoay tối đa (độ); mỗi khối ngẫu nhiên 70–100% giá trị này. */
  rotate: 2.5,
  /** Biên độ nhấp nhô lên xuống (px). */
  bob: 5,
  /** Chu kỳ (giây): mỗi khối ngẫu nhiên trong khoảng này. */
  periodMin: 4,
  periodMax: 6,
};

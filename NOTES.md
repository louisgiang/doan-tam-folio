# NOTES — Portfolio "Hi, I'm Tam"

## Bước 1 — Kiểm tra nguồn (2026-10-10)

### Vị trí thư mục
- Nguồn nằm trong `figma-export/` (`figma-export/design-ref/`, `figma-export/assets/`), không ở gốc như brief ghi.
- **Không có thư mục `content/`.**

### Khổ thiết kế
- Ảnh `design-ref/` rộng 5760px = xuất @3x → **khổ thiết kế 1920px**.
- Chiều cao từng ảnh (ở 1920, tính cả menu + cụm lego đầu phần):
  - HOME: ~1371px
  - MYSELF: ~3703px (2 ảnh: `myself 1` = trạng thái khối lego, `myself 2` = trạng thái ảnh chân dung)
  - LEGO: ~3109px
  - COMMUNITY: ~4517px
  - AWARDS: ~6461px

### Màu đo từ design-ref
- Nền #F4F1E8, HOME cam #EB570D, xanh dương #2060D7, LEGO hồng #FF417A, COMMUNITY #79E457, menu AWARDS #E09CE7 — khớp brief.
- Thêm (không có trong brief): khối "Meet four sides" #2060D7; chữ "MEET FOUR SIDES OF ME" vàng #FFE596; khối nền COMMUNITY xanh bạc hà #92DFB5; khối "Additional studies" #E09CE7.
- **Khác brief:** dòng 2 tiêu đề AWARDS là xanh lá #79E457, không phải tím.

### Lego
- `assets/lego/`: 37 file (số 1–38, thiếu 24), chỉ **19 ảnh khác nhau** (còn lại trùng hệt). Ảnh đã xoay sẵn góc như thiết kế, nền trong suốt.
- Cụm HOME: 37 khối. Cụm MYSELF/LEGO/COMMUNITY/AWARDS: giống nhau, 40 khối = cụm HOME + 3 khối hàng dưới (chỗ HOME đặt "HI, I'M TAM.").
- Lego đáy (MYSELF khối xanh, cuối LEGO, cuối AWARDS): cùng một bố cục, ~13 khối, nằm trên 3 nền khác nhau. COMMUNITY không có lego đáy.
- Vị trí từng khối: không có file toạ độ; phải đo từ design-ref (hoặc lấy từ Figma nếu được cấp quyền).

### Quyết định của chủ dự án sau bước 1
1. Chữ: **chép nguyên văn từ ảnh design-ref** vào `content/`; chủ dự án sẽ gửi bản chữ gốc để đối chiếu sau.
2. Cụm lego đầu phần: **giữ đúng thiết kế** — mỗi phần thả xuống vẫn có cụm lego riêng, kể cả khi nằm ngay dưới cụm HOME.
3. Màu dòng 2 tiêu đề AWARDS: **theo thiết kế (xanh lá #79E457)**.
4. Cột phải "Additional studies": có nội dung, ảnh tham chiếu lưu ở `design-ref/awards-additional-studies.png`.

### Git
- Thư mục chưa phải repo → đã `git init`. Danh tính commit đặt cục bộ trong repo: `giangchatgpt27 <giangchatgpt27@gmail.com>` (đổi bằng `git config user.name/user.email` nếu cần).
- `design-ref/` (68MB, file lớn nhất 24MB) vẫn được commit vì là nguồn gốc; dưới giới hạn 100MB/file của GitHub.

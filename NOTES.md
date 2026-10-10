# NOTES — Portfolio "Hi, I'm Tam"

## Bước 1 — Kiểm tra nguồn (2026-10-10)

### Vị trí thư mục
- Nguồn nằm trong `figma-export/` (`figma-export/design-ref/`, `figma-export/assets/`), không ở gốc như brief ghi.
- **Không có thư mục `content/`.**

### Khổ thiết kế (đã sửa ở bước 2)
- Ảnh `design-ref/` rộng 5760px = xuất **@4x** → **khổ thiết kế 1440px**. (Bước 1 báo nhầm 1920/@3x; phát hiện khi chữ dựng ra nhỏ hơn đúng 0.75. Đối chiếu: "I'M TAM." rộng 368px ở 97.8px — khớp design-ref.)
- Chiều cao từng phần ở 1440 (tính cả dải menu 66px + cụm lego đầu phần): HOME 1028 · MYSELF 2777 · LEGO 2332 · COMMUNITY 3388 · AWARDS 4846.

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

## Bước 2 — Khung trang

### Số đo (khổ 1440)
- Menu: Cubano 24px, cao dải menu 66px, khoảng cách giữa các mục 105px, căn giữa.
- Tiêu đề: line-height 1.2 (= metric mặc định của font). Cỡ: HOME/MYSELF/LEGO 97.8px; **COMMUNITY 64px**, **AWARDS 52px** (đo từ design-ref — cỡ này không có trong bảng của brief).
- Lề trái: ~82px; riêng AWARDS ~62px (thiết kế lệch như vậy, giữ nguyên).
- Gạch chân "I'M TAM.": dày 4.5px, cách chân chữ 10px.

### Tự quyết
- **Co giãn:** mọi kích thước tính theo "px thiết kế" = 100vw/1440, giãn tối đa tới 1920px (ở 1920 mọi thứ to hơn 1.33 lần, giữ bố cục như Figma); trên 1920 trang giữ 1920 và căn giữa. Có cỡ tối thiểu cho chữ (menu 15px, nội dung 16px, tiêu đề 40px).
- **Menu cố định:** một menu chung cho cả trang; dải menu riêng ở đầu mỗi phần trong thiết kế được bỏ, nội dung phần bắt đầu ngay dưới menu cố định khi cuộn tới.
- **Thời gian:** thả xuống 650ms ease-out (nội dung trượt từ -48px + hiện dần); thu lại 400ms ease-in. Cuộn mượt chạy song song và bám theo vùng nội dung đang giãn.
- Người xem tự cuộn (chuột/chạm/phím) trong lúc trang đang tự cuộn thì dừng tự cuộn.
- **Tab đang ẩn** hoặc **prefers-reduced-motion**: mở/thu và cuộn tức thì, không animation.
- Bấm nhanh nhiều mục liên tiếp: chỉ phần bấm cuối được mở; mỗi lần bấm vẫn tạo một mục lịch sử (Back đi qua từng mục đã bấm).
- Bấm lại mục đang mở: chỉ cuộn về đầu phần đó.
- Điện thoại (< 768px): nút ☰ bên phải, danh sách thả xuống; Esc hoặc chọn mục thì đóng.
- Font dự phòng cho Cubano: Arial Black / Segoe UI Black.

### Chữ
- Chữ đang được chép từ ảnh design-ref (theo quyết định sau bước 1). Bước 2 mới dùng tiêu đề + đoạn mô tả HOME; toàn bộ chữ sẽ chép vào `content/` ở các bước sau để đối chiếu.

## Bước 3 — HOME + lego rơi vô tận

### Dữ liệu lego
- Vị trí 37 khối HOME đo tự động từ `design-ref/Home.png` bằng `scripts/measure-lego.mjs` (tách khối khỏi nền, so khớp với 19 loại ảnh). Sai số khớp mọi khối < 3/255; 3 vùng chữ "MY WORLD." lọt vào vùng đo đã bị loại tự động (sai số > 10).
  Lệnh tạo lại: `node scripts/measure-lego.mjs figma-export/design-ref/Home.png src/data/lego-home.json --region 0,66,1440,962 --exclude 70,700,530,140 --exclude 70,820,1000,210`
- Khung cụm HOME: 1440 × 753 (từ dưới dải menu tới đáy khối thấp nhất).
- Hầu hết khối trong Figma có tỉ lệ đúng 1/4 file ảnh; riêng loại lego-9 (×0.315) và lego-11 (×0.198) được phóng/thu khác — đã giữ đúng như thiết kế.
- Ảnh lego chuyển sang WebP bằng `scripts/optimize-images.mjs`: 19 ảnh, ~240KB tổng (gốc ~2MB). File trùng nội dung gộp lại, đặt tên theo số nhỏ nhất (vd. lego-2 = 2, 16, 27, 33, 37, 38).

### Chuyển động (thông số trong `src/data/lego-motion.ts`, toán trong `src/lib/legoFall.ts`)
- **Chu kỳ chung:** mọi khối dùng chung một chu kỳ (HOME ≈ 13.5s). Mỗi khối rơi với tốc độ riêng; rơi hết vùng thì chờ ẩn phía trên khung tới lượt sau. Lý do: thử phương án mỗi khối một chu kỳ riêng thì sau vài phút các khối lệch pha ngẫu nhiên → lúc thưa lúc dồn cục (trái BRIEF). Với chu kỳ chung, bố cục thiết kế lặp lại đúng sau mỗi chu kỳ.
- Tốc độ = tốc độ nền × (quãng rơi của khối / quãng dài nhất) × hệ số kích thước (khối nhỏ nhất 0.88) × ngẫu nhiên ±5%. Khối nằm trên tiêu đề có quãng ngắn hơn nên rơi chậm hơn.
- **Tránh chữ:** khối nằm thẳng trên một dòng tiêu đề phải mờ hẳn khi mép dưới phần có hình còn cách dòng chữ 4px (đo vị trí dòng chữ thật lúc chạy, tự đo lại khi đổi cỡ màn hình). Khối khác mờ hẳn ở đáy vùng lego.
- Lượt đầu: khối bắt đầu rõ nét đúng chỗ thiết kế, đứng yên 0.9s rồi mới rơi; khối nằm sát ngay trên chữ (vd. khối cam nhỏ trên "WORLD") mờ đi trong vài pixel đầu.
- Xoay: tối đa 3°/giây, góc đặt lại mỗi lượt (lúc khối đang ẩn) để không bị lật ngược sau nhiều vòng.
- Tạm dừng: ra khỏi màn hình (IntersectionObserver), chuyển tab. `prefers-reduced-motion`: đứng yên.

### Kiểm tra bằng mô phỏng (`scripts/simulate-fall.ts`, 3 phút, 60Hz)
- Không khối nào chạm vùng chữ khi còn nhìn thấy (opacity lớn nhất khi chạm = 0).
- Sau 15s: tổng số khối rõ (opacity > 0.3) 22–33 trong 90% thời gian; mỗi 1/4 cột luôn có 4–10 khối.
- Opacity thay đổi tối đa 0.069 mỗi khung hình (không bật/tắt đột ngột).

### Chỉnh sau góp ý (bước 3, lần 2)
- **Vùng lego HOME co theo chiều cao màn hình** (chủ dự án chọn) để tiêu đề + mô tả luôn nằm trọn trong màn hình đầu tiên. Vùng lego = 100svh − menu − 2 dòng tiêu đề − mô tả − khoảng thở; tối đa bằng thiết kế (639.5px ở 1440), tối thiểu một nửa thiết kế.
  Khi khung co còn k lần, **cả khối lego cũng co k lần** (giữ tâm ngang) và vận tốc giảm k lần — để quan hệ trên–dưới giữa lego và tiêu đề giống hệt thiết kế (nếu chỉ nén vị trí mà giữ cỡ khối thì khối hàng dưới đè lên tiêu đề ngay từ đầu — mô phỏng đã bắt được lỗi này). Ví dụ 1440×900: k ≈ 0.73; 1920×1080: k ≈ 0.7; màn đủ cao: k = 1, đúng thiết kế.
- **Mờ muộn hơn:** `fadeStart` 0.5 → 0.68 (chủ dự án thấy mờ hơi sớm). 1/3 dưới vùng lego giờ trung bình 4.4 khối rõ (trước 2.6). Vẫn không chạm chữ ở cả khung thiết kế lẫn khung co.

### Ghi chú
- Điện thoại: chưa xử lý (bước 6).

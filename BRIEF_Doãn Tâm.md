# BRIEF: Website portfolio "Hi, I'm Tam" (chủ đề Lego)


## 0. Tổng quan

- Website portfolio **một trang dài**, bám sát thiết kế Figma. Ảnh chụp thiết kế từng phần nằm trong `design-ref/`.
- Thanh menu trên cùng: **HOME · MYSELF · LEGO · COMMUNITY · AWARDS**.
- Điểm nhấn: **cụm lego ở phần đầu mỗi phần rơi vô tận như mưa lego, mờ dần khi rơi xuống.** Lego ở những chỗ khác (đáy các khối, chân trang) đứng yên và đung đưa nhẹ.
- Công nghệ: Vite + React + TypeScript, CSS thuần hoặc CSS Modules. Không cần backend. `npm run build` ra thư mục tĩnh để đưa lên Vercel/Netlify.

## 1. Quy tắc cứng

1. **Nguồn dữ liệu chính là thư mục tôi cung cấp:** `design-ref/` (ảnh chụp thiết kế), `assets/` (ảnh, lego, font), `content/` (chữ). 
2. **Không đoán ảnh, không dùng ảnh tạm trong bản giao.** Thiếu ảnh/chữ thì liệt kê và dừng.
3. **Chữ chép đúng nguyên văn** từ `content/`, không viết lại, không sửa lỗi chính tả. Chưa có chữ cho phần nào thì để khung giữ chỗ và ghi vào `NOTES.md`.
4. **Làm theo từng chặng và dừng lại ở mỗi điểm dừng** (mục 9). Không tự làm tiếp khi chưa được duyệt.
5. Mọi chỗ phải đoán hoặc tự quyết đều ghi vào `NOTES.md`.
6. Mỗi chặng được duyệt: commit git (và push nếu repo có remote).

## 2. Font và cỡ chữ

| Dùng cho | Font | Cỡ (ở khổ thiết kế) |
|---|---|---|
| Menu | iCielBC Cubano | 24px |
| Tiêu đề lớn (ví dụ "HI, I'M TAM.", "SMALL BRICKS.") | iCielBC Cubano | 97.8px |
| Nội dung | Roboto | 20px |

- **Roboto** lấy từ Google Fonts (có đủ tiếng Việt).
- **iCielBC Cubano không có trên Google Fonts.** Tôi sẽ đặt file font vào `assets/fonts/`. Chuyển sang `.woff2`, nạp bằng `@font-face` với `font-display: swap`, font dự phòng gần giống. Nếu thư mục chưa có file font, **dừng và báo tôi**, không thay bằng font khác.
- Các tiêu đề phụ, nhãn nhỏ (ví dụ "HEAD OF FINANCE | APRIL–SEPTEMBER 2025", tên mục trong "Meet four sides of me") không có trong bảng: đo theo `design-ref/`, ghi lại cỡ đã chọn vào `NOTES.md`.
- Cỡ chữ trên là ở chiều rộng thiết kế (xác định ở bước 1). Màn hình nhỏ hơn thì co lại bằng `clamp()`; tiêu đề 97.8px trên điện thoại cần xuống khoảng 40–48px.

## 3. Màu của từng phần

Mục menu đang mở và dòng thứ hai của tiêu đề có màu riêng cho mỗi phần. Lấy đúng mã màu từ Figma hoặc đo từ `design-ref/`:

- HOME: cam #EB570D ("MY WORLD."), xanh dương #2060D7 ("I'M TAM." có gạch chân)
- MYSELF: xanh dương #2060D7
- LEGO: hồng #FF417A
- COMMUNITY: xanh lá #79E457
- AWARDS: tím #E09CE7

Màu nền chính: #F4F1E8
màu text chính (màu đen): #191919

## 4. Luồng điều hướng

**Cấu trúc:** một trang duy nhất. Phần **HOME** (lego rơi + "HI, I'M TAM. WELCOME TO MY WORLD.") luôn nằm trên cùng. Bên dưới là **vùng nội dung** nơi các phần MYSELF, LEGO, COMMUNITY, AWARDS được "thả xuống".

**Khi bấm một mục trên menu** (MYSELF, LEGO, COMMUNITY, AWARDS):

1. Phần tương ứng **mở ra bên dưới HOME** bằng hiệu ứng thả xuống: chiều cao vùng nội dung giãn ra từ 0, nội dung trượt nhẹ từ trên xuống và hiện dần (khoảng 500–700ms, ease-out).
2. Trang **cuộn mượt** tới đầu phần vừa mở.
3. Nếu đang mở một phần khác, phần cũ **thu lại** rồi phần mới mới thả xuống (chỉ mở một phần tại một thời điểm).
4. Mục menu đổi màu theo phần đang mở (mục 3).
5. Mỗi phần giữ nguyên thiết kế gốc, **kể cả cụm lego đầu phần**. Cụm lego này bắt đầu rơi khi phần vừa thả xuống xong.

**Bấm HOME:** thu phần đang mở lại và cuộn về đầu trang.

**Bốn mục trong khối xanh "Meet four sides of me"** (Myself, Lego, Community, Awards, có mũi tên): hoạt động y như bấm menu.

**Địa chỉ trang:** cập nhật `#myself`, `#lego`… trên thanh địa chỉ khi mở một phần, để gửi link được và nút Back của trình duyệt đóng/mở đúng phần. Mở link có sẵn `#lego` thì tự mở phần LEGO.

**Menu cố định trên cùng** khi cuộn (giữ nền màu kem để chữ menu luôn đọc được). Trên điện thoại: thu thành nút ☰ mở danh sách.

> Phần này là cách tôi hiểu luồng điều hướng. Nếu khi dựng thấy điểm nào không khớp với thiết kế (ví dụ cụm lego bị lặp hai lần liền nhau giữa HOME và phần vừa mở), **dừng lại hỏi tôi**, không tự đổi cách.

## 5. Nội dung từng phần

**HOME:** cụm lego rơi + tiêu đề hai dòng + đoạn mô tả hai dòng.

**MYSELF:**
- Tiêu đề "A LITTLE ABOUT ME", đoạn giới thiệu, thông tin học tập (GPA, SAT).
- **Khối lego xanh dương lớn bên phải bấm được:** bấm vào thì đổi sang **ảnh chân dung** (khung ảnh hình dáng bất thường, có viền mảnh, nghiêng nhẹ, như trong `design-ref/`). Chuyển bằng hiệu ứng lật hoặc phóng-mờ khoảng 400ms. Bấm vào ảnh thì đổi lại thành khối lego. Có con trỏ dạng bàn tay và gợi ý nhỏ khi hover để người xem biết bấm được. Ảnh chân dung cần là PNG nền trong suốt, đã cắt sẵn theo khung.
- Khối lego lớn **đè lên mép** khối xanh "Meet four sides of me" như thiết kế.
- Khối xanh "Meet four sides of me": 4 mục có mũi tên (xem mục 4), lego ở đáy đung đưa nhẹ (mục 6B).

**LEGO:**
- Tiêu đề "SMALL BRICKS. / BIG POSSIBILITIES.", ảnh mô hình F1 kèm chú thích, đoạn chữ bên phải.
- **Hai video đặt cạnh nhau** (đúng vị trí, tỉ lệ khung như thiết kế). Dùng component `VideoSlot` (mục 7).
- Lego ở đáy đung đưa nhẹ (mục 6B), một phần nằm sau video.

**COMMUNITY:**
- Tiêu đề, khối xanh lá có 2 dự án (ARIA PROJECT, LOTUSMED 2025), rồi GREEN SCHOOL CLUB, ECOWANDER, DAILYECONS.
- **ECOWANDER có slider ảnh** (2 chấm tròn bên dưới ảnh = 2 ảnh): bấm chấm để chuyển ảnh, vuốt ngang trên điện thoại, chuyển bằng trượt ngang khoảng 400ms. **Không tự chạy.** Số ảnh lấy theo số file trong `assets/community/ecowander/`, số chấm tự khớp theo.
- Chữ tôi sẽ đặt trong `content/community.md`.

**AWARDS:** ảnh và chữ tĩnh, không tương tác.

## 6. Hiệu ứng lego

### 6A. Cụm lego đầu mỗi phần: rơi vô tận

- **Khi vừa hiện ra**, các khối nằm **đúng vị trí, kích thước và góc xoay như thiết kế**, để ấn tượng đầu tiên giống Figma. Sau đó tất cả bắt đầu rơi.
- **Rơi liên tục, không dừng:** mỗi khối rơi thẳng xuống, nhanh dần lúc đầu rồi giữ tốc độ gần đều (như vật rơi đạt vận tốc giới hạn). Mỗi khối có tốc độ hơi khác nhau (khối nhỏ chậm hơn một chút để tạo chiều sâu) và xoay chậm nhẹ trong lúc rơi.
- **Mờ dần khi rơi xuống:** độ mờ (opacity) giảm dần theo độ cao, về 0 trước khi chạm tới vùng tiêu đề/nội dung bên dưới, để cụm lego hòa vào phần dưới chứ không bị cắt ngang. Điểm bắt đầu mờ và điểm biến mất hẳn chỉnh được trong file cấu hình; mặc định bắt đầu mờ ở khoảng 50% chiều cao vùng lego, biến mất hẳn ở mép dưới vùng lego.
- **Quay vòng:** khối mờ hẳn thì xuất hiện lại phía trên mép trên của khung, **giữ nguyên vị trí ngang (cột) và loại khối của nó**, rồi rơi tiếp. Như vậy mật độ và màu sắc phân bố giống thiết kế, mưa không bị dồn về một phía. Khi xuất hiện lại, khối hiện dần từ trong suốt (không bật ra đột ngột).
- Mật độ lúc nào cũng xấp xỉ như thiết kế: không được có lúc trống trơn hoặc dồn cục.

**Yêu cầu kỹ thuật (6A):**

- Lego **không che chữ, không chặn click**: giữ thứ tự lớp như thiết kế, `pointer-events: none`, không đè lên menu.
- Chỉ dùng `transform` và `opacity`. Không dùng thư viện vật lý.
- **Tạm dừng khi không thấy:** dừng khi cụm lego ra khỏi màn hình (IntersectionObserver), khi chuyển tab, hoặc khi phần đó đang thu lại; quay lại thì chạy tiếp.
- **`prefers-reduced-motion`:** lego đứng yên đúng vị trí, không rơi.
- Gom mọi thông số (tốc độ rơi, độ chênh tốc độ giữa các khối, tốc độ xoay, điểm bắt đầu mờ, điểm biến mất) vào **một file cấu hình**.
- Chạy bằng một vòng `requestAnimationFrame` duy nhất cho cả cụm (không tạo hàng chục timer riêng), tính theo thời gian thực để tốc độ không phụ thuộc tần số màn hình.
- **Một component dùng chung** cho mọi phần, nhận danh sách khối từ file dữ liệu (ví dụ `src/data/lego-home.json`): mỗi khối gồm loại ảnh, vị trí (% theo khung), kích thước, góc xoay, thứ tự lớp.
- Cụm lego ở các phần trông như dùng cùng một bố cục. Kiểm tra: nếu giống nhau thì dùng chung một file dữ liệu; khác nhau thì mỗi phần một file.
- **Điện thoại:** kiểm tra độ mượt; nếu giật thì giảm số khối trên màn hình nhỏ và ghi tiêu chí vào `NOTES.md`.

### 6B. Lego ở những chỗ khác (đáy khối xanh "Meet four sides of me", cuối phần LEGO, chân trang): đung đưa nhẹ

- Đứng đúng vị trí thiết kế, chỉ **đung đưa rất nhẹ**: xoay qua lại khoảng ±2–3° và nhấp nhô lên xuống vài pixel, chu kỳ chậm khoảng 4–6 giây.
- Mỗi khối lệch pha và lệch chu kỳ ngẫu nhiên để không chuyển động đồng loạt.
- Chỉ dùng `transform`, `pointer-events: none`, tạm dừng khi ra khỏi màn hình.
- `prefers-reduced-motion`: đứng yên hoàn toàn.
- Biên độ và chu kỳ nằm trong cùng file cấu hình với 6A.

## 7. Video

- Hai video ở phần LEGO: khung đúng vị trí và tỉ lệ như thiết kế, có ảnh bìa (poster) và nút play như thiết kế.
- **Chỉ phát khi người xem bấm play**, không tự phát, có thanh điều khiển cơ bản (play/pause, tua, âm lượng, toàn màn hình).
- Dùng thẻ `<video>` với file MP4 trong dự án (`preload="none"`, `playsinline`). Nguồn video khai báo ở **một file cấu hình duy nhất** (ví dụ `src/data/videos.ts`) để sau này đổi sang link YouTube/Vimeo nếu cần.
- Chưa có file video thì hiện ảnh bìa và khung giữ chỗ, không báo lỗi.
- Nếu file MP4 nào trên 25MB, cảnh báo tôi và đề xuất nén bằng ffmpeg (GitHub chặn file trên 100MB).

## 8. Bước 1: Kiểm tra nguồn và lập bản đồ (dừng lại cho tôi duyệt)

Đọc `design-ref/`, `assets/`, `content/` (và Figma nếu cần, tiết kiệm lượt gọi), rồi báo:

1. Chiều rộng thiết kế (khổ máy tính) và chiều cao từng phần.
2. Danh sách ảnh **đã có** và **còn thiếu** cho từng phần, kể cả: từng loại khối lego (PNG nền trong suốt), khối lego xanh lớn, ảnh chân dung đã cắt khung, ảnh poster cho 2 video, ảnh slider Ecowander, font iCielBC Cubano.
3. Phần nào **chưa có chữ** trong `content/`.
4. Số khối lego và số **loại** khối trong cụm đầu phần; cụm của các phần có giống nhau không.
5. Mọi chỗ trong mục 4–5 mà ảnh thiết kế cho thấy khác với mô tả.

## 9. Thứ tự làm và điểm dừng

1. Bước 1 (mục 8) → **dừng**
2. Khung trang: menu, font, màu, cơ chế mở/thu từng phần (mục 4) với nội dung tạm là tiêu đề → **dừng** cho tôi thử điều hướng
3. HOME hoàn chỉnh + hiệu ứng lego rơi vô tận (6A) → **dừng** cho tôi chỉnh thông số
4. MYSELF (kèm đổi lego ↔ ảnh) → **dừng**
5. LEGO (kèm 2 khung video), COMMUNITY (kèm slider), AWARDS → mỗi phần xong báo một lần
6. Bố cục điện thoại cho toàn trang → **dừng**
7. Kiểm tra cuối: `npm run build` không lỗi; kiểm tra ở 1920, 1440, 1366, tablet, điện thoại; mở/thu từng phần, nút Back, link có `#`; lego chỉ rơi ở cụm đầu phần, mờ dần trước khi chạm chữ, không có lúc trống hay dồn cục; lego chân trang chỉ đung đưa; mọi chuyển động dừng khi cuộn đi; video chỉ phát khi bấm play; tổng dung lượng `dist/` và ảnh nặng nhất; cập nhật `NOTES.md`.

# Hi, I'm Tam — portfolio (chủ đề Lego)

Website một trang dựng từ thiết kế Figma trong `figma-export/`. Vite + React + TypeScript, CSS Modules, không có backend.

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất trang tĩnh ra dist/ (đưa lên Vercel/Netlify)
```

## Sửa nội dung thường gặp

| Muốn đổi | Sửa ở |
|---|---|
| Thông số lego rơi / đung đưa | `src/data/lego-motion.ts` |
| Nguồn video phần LEGO (MP4 / YouTube / Vimeo) | `src/data/videos.ts` (file MP4 đặt trong `public/videos/`) |
| Chữ từng phần | `src/sections/*.tsx` (bản chép để đối chiếu: `content/*.md`) |
| Màu, cỡ chữ chung | `src/styles/global.css` |

## Công cụ (chạy khi đổi ảnh/thiết kế)

- `node scripts/optimize-images.mjs` — chuyển ảnh trong `figma-export/assets` sang WebP vào `src/assets`.
- `node scripts/measure-lego.mjs …` — đo vị trí lego từ ảnh design-ref (lệnh cụ thể trong `NOTES.md`).
- `npx esbuild scripts/simulate-fall.ts --bundle --platform=node | node - src/data/lego-section.json` — mô phỏng lego rơi để kiểm tra mật độ / chạm chữ.

Mọi số đo, quyết định và chỗ tự quyết: xem `NOTES.md`.
Video gốc (`figma-export/assets/public-video/`, ~850MB) không nằm trong git.

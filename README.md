# 🎓 HSA Education - Scripts Hỗ Trợ

Tuyển tập các công cụ (scripts) hỗ trợ học viên học tập hiệu quả hơn trên hệ thống HSA Education. 

*(Lưu ý: Dự án phát triển với mục đích duy nhất là hỗ trợ học tập, hoàn toàn không có ý đồ tiêu cực).*

---

## 🎥 1. Trình Xuất Video Bài Giảng

**TL;DR:** Mở bài giảng > Nhấn `F12` > Chọn thẻ `Console` > Dán code JS > Nhấn `Enter` > Bấm vào link YouTube để xem nét.

### ❓ Vấn đề
Video nhúng (embed) trên hệ thống ẩn tính năng chỉnh độ phân giải, khiến bài giảng thường bị mờ, nhòe, khó ghi chép.

### 💡 Giải pháp
Script trích xuất đường dẫn YouTube gốc. Giúp học viên xem trực tiếp trên YouTube và tự do chỉnh chất lượng video lên cao nhất.

### ⚙️ Cơ chế hoạt động
1. **Xác định bài giảng**: Trích xuất ID bài giảng từ đường dẫn web (`/bai-giang/<id>`).
2. **Xác thực**: Lấy mã Token đăng nhập Firebase từ bộ nhớ nội bộ (`IndexedDB`).
3. **Truy xuất**: Gửi ID và Token lên API HSA để xin thông tin chi tiết bài học.
4. **Tạo link**: Lấy mã `videoGuid` từ máy chủ, ghép thành link YouTube và hiển thị.

### 🚀 Hướng dẫn sử dụng
1. Copy toàn bộ đoạn mã trong file script.
2. Mở trang bài giảng đang học.
3. Nhấn `F12` (hoặc `Ctrl + Shift + I` / `Cmd + Option + I`) mở **Developer Tools**.
4. Chuyển sang thẻ **Console**.
5. Dán đoạn mã vừa copy và nhấn `Enter`.
6. Nhấp vào đường dẫn YouTube hiển thị để xem.

---

## ⏳ 2. [Các scripts khác sẽ được cập nhật tại đây]
*Đang phát triển...*

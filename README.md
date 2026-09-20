# 🎓 HSA Education - Các scripts hỗ trợ.

**I. Trình Xuất Video Bài Giảng**
**TL;DR:** Mở bài giảng > Nhấn `F12` > Chọn thẻ `Console` > Dán code JS > Nhấn `Enter` > Bấm vào link YouTube để xem video sắc nét.

---

Công cụ hỗ trợ khắc phục tình trạng video bài giảng bị mờ trên hệ thống HSA Education.

## ❓ Vấn đề
Các bài giảng trên hệ thống sử dụng trình phát video nhúng (embed) của YouTube nhưng lại ẩn tính năng tùy chỉnh độ phân giải. Điều này khiến video thường xuyên bị mờ, nhòe, gây khó khăn cho học viên trong quá trình theo dõi và ghi chép.

## 💡 Giải pháp
Script này giúp học viên trích xuất đường dẫn YouTube gốc của bài giảng. Nhờ đó, bạn có thể xem video trực tiếp trên YouTube và tự do tùy chỉnh chất lượng lên mức cao nhất. 
*(Lưu ý: Công cụ này được phát triển với mục đích duy nhất là hỗ trợ học viên học tập hiệu quả hơn. Hoàn toàn không có bất kỳ ý đồ tiêu cực nào).*

## ⚙️ Cơ chế hoạt động

Đoạn script hoạt động tự động qua 4 bước:
1. **Xác định bài giảng**: Trích xuất mã ID bài giảng trực tiếp từ đường dẫn trên thanh địa chỉ trình duyệt.
2. **Xác thực quyền truy cập**: Truy cập vào cơ sở dữ liệu nội bộ của trình duyệt (`IndexedDB`) để lấy mã Token đăng nhập Firebase.
3. **Truy xuất dữ liệu**: Gửi yêu cầu (chứa ID bài học và Token) đến máy chủ API của HSA để lấy thông tin chi tiết của bài giảng đó.
4. **Tạo liên kết gốc**: Lấy mã `videoGuid` từ dữ liệu máy chủ trả về, ghép nối thành một đường dẫn YouTube hoàn chỉnh và hiển thị cho người dùng.

## Hướng dẫn sử dụng

1. Sao chép (Copy) toàn bộ đoạn mã trong file script.
2. Truy cập vào trang bài giảng bạn đang học (đường dẫn web có định dạng `/bai-giang/<id>`).
3. Nhấn phím `F12` (hoặc `Ctrl + Shift + I` / `Cmd + Option + I` trên Mac) để mở công cụ **Developer Tools**.
4. Chuyển sang thẻ **Console**.
5. Dán (Paste) đoạn mã vừa copy vào và nhấn `Enter`.
6. Nhấp vào đường dẫn YouTube hiển thị trên màn hình để xem video.

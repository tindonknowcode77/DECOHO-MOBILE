# Chức năng khách hàng DECOHO Mobile

App native riêng, không nhúng website làm giao diện chính. Expo Router quản lý 5 tab và các màn hình chi tiết. Dữ liệu đi trực tiếp đến backend NestJS qua `EXPO_PUBLIC_API_URL`.

| Nhóm | Đã triển khai | API chính |
| --- | --- | --- |
| Trang chủ | Hero theo nhận diện DECOHO, sản phẩm, moodboard, lối vào AI/3D/cộng đồng | products, moodboards |
| Khám phá | Tìm tên/thương hiệu, danh mục và danh mục con, lọc giá, sắp xếp | products, categories |
| Sản phẩm | Ảnh, mô tả, giá sau giảm, tồn kho, yêu thích, đọc/gửi đánh giá | products/:id, product-favorites, reviews |
| Giỏ hàng | Thêm/xóa, số lượng, lưu trên thiết bị, tách theo tài khoản, gộp giỏ khách khi đăng nhập | AsyncStorage; giá được backend kiểm tra khi đặt hàng |
| Đặt hàng | Địa chỉ, kiểm tra mã giảm giá, COD, khóa nút khi đang gửi, xử lý phản hồi bị mất | promotions/validate, orders |
| Đơn hàng | Danh sách/lọc trạng thái, chi tiết, lịch sử, yêu cầu hỗ trợ đơn | orders/mine, orders/mine/:id/complaint |
| Tài khoản | Email/password, đăng ký, xác thực/gửi lại email, quên/đổi mật khẩu bằng token, đăng xuất | auth/* |
| Hồ sơ | Sửa tên/điện thoại, ảnh đại diện, phong cách/ngân sách, xóa tài khoản có xác nhận | users/me, users/me/avatar, users/me/onboarding |
| Google | Gửi ID token Google native về backend; chỉ hiện khi đã cấu hình client ID | auth/google |
| Moodboard | Thư viện, lọc phòng, chi tiết có điểm ghim, chia sẻ, bộ sưu tập riêng, upload cá nhân | moodboards/*, product-spaces/* |
| AI | Chụp/chọn ảnh, upload, trạng thái xử lý, kết quả nhận diện, tìm sản phẩm tương tự | ai-scanner/scan |
| Cộng đồng | Feed/phân trang, tìm kiếm, theo dõi, lưu bài, cảm xúc, bài có ảnh/video, chia sẻ, xóa bài của mình | community/* |
| Bình luận | Đọc/gửi bình luận, trả lời theo luồng, thích bình luận, phân trang | community/posts/:id/comments |
| Hỗ trợ | Tạo yêu cầu, xem trạng thái/hội thoại, trả lời | support-tickets/* |
| Showroom | Danh sách, tải môi trường và mô hình GLTF với tọa độ từ server, xoay/zoom, mở sản phẩm | showrooms |

## Điều kiện và giới hạn cần kiểm tra trước khi phát hành

- Chưa kiểm thử trực tiếp trên Android/iPhone thật. Xuất bundle không phải tạo APK/IPA hoặc phát hành lên store.
- Google native cần development/production build, OAuth client, package/bundle ID và SHA-1 Android đúng. Expo Go vẫn dùng email/password; không tải module Google khi chưa chọn luồng đó.
- Thanh toán online mặc định tắt. Backend hiện có thông tin ngân hàng mẫu và cấu hình gateway mặc định; callback chưa có quy trình xác nhận/cập nhật đơn hoàn chỉnh. Chỉ bật `EXPO_PUBLIC_ENABLE_ONLINE_PAYMENTS=true` sau khi backend đã cấu hình và kiểm thử. App không suy diễn thanh toán thành công từ việc đóng trình duyệt.
- Tạo moodboard cá nhân cần backend bật `ENABLE_USER_MOODBOARD_CREATION=true`; nếu chưa bật, app hiển thị lỗi từ backend. Upload cần Cloudinary; AI cần Gemini; gửi email cần SMTP.
- Backend không có API khách hàng tự hủy đơn hoặc GET chi tiết đơn riêng. App dùng `/orders/mine` để tìm đúng đơn của tài khoản và dùng khiếu nại/hỗ trợ khi cần. Không gọi API admin thay thế.
- Share link cộng đồng trỏ tới `EXPO_PUBLIC_WEB_URL`. Link xác thực/reset mặc định của backend vẫn mở website; app cũng có màn hình nhập token và scheme `decoho://auth/reset?token=...` / `decoho://auth/verify?token=...`.
- Showroom dùng WebView cho vùng 3D; Three.js 0.180.0 tải từ jsDelivr. Model phải truy cập được và cho phép CORS. Không truyền token đăng nhập vào WebView. Cần thử hiệu năng/model thật trên thiết bị mục tiêu.
- Bản Expo web phục vụ QA; Google web tiếp tục thuộc website hiện có. Khi dùng API thật từ bản preview, cần cho phép origin tương ứng trong CORS backend.
- Giỏ hàng lưu theo thiết bị/tài khoản; chưa đồng bộ giỏ giữa web và mobile vì backend chưa có API giỏ hàng. Yêu thích và đơn hàng dùng backend chung.
- Admin và nhà cung cấp nằm ngoài phạm vi theo lựa chọn của người dùng.

## Kiểm thử

`scripts/smoke.cjs` kiểm thử 15 luồng giao diện, chặn và giả lập toàn bộ request `/api/*`. Không tạo đơn/bài đăng/tài khoản thật. Kết quả và ảnh màn hình ở `test-results/` (gitignored). Kết quả này xác minh UI và hợp đồng API đã đọc trong mã backend, không thay thế kiểm thử dịch vụ thật, camera, Google, thanh toán, upload và GPU 3D trên điện thoại.

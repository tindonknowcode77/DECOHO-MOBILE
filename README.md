# DECOHO Mobile

App khách hàng Expo SDK 57 + React Native + TypeScript, độc lập với `../decoho-fe` (web) và dùng API từ `../DECOHO` (NestJS). Có package.json, node_modules và lockfile riêng. Giao diện xanh–kem DECOHO gồm 5 tab: Trang chủ, Khám phá, AI Studio, Cộng đồng, Cá nhân.

## Chạy trên điện thoại

1. Mở terminal tại `C:\DECOHO\DECOHO`, chạy `npm run start:dev`. Backend cần cấu hình môi trường/database hiện có.
2. Mở terminal khác tại `C:\DECOHO\decoho-mobile`, chạy `npm install` nếu chưa có dependencies.
3. Copy `.env.example` thành `.env.local` nếu chưa có. Đặt `EXPO_PUBLIC_API_URL=http://<IPv4-máy-tính>:3001/api`. Dùng `ipconfig` để xem IPv4 Wi-Fi. Port/prefix phải khớp cấu hình backend.
4. Chạy `npm start`, mở Expo Go tương thích SDK 57 và quét QR. Máy tính và điện thoại cần cùng Wi-Fi. Google native cần development/production build riêng; các luồng email/password vẫn dùng được trong Expo Go.

Đặt `.env.local` theo IPv4 Wi-Fi hiện tại từ `ipconfig`; địa chỉ có thể đổi khi kết nối lại mạng. Biến EXPO_PUBLIC được đóng gói vào app, chỉ chứa URL công khai, không đặt mật khẩu hoặc khóa bí mật.

Android emulator dùng `http://10.0.2.2:3001/api`. Điện thoại thật không dùng `localhost`. Thử mở `http://<IPv4>:3001/api/health` trên trình duyệt điện thoại nếu app không kết nối. Kiểm tra backend đang chạy, mạng không chặn kết nối giữa thiết bị và Windows Firewall cho phép port backend/Metro trên mạng riêng. Khởi động lại Expo sau khi đổi `.env.local`.

## Chức năng

- Sản phẩm, tìm kiếm/lọc/sắp xếp, chi tiết, đánh giá và yêu thích.
- Giỏ hàng lưu theo tài khoản, gộp giỏ khách sau đăng nhập, mã giảm giá, đặt hàng COD và theo dõi đơn.
- Đăng ký/đăng nhập, xác thực email, quên/reset mật khẩu, hồ sơ/avatar, sở thích và xóa tài khoản.
- Moodboard, điểm ghim sản phẩm, không gian 3D, AI nhận diện nội thất từ ảnh.
- Cộng đồng: ảnh/video, lưu bài, theo dõi, cảm xúc, bình luận và trả lời.
- Yêu cầu hỗ trợ và trao đổi với đội ngũ DECOHO.

Xem [bảng chức năng và điều kiện backend](docs/FEATURES.md). Thanh toán online mặc định tắt vì backend còn cấu hình mẫu. Admin/nhà cung cấp ngoài phạm vi.

`src/app/` chứa các route Expo Router; `src/components/` chứa giao diện dùng chung; `src/lib/client.ts` quản lý API, timeout và refresh token; `src/lib/store.tsx` quản lý phiên và giỏ hàng; `src/lib/hooks.ts` quản lý tải dữ liệu theo màn hình/tài khoản. Token native lưu trong SecureStore; giỏ hàng lưu trong AsyncStorage.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm run doctor
npm run export
```

Xem thử giao diện bằng `npm run web -- --port 8083`. Website cũ vẫn chạy riêng trong `../decoho-fe`. Nếu bản Expo web gọi API thật, thêm origin preview vào CORS_ORIGIN của backend; không cần sửa CORS cho app native. Dùng API HTTPS công khai khi phát hành, IP LAN chỉ dùng phát triển.

Kiểm thử UI bằng Playwright đã cài sẵn trong môi trường:

```powershell
$env:PLAYWRIGHT_MODULE='đường-dẫn-đến-module-playwright'
# Tùy chọn nếu browser chưa nằm ở vị trí mặc định:
$env:CHROMIUM_EXECUTABLE='đường-dẫn-chromium.exe'
npm run test:smoke
```

Hoặc cài `playwright` trong môi trường kiểm thử để script tự tìm module. Script mặc định mở `http://localhost:8083`, ghi kết quả vào `test-results/`, và giả lập toàn bộ request API để không thay đổi dữ liệu thật.

## Google native và bản phát hành

Điền `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` trùng `GOOGLE_CLIENT_ID` của backend. iOS thêm `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` và `GOOGLE_IOS_URL_SCHEME` dạng `com.googleusercontent.apps.…`. Cấu hình package/bundle ID, Android SHA-1 trong Google Cloud Console; giá trị khởi tạo hiện là `com.decoho.mobile`, cần xác nhận quyền sở hữu trước khi phát hành.

Không có secret OAuth trong app. Thay đổi plugin/scheme cần build lại native qua EAS. Chưa tạo APK/IPA, chưa gửi lên store. Tham khảo [hướng dẫn Google của Expo](https://docs.expo.dev/guides/google-authentication/) và [EAS Build](https://docs.expo.dev/build/introduction/).

Template chính thức: https://docs.expo.dev/more/create-expo/

## Xác minh

TypeScript, lint và Expo Doctor (21/21) đã qua. Xuất bundle Android, iOS và web thành công. Kiểm thử UI giả lập đã qua 15 luồng khách hàng, gồm gộp giỏ khi đăng nhập, mã giảm giá, đặt hàng, refresh session, yêu thích, moodboard, cộng đồng và lỗi mạng. Chưa kiểm thử trên thiết bị thật hoặc xác minh end-to-end với database, Cloudinary, Gemini, SMTP, Google và thanh toán thật. Bundle JavaScript không phải APK/IPA.

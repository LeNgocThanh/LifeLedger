# Gia Sản

Gia Sản là ứng dụng quản lý tài sản và lịch sử dùng tiền dành cho cá nhân, hướng tới khả năng mở rộng cho gia đình và tự triển khai trên hạ tầng riêng.

Ứng dụng giúp người dùng trả lời các câu hỏi cơ bản trong suốt vòng đời tài sản:

- Tôi đang có những tài sản nào và chúng đang ở đâu?
- Tài sản được mua khi nào, ở đâu, với giá bao nhiêu và bằng hình thức thanh toán nào?
- Hóa đơn, giấy bảo hành, ảnh và giấy tờ liên quan đang được lưu ở đâu?
- Tài sản đã được sử dụng, bảo trì, sửa chữa hoặc nâng cấp như thế nào?
- Những linh kiện, vật tư nào đã được thay, với số lượng, đơn giá và thời hạn bảo hành bao lâu?
- Tôi đã chi tiền cho mặt hàng hoặc dịch vụ nào theo từng thời điểm?

## Mục tiêu sản phẩm

- Quản lý tập trung thông tin, giấy tờ và toàn bộ lịch sử vòng đời tài sản.
- Kết nối khoản chi với tài sản để tránh nhập dữ liệu và tính giá trị hai lần.
- Hỗ trợ tìm kiếm sâu theo tài sản, lịch sử, linh kiện, vật tư và khoản chi.
- Dữ liệu riêng tư theo mặc định.
- Cho phép người dùng tự cài hệ thống trên máy tính, NAS hoặc VPS.
- Mở rộng từ không gian cá nhân sang không gian gia đình, đồng sở hữu và chia sẻ có kiểm soát.
- Cung cấp trải nghiệm thống nhất trên web và ứng dụng di động.

## Chức năng đã triển khai

### Tài khoản và không gian

- Đăng ký, đăng nhập và quản lý phiên đăng nhập.
- Tự tạo không gian cá nhân cho người dùng mới.
- Phân quyền cơ bản theo vai trò `owner`, `manager` và `viewer`.
- Administrator được xác định bằng danh sách email trong biến môi trường `ADMIN_EMAILS`.

### Quản lý tài sản

- Danh sách, tìm kiếm, lọc và xem chi tiết tài sản.
- Thêm và chỉnh sửa tài sản.
- Lưu loại, trạng thái, vị trí, hãng, model, số sê-ri và mô tả.
- Lưu ngày mua, giá mua, nơi mua, địa chỉ, số điện thoại cửa hàng, hình thức thanh toán và mã đơn hàng.
- Các nhóm tài sản ban đầu gồm xe cộ, máy móc, đồ điện tử, nội thất, đồ gia dụng và loại khác.

### Giấy tờ và hình ảnh

- Tải ảnh và PDF lên Cloudinary thông qua API server.
- PostgreSQL chỉ lưu metadata của tệp, không lưu nội dung nhị phân.
- Tải lại giấy tờ và hình ảnh theo quyền truy cập tài sản.

### Lịch sử sử dụng và bảo trì

- Dòng thời gian sử dụng, bảo trì, bảo dưỡng, sửa chữa, thay thế và nâng cấp tài sản.
- Lưu ngày thực hiện, đơn vị thực hiện, địa điểm, nội dung và mốc bảo trì tiếp theo.
- Lưu chỉ số sử dụng như số kilomet hoặc số giờ vận hành.
- Một lần bảo trì hoặc sửa chữa có thể chứa nhiều linh kiện, vật tư.
- Mỗi linh kiện có tên, mã linh kiện, số lượng, đơn vị, đơn giá, bảo hành và ghi chú.
- Cho phép chỉnh sửa các bản ghi lịch sử đã tạo.
- Tìm kiếm tài sản có thể khớp với nội dung trong lịch sử và linh kiện.

### Danh mục dùng chung

- Administrator quản lý danh mục linh kiện và vật tư chuẩn tại `/admin/catalog`.
- Danh mục có tên, nhóm, hãng, mã linh kiện, đơn vị, mô tả và trạng thái hoạt động.
- Người dùng có thể chọn mục chuẩn hoặc tiếp tục nhập tự do.
- Danh mục được sử dụng trong lịch sử bảo trì và từng mặt hàng của khoản chi.
- Có script seed danh mục phổ biến và có thể chạy lặp lại an toàn.

### Lịch sử dùng tiền

- Ghi nhận tiền đã chi; chưa phải sổ thu–chi đầy đủ.
- Một giao dịch có nhiều mặt hàng hoặc dịch vụ.
- Lưu thời điểm, nơi mua, địa chỉ, số điện thoại, hình thức thanh toán, mã đơn hàng và ghi chú.
- Lưu số lượng, đơn vị, đơn giá, giảm giá từng mặt hàng, giảm giá chung, phụ phí và số thực trả.
- Tìm kiếm theo giao dịch, nơi mua, mặt hàng, nhóm và ghi chú.
- Liên kết mặt hàng với danh mục chuẩn hoặc tài sản.
- Tạo tài sản mới từ một mặt hàng đã mua trên web.
- Đồng bộ thông tin mua và phần giá được phân bổ từ khoản chi sang tài sản liên kết.
- Khoản chi là nguồn dữ liệu tài chính gốc, tránh cộng trùng giá mua tài sản và số tiền đã chi.
- Hỗ trợ trạng thái hoàn tất, hoàn tiền một phần, đã hoàn tiền và đã hủy.
- Có thùng rác 7 ngày, khôi phục và xóa vĩnh viễn theo quyền.

### Trang tổng quan web

- Hiển thị giá trị tài sản theo giá mua.
- Hiển thị tổng lịch sử đã chi.
- Hiển thị chi mua tài sản trong tuần, tháng, quý và năm hiện tại.
- Không cộng trùng khoản chi và giá trị tài sản liên kết.

### Ứng dụng mobile

- Đăng nhập và duy trì phiên native.
- Danh sách, tìm kiếm, thêm, sửa và xem chi tiết tài sản.
- Thêm và chỉnh sửa lịch sử tài sản cùng nhiều linh kiện, vật tư.
- Chọn linh kiện từ danh mục dùng chung.
- Chọn và tải ảnh hoặc PDF thông qua API server.
- Danh sách, tìm kiếm, tạo và sửa khoản chi.
- Khoản chi mobile hỗ trợ nhiều mặt hàng, danh mục dùng chung và liên kết tài sản.

## Phạm vi chưa triển khai hoàn chỉnh

Các nội dung dưới đây thuộc định hướng tiếp theo, chưa nên xem là chức năng hoàn chỉnh của phiên bản hiện tại:

- Không gian gia đình, lời mời thành viên và quản lý thành viên đầy đủ.
- Một tài sản xuất hiện trong nhiều không gian qua giao diện người dùng.
- Quản lý đồng sở hữu và tỷ lệ sở hữu.
- Tài sản cha, tài sản con và quan hệ giữa các tài sản.
- Loại tài sản và trường thông tin tùy chỉnh do người dùng tạo.
- Liên kết chia sẻ công khai có mật khẩu, hạn dùng và quyền tải tệp.
- Chuyển nhượng tài sản và giới hạn lịch sử cho chủ cũ.
- Mã hóa phía người dùng để quản trị viên máy chủ không đọc được tài liệu.
- Danh mục riêng của từng hệ thống và quy trình đồng bộ có duyệt với danh mục chung.
- Chế độ mobile độc lập hoàn toàn không cần máy chủ.
- Sổ thu–chi đầy đủ, tài khoản tiền, thu nhập và chuyển khoản.

Kế hoạch nghiệp vụ chi tiết nằm trong thư mục [`docs`](./docs).

## Kiến trúc và công nghệ

Đây là monorepo sử dụng pnpm workspace và Turborepo.

| Thành phần | Công nghệ |
| --- | --- |
| Web và API | Next.js, React, TypeScript |
| Mobile | Expo, React Native, Expo Router |
| Cơ sở dữ liệu | PostgreSQL |
| ORM và migration | Drizzle ORM, Drizzle Kit |
| Xác thực | Better Auth |
| Lưu tệp hiện tại | Cloudinary |
| Kiểm tra dữ liệu | Zod |
| Mã dùng chung | `@qlts/domain`, `@qlts/validation` |

### Cấu trúc thư mục

```text
qlts/
├── apps/
│   ├── web/                 # Next.js, giao diện web và REST API
│   └── mobile/              # Ứng dụng Expo React Native
├── packages/
│   ├── domain/              # Hằng số và kiểu nghiệp vụ dùng chung
│   └── validation/          # Schema kiểm tra dữ liệu dùng chung
├── docs/                    # Kế hoạch sản phẩm và tài liệu kiến trúc
├── compose.yaml             # PostgreSQL cho môi trường local
└── turbo.json               # Cấu hình tác vụ monorepo
```

## Yêu cầu môi trường

- Node.js tương thích với Next.js 16 và Expo 57.
- pnpm 11.
- PostgreSQL 17 hoặc một PostgreSQL tương thích.
- Docker và Docker Compose nếu muốn chạy PostgreSQL bằng container.
- Tài khoản Cloudinary để sử dụng chức năng tải tệp hiện tại.

## Cài đặt

### 1. Cài dependency

```bash
pnpm install
```

### 2. Khởi động PostgreSQL local

Sao chép file cấu hình mẫu ở thư mục gốc:

```bash
cp .env.example .env
docker compose up -d postgres
```

Trên PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
```

### 3. Cấu hình web và API

Tạo `apps/web/.env.local` từ `apps/web/.env.example`, sau đó cập nhật các giá trị:

```env
DATABASE_URL=postgresql://qlts:mat-khau@localhost:5432/qlts
DATABASE_POOL_MAX=10
BETTER_AUTH_SECRET=chuoi-bi-mat-ngau-nhien-toi-thieu-32-ky-tu
BETTER_AUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=ten-cloud
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
ADMIN_EMAILS=admin@example.com
```

Không commit `.env`, `.env.local` hoặc khóa bí mật lên Git.

### 4. Chạy migration

```bash
pnpm db:migrate
```

### 5. Khởi động web

```bash
pnpm dev:web
```

Mặc định web và API chạy tại `http://localhost:3000`.

### 6. Tạo administrator và seed danh mục

1. Đăng ký tài khoản có email nằm trong `ADMIN_EMAILS`.
2. Chạy:

```bash
pnpm --filter @qlts/web db:seed:catalog
```

Script chỉ thêm các mục còn thiếu và không tạo trùng danh mục đã có.

### 7. Cấu hình và chạy mobile

Tạo `apps/mobile/.env` từ `apps/mobile/.env.example`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Khi chạy trên điện thoại thật, dùng IP LAN, tên miền HTTPS hoặc địa chỉ VPN của máy chạy web/API; không dùng `localhost`.

```bash
pnpm dev:mobile
```

## Các lệnh thường dùng

| Lệnh | Mục đích |
| --- | --- |
| `pnpm dev` | Chạy các ứng dụng ở chế độ phát triển |
| `pnpm dev:web` | Chạy web và API |
| `pnpm dev:mobile` | Chạy Expo |
| `pnpm build` | Build toàn bộ monorepo |
| `pnpm typecheck` | Kiểm tra TypeScript |
| `pnpm lint` | Kiểm tra lint |
| `pnpm db:generate` | Tạo migration Drizzle từ schema |
| `pnpm db:migrate` | Áp dụng migration vào PostgreSQL |
| `pnpm db:studio` | Mở Drizzle Studio |

## Tự triển khai

Mục tiêu của Gia Sản là cho phép người dùng tự cài toàn bộ hệ thống trên máy tính, NAS hoặc VPS. Ở phiên bản hiện tại:

- Web, API và PostgreSQL có thể tự triển khai.
- Mobile kết nối tới cùng API qua `EXPO_PUBLIC_API_URL`.
- Nội dung tệp hiện dùng Cloudinary, còn PostgreSQL chỉ lưu metadata.
- Backend lưu trữ tệp cục bộ hoặc S3-compatible và mobile hoạt động độc lập là các bước phát triển sau.

## Tài liệu

- [Kế hoạch sản phẩm](./docs/ke-hoach-san-pham.md)
- [Kiến trúc kỹ thuật](./docs/kien-truc-ky-thuat.md)
- [Thiết kế MVP và luồng thêm tài sản](./docs/thiet-ke-mvp-so-do-man-hinh-va-luong-them-tai-san-dau-tien.md)

## Trạng thái dự án

Dự án đang trong giai đoạn MVP và tiếp tục được hoàn thiện đồng thời về nghiệp vụ, web và mobile. API, schema dữ liệu và giao diện có thể còn thay đổi trước phiên bản ổn định đầu tiên.


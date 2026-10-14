# Kiến trúc kỹ thuật

## Quyết định đã chốt

- Web sử dụng Next.js với App Router và TypeScript.
- Ứng dụng mobile sử dụng React Native với Expo và TypeScript.
- Mã nguồn được tổ chức theo monorepo bằng pnpm workspace và Turborepo.
- API của MVP được đặt trong ứng dụng Next.js dưới `/api/v1`.
- Web và mobile dùng chung kiểu dữ liệu và quy tắc nghiệp vụ qua các package nội bộ.
- Hệ thống phải có khả năng tự triển khai trên NAS, VPS hoặc máy tính.
- PostgreSQL được truy cập qua Drizzle ORM và trình điều khiển `pg`.
- Chuỗi kết nối cơ sở dữ liệu chỉ được đọc từ biến môi trường phía server.
- Xác thực email và mật khẩu sử dụng Better Auth với session lưu trong PostgreSQL.

## Cấu trúc dự án

```text
qlts/
├── apps/
│   ├── web/                 Next.js, API MVP và schema Drizzle
│   └── mobile/              React Native với Expo
├── packages/
│   └── domain/              Kiểu dữ liệu và hằng số nghiệp vụ dùng chung
├── docs/                    Tài liệu sản phẩm và kỹ thuật
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

Các package về kiểm tra dữ liệu, API client và cấu hình sẽ chỉ được tạo khi bắt đầu có nhu cầu thực tế, tránh dựng trước cấu trúc chưa sử dụng.

## Nguyên tắc API

- Mobile và các hệ thống tích hợp gọi API HTTP có phiên bản.
- Server Actions không phải giao diện nghiệp vụ duy nhất.
- Điểm kiểm tra trạng thái đầu tiên là `GET /api/v1/status`.
- API trạng thái kiểm tra kết nối PostgreSQL nhưng không trả về chuỗi kết nối hoặc lỗi nội bộ.
- Hợp đồng API sẽ được tách thành API client dùng chung khi bắt đầu triển khai nghiệp vụ tài sản.

## Nguyên tắc chia sẻ mã nguồn

Được dùng chung:

- Kiểu dữ liệu.
- Schema kiểm tra dữ liệu.
- Quy tắc nghiệp vụ.
- API client.
- Quy ước lỗi, ngày giờ, tiền tệ và đơn vị.
- Design token cơ bản.

Không cố dùng chung toàn bộ component giao diện vì web dùng React DOM còn mobile dùng React Native.

## Cấu hình PostgreSQL

Ứng dụng Next.js sử dụng các biến phía server:

```env
DATABASE_URL=postgresql://qlts:mat-khau@localhost:5432/qlts
DATABASE_POOL_MAX=10
BETTER_AUTH_SECRET=chuoi-ngau-nhien-toi-thieu-32-ky-tu
BETTER_AUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=ten-cloud
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
ADMIN_EMAILS=admin@example.com
```

Không được thêm tiền tố `NEXT_PUBLIC_` vào biến kết nối cơ sở dữ liệu. Trình duyệt và ứng dụng mobile chỉ gọi API, không kết nối trực tiếp tới PostgreSQL.

Docker Compose sử dụng các biến:

```env
POSTGRES_DB=qlts
POSTGRES_USER=qlts
POSTGRES_PASSWORD=mat-khau
POSTGRES_PORT=5432
```

Các file mẫu được phép lưu trong mã nguồn. `.env` và `.env.local` chứa cấu hình thực tế bị loại khỏi Git.

Các lệnh cơ sở dữ liệu:

```bash
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm --filter @qlts/web db:seed:catalog
```

Seed danh mục chung lấy người tạo từ tài khoản đầu tiên khớp `ADMIN_EMAILS`, thêm các linh kiện/vật tư phổ biến và có thể chạy lại mà không tạo bản ghi trùng theo tên, nhóm và mã linh kiện.

Schema hiện tại gồm người dùng, xác thực, không gian, thành viên, tài sản, tài liệu, lịch sử tài sản, danh mục linh kiện và lịch sử dùng tiền.

## Đăng ký và không gian cá nhân

- Tên hiển thị, email và mật khẩu là thông tin bắt buộc khi đăng ký.
- Mật khẩu có tối thiểu 8 và tối đa 128 ký tự.
- Mỗi tài khoản có đúng một Không gian cá nhân.
- Không gian cá nhân được tạo tự động sau khi tài khoản được tạo.
- Việc khởi tạo không gian là idempotent; lần truy cập đầu tiên sẽ tự bổ sung nếu quá trình đăng ký từng bị gián đoạn.
- Người đăng ký trở thành `owner` của Không gian cá nhân.
- Web và mobile không tự xử lý hoặc lưu mật khẩu; cả hai sử dụng API xác thực.
- Mobile sử dụng plugin Expo của Better Auth; cookie và session được lưu bằng SecureStore, không dùng AsyncStorage cho thông tin xác thực.
- Mobile gửi cookie lấy từ SecureStore trong header khi gọi API nghiệp vụ.
- Địa chỉ máy chủ mobile được cấu hình bằng `EXPO_PUBLIC_API_URL`; đây là địa chỉ API công khai, không chứa bí mật.

## Luồng tài sản đầu tiên

- Chỉ tên tài sản là bắt buộc khi tạo mới.
- Loại mặc định là `Khác` và trạng thái mặc định là `Đang sử dụng`.
- Người tạo được ghi nhận là chủ sở hữu, tỷ lệ sở hữu để trống.
- Tài sản được thêm vào Không gian cá nhân hiện hành và không gian này là không gian quản lý gốc.
- Ngày mua ở tương lai chỉ hiển thị cảnh báo, không chặn lưu.
- Giá mua âm bị từ chối.
- Chưa tự tạo sự kiện `Mua tài sản`; quy tắc này cần được chốt khi triển khai lịch sử tài sản.
- Web sử dụng `GET /api/v1/assets`, `POST /api/v1/assets` và `PATCH /api/v1/assets/:id`; mobile sẽ dùng lại các API này.
- Danh sách hỗ trợ tìm theo tên, hãng, model hoặc số serial và lọc theo loại, trạng thái.
- Thông tin mua gồm nơi mua, địa chỉ, số điện thoại người bán, hình thức thanh toán và mã đơn hàng.
- Ảnh và giấy tờ được tải lên Cloudinary dưới dạng `authenticated`; PostgreSQL chỉ lưu metadata và định danh Cloudinary.
- Link tải giấy tờ có thời hạn 5 phút và chỉ được tạo sau khi kiểm tra quyền truy cập tài sản.
- MVP giới hạn mỗi tệp ở 10 MB và chấp nhận JPEG, PNG, WebP hoặc PDF.
- Cơ chế này chưa phải mã hóa đầu cuối; quản trị viên Cloudinary hoặc người giữ API secret vẫn có khả năng truy cập tệp.
- Lịch sử tài sản gồm sử dụng, bảo trì/bảo dưỡng, sửa chữa, thay thế linh kiện/vật tư, nâng cấp, kiểm định, sự cố và ghi chú khác.
- Mỗi sự kiện có thể chứa nhiều linh kiện hoặc vật tư với số lượng, đơn vị, đơn giá, mã linh kiện, ngày hết hạn bảo hành và ghi chú riêng.
- Tên và mã linh kiện do người dùng nhập được giữ nguyên như dữ liệu lịch sử; giai đoạn sau có thể liên kết chúng với một danh mục chuẩn mà không sửa bản ghi gốc.
- Tổng chi phí sự kiện được tính từ tiền công, chi phí khác và tổng chi phí linh kiện/vật tư; không lưu thêm một cột tổng dư thừa.
- Có thể ghi chỉ số sử dụng kèm đơn vị và ngày bảo trì tiếp theo.
- Tìm kiếm tài sản đi sâu vào tiêu đề/mô tả lịch sử, đơn vị/địa điểm thực hiện và tên, mã, ghi chú linh kiện hoặc vật tư.
- `/assets` mặc định thu gọn lịch sử; khi từ khóa khớp trong lịch sử, sự kiện tương ứng tự mở và nội dung khớp được tô đậm.
- Lịch sử đã tạo có thể chỉnh sửa cùng toàn bộ danh sách linh kiện/vật tư.
- Administrator giai đoạn đầu được xác định bằng danh sách email trong `ADMIN_EMAILS`, phân cách bằng dấu phẩy.
- Administrator quản lý danh mục linh kiện/vật tư dùng chung; mọi người dùng có thể chọn mục chuẩn hoặc tiếp tục nhập tự do.
- Hạng mục lịch sử lưu cả liên kết danh mục và dữ liệu snapshot. Việc chỉnh sửa danh mục không làm thay đổi lịch sử cũ.
- Danh mục riêng theo không gian và luồng gửi đề xuất về danh mục chung có duyệt được để ở phase sau.

## Lịch sử dùng tiền

- API danh sách và tạo khoản chi sử dụng `GET /api/v1/expenses` và `POST /api/v1/expenses`.
- API xem, sửa và đưa vào thùng rác sử dụng `GET`, `PATCH` và `DELETE /api/v1/expenses/:id`.
- Chủ không gian khôi phục bằng `POST /api/v1/expenses/:id/restore` và xóa vĩnh viễn bằng `DELETE /api/v1/expenses/:id/permanent`.
- `expense_transactions` lưu thông tin giao dịch, người tạo, người thanh toán, người sửa cuối, các tổng tiền và thời điểm xóa.
- `expense_items` lưu nhiều mặt hàng hoặc dịch vụ, snapshot tên/danh mục/giá và các liên kết tùy chọn tới danh mục chuẩn, tài sản hoặc sự kiện tài sản.
- Tổng dự kiến được tính phía server từ số lượng, đơn giá, giảm giá và phụ phí. Số thực trả được lưu riêng và dùng cho báo cáo.
- Tìm kiếm khoản chi đi sâu vào tên, danh mục và ghi chú của từng mặt hàng.
- Bản ghi bị xóa mềm có `deleted_at` và `purge_after`; dữ liệu hết hạn 7 ngày được dọn khi truy cập danh sách khoản chi.
- Owner có toàn quyền; manager được tạo, sửa và xóa mềm; viewer chỉ được xem.
- Web đã có timeline, form nhiều mặt hàng, chỉnh sửa và thùng rác. Mobile chưa có màn hình lịch sử dùng tiền.
- Dòng hàng chưa liên kết có thể mở `/assets/new?expenseItemId=:id` để điền sẵn biểu mẫu tài sản từ dữ liệu giao dịch.
- API tạo và sửa khoản chi trả `itemIds` theo đúng thứ tự gửi lên; form dùng ID của nút submit để lưu khoản chi rồi chuyển tới dòng hàng cần tạo tài sản.
- `POST /api/v1/assets` nhận `expenseItemId` tùy chọn, kiểm tra dòng hàng thuộc không gian hiện hành, tạo tài sản và cập nhật `expense_items.linked_asset_id` trong cùng transaction.
- Cập nhật liên kết dùng điều kiện `linked_asset_id IS NULL`; nếu hai yêu cầu chạy đồng thời, yêu cầu thua bị rollback để không tạo tài sản mồ côi.
- Khi sửa khoản chi, các dòng hàng được cập nhật theo ID thay vì xóa và tạo lại. Dòng đã liên kết tài sản không thể bị gỡ liên kết hoặc xóa khỏi giao dịch.
- `expense_items.allocated_amount` lưu phần thực trả được phân bổ cho từng dòng. Phép tính dùng đơn vị nhỏ nhất, dòng cuối hấp thụ sai số để tổng luôn bằng `actual_paid_amount`.
- `expense_items.linked_asset_id` có unique index để một tài sản chỉ có một dòng chi mua hàng làm nguồn.
- Khi sửa khoản chi, cùng transaction cập nhật bản sao ngày mua, giá phân bổ, tiền tệ, nơi mua và thông tin thanh toán trong `assets`.
- API chi tiết tài sản trả `purchaseSource`; web khóa các trường mua và cung cấp liên kết ngược tới khoản chi nguồn.
- Khi khoản chi bị xóa vĩnh viễn, khóa ngoại `set null` không được dùng vì dòng hàng bị xóa theo giao dịch; tài sản vẫn giữ snapshot tài chính cuối cùng và trở thành dữ liệu độc lập.
- Báo cáo chi tiêu chỉ tổng hợp `expense_transactions.actual_paid_amount`; tổng giá mua tài sản là chỉ số riêng, không cộng hai nguồn thành một tổng.

## Khung điều hướng web

- Root layout lấy session, không gian hiện hành và vai trò ở phía server.
- Các trang con đã đăng nhập dùng chung `AppFrame` với aside trên máy tính và thanh điều hướng dưới trên màn hình nhỏ.
- Aside hiển thị không gian, người dùng, vai trò và tự đánh dấu nhóm trang đang hoạt động.
- Trang đăng nhập, đăng ký không hiển thị aside. Trang chủ tiếp tục dùng bố cục tổng quan riêng để tránh lặp aside.
- Các mục hiện có gồm Tổng quan, Tài sản, Lịch sử dùng tiền, Không gian, Chia sẻ, Thùng rác và Danh mục chung đối với administrator.

## Chỉ số trang tổng quan

- `Giá trị tài sản theo giá mua` tổng hợp giá mua hiện hành của các tài sản chưa xóa.
- `Lịch sử đã chi` tổng hợp `actual_paid_amount` của giao dịch chưa xóa, không gồm trạng thái đã hoàn tiền hoặc đã hủy.
- Chi mua tài sản chỉ tổng hợp `expense_items.allocated_amount` của dòng đã có `linked_asset_id`; không cộng lại `assets.purchase_price`.
- Dashboard hiển thị chi mua tài sản của tuần hiện tại, tháng hiện tại, quý hiện tại và năm hiện tại.
- Tuần bắt đầu từ thứ Hai; các kỳ và ngày hiển thị được tính theo múi giờ của không gian.

## Trạng thái triển khai hiện tại

- Đã có ứng dụng Next.js.
- Đã có ứng dụng Expo React Native.
- Mobile đã có Expo Router, đăng nhập/session native, danh sách tìm kiếm, chi tiết, thêm và chỉnh sửa tài sản.
- Mobile đã có thêm/chỉnh sửa lịch sử nhiều linh kiện, chọn danh mục chuẩn và tải ảnh/PDF lên Cloudinary thông qua API server.
- Đã có package domain dùng chung.
- Đã có giao diện tổng quan đại diện trên web và mobile.
- Đã có API kiểm tra trạng thái.
- Đã có cấu hình PostgreSQL, Drizzle ORM và migration có phiên bản.
- Đã có đăng ký, đăng nhập, session và tự tạo Không gian cá nhân.
- Đã có danh sách, tìm kiếm, lọc, thêm mới, chỉnh sửa và trang chi tiết tài sản cơ bản.
- Đã có tải lên, lưu metadata và tải xuống giấy tờ/ảnh qua Cloudinary.
- Đã có dòng thời gian và luồng thêm lịch sử sử dụng, bảo trì, sửa chữa cùng nhiều linh kiện/vật tư.
- Đã có lịch sử dùng tiền trên web với nhiều mặt hàng/dịch vụ, tìm kiếm sâu, chỉnh sửa, phân quyền và thùng rác 7 ngày.
- Đã có aside dùng chung cho các trang con đã đăng nhập và điều hướng mobile tương ứng.

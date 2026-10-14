# Thiết kế MVP: Sơ đồ màn hình và luồng thêm tài sản đầu tiên

Tài liệu này hoàn thiện hai mục đầu của phần 26 trong kế hoạch sản phẩm:

1. Sơ đồ màn hình và điều hướng.
2. Luồng thêm tài sản lần đầu.

Các điểm tự đề xuất vì kế hoạch chưa chốt được đánh dấu `[Đề xuất]` và được tổng hợp ở cuối tài liệu.

## Phần 1. Sơ đồ màn hình và điều hướng

### 1.1. Nguyên tắc điều hướng

- Không gian hiện hành là ngữ cảnh toàn cục. Thanh chọn không gian nằm ở đầu mọi màn hình chính; danh sách tài sản, tổng quan và thành viên đều lọc theo không gian đang chọn.
- Một nút `Thêm` luôn có mặt. Thêm tài sản là hành động thường xuyên nhất nên không nằm sâu trong menu.
- Một bố cục, hai cách hiển thị. Điện thoại dùng thanh tab dưới cùng; máy tính dùng thanh bên trái. Cả hai trỏ tới cùng cấu trúc.
- Các trang con đã đăng nhập dùng chung khung điều hướng; trang đăng nhập và đăng ký không hiển thị thanh bên.
- Chi tiết tài sản là trung tâm. Mọi nội dung liên quan tới một tài sản như sự kiện, giấy tờ, chia sẻ và không gian đều đi vào từ màn hình chi tiết.
- Thao tác nguy hiểm được tách riêng. Xóa, chuyển không gian gốc và thay đổi đồng sở hữu nằm trong khu vực riêng ở cuối màn hình, chỉ hiện khi người dùng có quyền.

### 1.2. Cấu trúc điều hướng chính

#### Điện thoại

Thanh tab dưới:

```text
[ Tổng quan ]  [ Tài sản ]  [ + Thêm ]  [ Chi tiêu ]  [ Khác ]
```

Mục `Khác` chứa:

- Liên kết chia sẻ.
- Thùng rác.
- Không gian và thành viên.
- Loại tài sản và trường.
- Cài đặt.

#### Máy tính

Thanh bên:

```text
Thanh chọn không gian
├── Tổng quan
├── Tài sản
├── Lịch sử dùng tiền
├── Không gian và thành viên
├── Liên kết chia sẻ
├── Thùng rác
├── Loại tài sản và trường
└── Cài đặt
    ├── Tài khoản
    ├── Sao lưu
    └── Xuất dữ liệu
```

### 1.3. Cây màn hình

```text
Chưa đăng nhập
├── Đăng nhập
├── Đăng ký
└── Xem liên kết chia sẻ
    └── Có thể cần mật khẩu

Đã đăng nhập
├── Tổng quan
├── Tài sản
│   ├── Danh sách
│   │   ├── Dạng danh sách hoặc thẻ
│   │   ├── Tìm kiếm
│   │   ├── Lọc
│   │   └── Sắp xếp
│   ├── Thêm tài sản
│   └── Chi tiết tài sản
│       ├── Tab Tổng quan
│       ├── Tab Thông tin
│       │   ├── Nhận dạng
│       │   ├── Mua và sở hữu
│       │   └── Trường tùy chỉnh
│       ├── Tab Lịch sử
│       │   └── Ghi nhận sự kiện
│       │       ├── Loại sự kiện
│       │       ├── Nơi và người thực hiện
│       │       ├── Chi phí
│       │       ├── Linh kiện
│       │       └── Tệp đính kèm
│       ├── Tab Giấy tờ và ảnh
│       │   └── Thêm hoặc xem giấy tờ
│       ├── Tab Liên quan
│       │   ├── Tài sản cha
│       │   ├── Tài sản con
│       │   └── Quan hệ khác
│       ├── Tab Chia sẻ và không gian
│       │   ├── Không gian đang hiển thị tài sản
│       │   └── Thiết lập liên kết chia sẻ
│       └── Khu vực nguy hiểm
│           ├── Đồng sở hữu
│           ├── Chuyển không gian gốc
│           └── Xóa
├── Lịch sử dùng tiền
│   ├── Timeline và tìm kiếm
│   ├── Ghi khoản chi
│   │   ├── Thông tin thanh toán
│   │   ├── Nhiều mặt hàng hoặc dịch vụ
│   │   ├── Liên kết tài sản
│   │   └── Tổng dự kiến và số thực trả
│   ├── Chỉnh sửa khoản chi
│   └── Thùng rác khoản chi
├── Không gian và thành viên
│   ├── Danh sách không gian của tôi
│   ├── Tạo không gian gia đình
│   └── Chi tiết không gian
│       ├── Thành viên
│       ├── Vai trò
│       ├── Tài sản
│       └── Lời mời
├── Liên kết chia sẻ
│   ├── Danh sách đang hoạt động
│   └── Thu hồi
├── Thùng rác
│   ├── Khôi phục
│   └── Xóa vĩnh viễn
├── Loại tài sản và trường
│   ├── Mẫu hệ thống
│   ├── Loại của tôi
│   ├── Sao chép
│   └── Sửa
└── Cài đặt
    ├── Tài khoản
    ├── Sao lưu, khôi phục và xuất dữ liệu
    └── Nhật ký hoạt động
```

### 1.4. Danh mục màn hình

| Mã | Màn hình | Mục đích | Vào từ | Đi tới |
| --- | --- | --- | --- | --- |
| S01 | Đăng nhập / Đăng ký | Xác thực | Mở ứng dụng | S03 hoặc S02 |
| S02 | Tổng quan trống | Dẫn người dùng mới thêm tài sản đầu tiên | S01 | S06 |
| S03 | Tổng quan | Số lượng, tổng giá mua, phân bố theo loại, cập nhật và hoạt động gần đây | Thanh điều hướng | S04, S07 |
| S04 | Danh sách tài sản | Tìm, lọc, sắp xếp, xem dạng danh sách hoặc thẻ | Thanh điều hướng, S03 | S06, S07 |
| S06 | Thêm tài sản | Tạo tài sản theo luồng ở Phần 2 | Nút Thêm, S02, S04 | S07 |
| S07 | Chi tiết tài sản | Trung tâm của mọi thông tin tài sản | S03, S04, S06 | S08 đến S12 |
| S08 | Chỉnh sửa tài sản | Sửa thông tin, dùng lại biểu mẫu của S06 | S07 | S07 |
| S09 | Ghi nhận sự kiện | Mua, bảo trì, sửa chữa, nâng cấp, mượn, chuyển vị trí | S07, tab Lịch sử | S07 |
| S10 | Giấy tờ và ảnh | Thêm, xem giấy tờ và bộ ảnh | S07 | S07 |
| S11 | Thiết lập chia sẻ | Tạo liên kết, chọn phạm vi, mật khẩu và hạn dùng | S07, S13 | S13 |
| S12 | Quản lý không gian của tài sản | Thêm hoặc gỡ tài sản khỏi không gian | S07, S14 | S07 |
| S13 | Liên kết chia sẻ | Xem và thu hồi liên kết đang hoạt động | Thanh điều hướng | S11 |
| S14 | Không gian và thành viên | Danh sách không gian, tạo không gian, mời và đổi vai trò | Thanh điều hướng | S12 |
| S15 | Thùng rác | Khôi phục hoặc xóa vĩnh viễn, hiển thị số ngày còn lại | Thanh điều hướng | S07 |
| S16 | Loại tài sản và trường | Quản lý mẫu và trường tùy chỉnh | Thanh điều hướng, S06 | S06 |
| S17 | Cài đặt | Tài khoản, sao lưu, xuất dữ liệu và nhật ký | Thanh điều hướng | Các màn hình con |
| S18 | Trang chia sẻ công khai | Người nhận xem phạm vi dữ liệu được chia sẻ | Liên kết bên ngoài | Không có |
| S19 | Lịch sử dùng tiền | Timeline, tìm kiếm và tổng số thực trả | Thanh điều hướng | S20, S21 |
| S20 | Thêm hoặc sửa khoản chi | Ghi một giao dịch có nhiều mặt hàng hoặc dịch vụ | S19 | S19 |
| S21 | Thùng rác khoản chi | Khôi phục hoặc xóa vĩnh viễn theo quyền | S19, thanh điều hướng | S19 |

> Ghi chú: mã `S05` đang được để trống trong danh mục nguồn và chưa được gán cho màn hình nào.

### 1.5. Quy tắc hiển thị theo quyền

- Người xem không thấy nút `Thêm`, `Sửa`, `Ghi nhận sự kiện`; các phần Giá và Giấy tờ chỉ hiện khi có quyền tương ứng.
- Người quản lý thấy đầy đủ chức năng chỉnh sửa nhưng không thấy khu vực nguy hiểm của không gian quản lý gốc.
- Chủ không gian thấy toàn bộ chức năng theo phạm vi được phép.
- Với khoản chi, người quản lý được tạo, sửa và đưa vào thùng rác; chỉ chủ không gian được khôi phục hoặc xóa vĩnh viễn; người xem chỉ được xem.
- Khi tài sản được xem từ một không gian không phải không gian gốc, màn hình chi tiết hiển thị nhãn `Quản lý gốc: [tên không gian]` để giải thích vì sao một số thao tác bị ẩn.

## Phần 2. Luồng thêm tài sản lần đầu

### 2.1. Phạm vi

`Lần đầu` là lúc người dùng mới chưa có tài sản nào. Biểu mẫu thêm tài sản được dùng chung cho mọi lần sau, chỉ khác phần dẫn dắt ban đầu.

Mục tiêu là giúp người dùng tạo tài sản đầu tiên trong chưa đầy một phút, sau đó mới mời họ bổ sung chi tiết.

### 2.2. Điều kiện tiên quyết

- `[Đề xuất]` Khi đăng ký, hệ thống tự tạo Không gian cá nhân để người dùng không phải tạo không gian trước khi thêm tài sản.
- Không gian cá nhân tự động trở thành không gian quản lý gốc của tài sản đầu tiên.
- Tiền tệ và múi giờ lấy từ không gian, mặc định theo thiết lập tài khoản.

### 2.3. Sơ đồ luồng

```text
Đăng ký hoặc đăng nhập lần đầu
        │
        ▼
Tổng quan trống (S02)
"Thêm tài sản đầu tiên"
        │
        ▼
Bước 1: Chọn loại tài sản
Xe cộ | Máy móc | Đồ điện tử | Nội thất | Đồ gia dụng | Khác
        │
        ▼
Bước 2: Biểu mẫu thêm tài sản
Bắt buộc: Tên
Tùy chọn:
├── Ảnh
├── Nhận dạng
├── Mua và sở hữu
├── Vị trí và trạng thái
└── Ghi chú và nhãn
        │
        ├── [Lưu] ────────────────────────────┐
        │                                     ▼
        │                         Chi tiết tài sản (S07)
        │                         └── Thẻ Hoàn thiện hồ sơ
        │
        └── [Lưu và thêm tài sản khác]
                              │
                              └── Quay lại Bước 1
```

### 2.4. Bước 1: Chọn loại tài sản

- Hiển thị lưới các mẫu hệ thống: Xe cộ, Máy móc, Đồ điện tử, Nội thất, Đồ gia dụng và `Khác`.
- Mỗi ô có biểu tượng, tên và một dòng mô tả ngắn.
- Chọn `Khác` sử dụng bộ trường chung cơ bản.
- Người dùng có thể tạo loại riêng sau tại S16, không chặn luồng đầu tiên.
- Người dùng có thể bấm `Chọn sau`; hệ thống lưu tài sản với loại `Khác` và cho phép đổi loại sau.

### 2.5. Bước 2: Biểu mẫu thêm tài sản

Biểu mẫu được chia thành các nhóm. Chỉ nhóm đầu mở sẵn, các nhóm còn lại thu gọn.

| Nhóm | Trường | Bắt buộc |
| --- | --- | --- |
| Cơ bản | Tên tài sản, ảnh đại diện | Chỉ Tên |
| Nhận dạng | Hãng, dòng sản phẩm, model, số sê-ri, màu sắc, năm sản xuất, trường riêng theo loại | Không |
| Mua và sở hữu | Ngày mua, nơi mua hoặc người bán, giá mua và tiền tệ, phương thức thanh toán, mới hay đã qua sử dụng, hạn bảo hành, chủ sở hữu | Không |
| Vị trí và trạng thái | Vị trí lưu giữ, trạng thái | Không |
| Ghi chú | Mô tả, ghi chú nguồn gốc, nhãn tìm kiếm | Không |

Trường nổi bật theo loại:

| Loại | Trường nổi bật |
| --- | --- |
| Xe cộ | Biển số, số khung, số máy, năm sản xuất, số công-tơ-mét |
| Máy móc | Hãng, model, số sê-ri, số giờ vận hành |
| Đồ điện tử | Hãng, model, số sê-ri, thông số kỹ thuật |
| Nội thất, đồ gia dụng | Kích thước, màu sắc, chất liệu |
| Khác | Chỉ trường chung |

### 2.6. Giá trị mặc định

| Thông tin | Giá trị mặc định |
| --- | --- |
| Trạng thái | Đang sử dụng |
| Không gian hiển thị | Không gian hiện hành |
| Không gian quản lý gốc | Không gian hiện hành |
| Chủ sở hữu | Người đang tạo, tỷ lệ sở hữu để trống |
| Tiền tệ | Tiền tệ của không gian |
| Chia sẻ | Không chia sẻ, dữ liệu riêng tư |

### 2.7. Quy tắc kiểm tra dữ liệu

Các lỗi chặn lưu:

- Tên để trống.
- Giá mua là số âm.
- Hạn bảo hành sớm hơn ngày mua.

Các trường hợp chỉ cảnh báo, không chặn lưu:

- Ngày mua ở tương lai.
- Số sê-ri hoặc biển số trùng với tài sản khác trong cùng không gian. Cảnh báo hiển thị liên kết tới tài sản trùng để người dùng tự quyết định.

Quy tắc chung:

- Lỗi hoặc cảnh báo hiển thị ngay tại trường, không đợi tới lúc bấm `Lưu`.
- Tỷ lệ sở hữu để trống không bị coi là lỗi.

### 2.8. Ảnh và tệp trong lúc thêm

- Trên điện thoại, nút ảnh cho phép chọn `Chụp ảnh` hoặc `Chọn từ thư viện`.
- Ảnh được tải lên song song và hiển thị tiến trình.
- Người dùng có thể lưu tài sản khi ảnh đang tải.
- Nếu một ảnh tải lỗi, tài sản vẫn được lưu; ảnh lỗi hiển thị nhãn `Thử lại` trên màn hình chi tiết.
- Mỗi tệp được tính checksum khi lưu theo yêu cầu của kế hoạch sản phẩm.

### 2.9. Sau khi lưu

- Chuyển tới chi tiết tài sản S07.
- Hiển thị thông báo ngắn `Đã thêm tài sản`.
- Hiển thị thẻ `Hoàn thiện hồ sơ` liệt kê các nhóm còn trống như ảnh, giấy tờ, thông tin mua và vị trí.
- Mỗi mục trong thẻ mở thẳng đúng nhóm trong biểu mẫu chỉnh sửa.
- Người dùng có thể đóng thẻ và thẻ không hiện lại cho tài sản đó.
- Từ lần thứ hai trở đi, người dùng không qua màn hình tổng quan trống mà vào thẳng Bước 1 từ nút `Thêm`.

### 2.10. Các trường hợp đặc biệt

| Tình huống | Cách xử lý |
| --- | --- |
| Người dùng thoát giữa chừng | Tự lưu bản nháp trên thiết bị; lần sau hiển thị `Tiếp tục tài sản đang nhập dở` |
| Mất kết nối khi lưu | Giữ nguyên dữ liệu trên màn hình, báo lỗi và cho thử lại; không làm mất nội dung đã nhập |
| Người xem cố vào màn hình Thêm | Không hiển thị nút Thêm; nếu truy cập trực tiếp bằng đường dẫn thì chuyển về danh sách |
| Người dùng chưa chọn loại | Lưu với loại `Khác`, cho phép đổi loại sau; giữ lại các giá trị của trường trùng khớp |
| Đổi loại sau khi đã nhập | Giữ trường chung; cảnh báo rằng trường riêng của loại cũ sẽ bị ẩn nhưng không bị xóa |

### 2.11. Nội dung cố ý để ngoài luồng đầu tiên

Để giữ luồng ngắn, các việc sau không xuất hiện khi thêm tài sản đầu tiên:

- Thêm đồng sở hữu và tỷ lệ.
- Gắn tài sản cha hoặc con.
- Đưa tài sản vào nhiều không gian.
- Tạo liên kết chia sẻ.
- Thêm giấy tờ có nhiều tệp.

Tất cả các chức năng này có lối vào từ màn hình chi tiết tài sản.

## Phần 3. Các điểm cần xác nhận

1. `[Đề xuất]` Tự tạo Không gian cá nhân khi đăng ký. Nếu không áp dụng, luồng đầu tiên cần thêm một bước tạo không gian.
2. `[Đề xuất]` Chỉ bắt buộc trường Tên. Kế hoạch đã cho phép lưu ít thông tin nhưng chưa chốt trường tối thiểu.
3. Khi người dùng nhập ngày mua, có tự tạo sự kiện `Mua tài sản` trên dòng thời gian hay không. Đề xuất hiện tại là tự tạo để dòng thời gian không trống, đồng thời phải tránh tạo trùng khi người dùng sửa ngày mua sau này.
4. Có cung cấp danh sách tài sản `Tất cả không gian` hay không. Nếu có, hệ thống phải khử trùng lặp vì một tài sản có thể thuộc nhiều không gian.
5. Trên điện thoại, `Liên kết chia sẻ` và `Thùng rác` hiện được đặt trong mục `Khác` vì ít dùng hơn tài sản. Nếu đưa Chia sẻ lên thanh tab chính thì phải thay thế một mục hiện tại.

## Phần 4. Nội dung thiết kế tiếp theo

Hai nội dung tiếp theo cần thiết kế:

1. Luồng thêm sự kiện bảo trì hoặc sửa chữa tại S09.
2. Luồng tạo không gian gia đình tại S14.


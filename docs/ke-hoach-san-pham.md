# Kế hoạch sản phẩm quản lý tài sản cá nhân và gia đình

## 1. Mục đích tài liệu

Tài liệu này tổng hợp các quyết định sản phẩm và mô hình nghiệp vụ đã thống nhất cho ứng dụng quản lý tài sản.

Tài liệu vừa ghi nhận kế hoạch dài hạn, vừa phản ánh các nghiệp vụ đã chốt và trạng thái triển khai hiện tại của sản phẩm.

## 2. Tầm nhìn sản phẩm

Ứng dụng giúp cá nhân quản lý toàn bộ vòng đời tài sản của mình và có thể mở rộng thành không gian quản lý chung cho gia đình.

Người dùng có thể biết:

- Đang sở hữu những tài sản nào.
- Tài sản được mua khi nào, ở đâu và với giá bao nhiêu.
- Thông tin nhận dạng, thông số và tình trạng của tài sản.
- Tài sản có những ảnh, hóa đơn, giấy bảo hành và giấy tờ nào.
- Tài sản đã được bảo trì, bảo dưỡng, sửa chữa hoặc nâng cấp ra sao.
- Công việc được thực hiện ở đâu, bởi ai và với chi phí bao nhiêu.
- Tài sản thuộc không gian nào và những ai đang đồng sở hữu.

Sản phẩm được định hướng theo nguyên tắc ưu tiên quyền riêng tư. Dữ liệu mặc định không công khai; người dùng chủ động lựa chọn người được xem, nội dung được xem và nơi lưu dữ liệu.

## 3. Đối tượng sử dụng

### 3.1. Cá nhân

- Quản lý tài sản riêng.
- Tự triển khai hệ thống nếu không muốn sử dụng dịch vụ công cộng.
- Chia sẻ có kiểm soát một tài sản cho người khác xem.

### 3.2. Gia đình

- Nhiều thành viên cùng tham gia một không gian.
- Cùng quản lý tài sản chung.
- Một tài sản có thể có nhiều người đồng sở hữu.
- Thành viên được cấp quyền theo vai trò trong không gian.

## 4. Các nhóm tài sản chính

Phiên bản đầu tập trung vào:

- Xe cộ.
- Máy móc.
- Đồ điện tử.
- Nội thất.
- Đồ gia dụng.
- Các loại tài sản khác do người dùng tự định nghĩa.

## 5. Nguyên tắc thiết kế sản phẩm

- Dữ liệu riêng tư theo mặc định.
- Người dùng sở hữu và có thể xuất dữ liệu của mình.
- Có thể tự cài đặt trên NAS, VPS hoặc máy tính.
- Web sử dụng tốt trên cả máy tính và điện thoại.
- Cấu trúc dữ liệu cho phép mở rộng cho gia đình, ứng dụng điện thoại, đồng bộ và mã hóa trong tương lai.
- Không đưa các nghiệp vụ phức tạp của giai đoạn sau vào MVP.

## 6. Mô hình không gian quản lý

Hệ thống tổ chức dữ liệu theo `Không gian`.

Các loại không gian ban đầu:

- Không gian cá nhân.
- Không gian gia đình.

Một người có thể tham gia nhiều không gian. Mỗi không gian có:

- Tên và loại không gian.
- Thành viên.
- Vai trò của từng thành viên.
- Thiết lập tiền tệ và múi giờ.
- Danh sách tài sản được hiển thị trong không gian.

### 6.1. Một tài sản thuộc nhiều không gian

Một tài sản có thể xuất hiện trong nhiều không gian cùng lúc nhưng vẫn là một bản ghi duy nhất trong cùng một máy chủ.

Ví dụ, một chiếc xe có thể đồng thời xuất hiện trong:

- Không gian cá nhân của một thành viên.
- Không gian gia đình.
- Một không gian quản lý thiết bị riêng.

Khi thông tin tài sản được cập nhật, các không gian có quyền truy cập sẽ nhìn thấy cùng dữ liệu mới nhất.

Mỗi tài sản có một `Không gian quản lý gốc`. Không gian này kiểm soát các thao tác quan trọng như quyền sở hữu, chia sẻ, xóa và chuyển quyền quản lý.

Quan hệ tài sản với không gian được lưu riêng, không đặt một `space_id` duy nhất trực tiếp trên tài sản.

### 6.2. Giới hạn giữa các máy chủ

Việc một tài sản xuất hiện trong nhiều không gian chỉ áp dụng khi các không gian nằm trên cùng một hệ thống và cơ sở dữ liệu.

Hai máy chủ tự triển khai độc lập không cùng tham chiếu trực tiếp đến một bản ghi tài sản. Việc chuyển hoặc đồng bộ tài sản giữa các máy chủ thuộc giai đoạn sau.

## 7. Thành viên và phân quyền

Các vai trò ban đầu:

| Vai trò | Quyền mặc định |
| --- | --- |
| Chủ không gian | Quản lý thành viên, cấu hình, tài sản, tài liệu và chia sẻ |
| Người quản lý | Xem, thêm, sửa tài sản, lịch sử và tài liệu |
| Người xem | Chỉ xem nội dung được phép |

Khi tài sản được thêm vào một không gian, thành viên kế thừa quyền theo vai trò của họ trong không gian đó.

Nếu một người nhận quyền từ nhiều không gian có cùng tài sản, hệ thống áp dụng quyền cao nhất mà họ được cấp, nhưng không vượt qua giới hạn bảo vệ của không gian quản lý gốc.

Các nhóm quyền cần được tách biệt:

- Xem thông tin chung.
- Chỉnh sửa thông tin.
- Xem giá và chi phí.
- Xem tài liệu.
- Tải tài liệu.
- Quản lý lịch sử.
- Quản lý chia sẻ.
- Quản lý quyền sở hữu.
- Xóa tài sản.

Một số thao tác chỉ thuộc không gian quản lý gốc:

- Thay đổi đồng sở hữu.
- Chuyển không gian quản lý gốc.
- Xóa hoặc xóa vĩnh viễn tài sản.
- Quản lý các tài liệu được đánh dấu nhạy cảm.

Quyền sở hữu và quyền thao tác là hai khái niệm độc lập. Một người có thể là đồng sở hữu nhưng chỉ có quyền xem; một người không sở hữu vẫn có thể được giao quyền quản lý.

## 8. Mô hình tài sản

### 8.1. Thông tin chung

Mỗi tài sản có thể lưu:

- Tên tài sản.
- Loại tài sản.
- Trạng thái.
- Vị trí lưu giữ.
- Mô tả và ghi chú.
- Ảnh đại diện và bộ ảnh.
- Nhãn tìm kiếm.
- Mã tài sản hoặc mã QR do hệ thống tạo trong tương lai.

### 8.2. Thông tin nhận dạng

Tùy từng loại tài sản, hệ thống có thể lưu:

- Hãng và dòng sản phẩm.
- Model.
- Số sê-ri.
- Biển số, số khung và số máy đối với xe.
- Màu sắc, kích thước và thông số kỹ thuật.
- Năm sản xuất.

### 8.3. Thông tin mua và sở hữu

- Ngày mua.
- Nơi mua hoặc người bán.
- Giá mua và đơn vị tiền tệ.
- Phương thức thanh toán.
- Tình trạng khi mua: mới hoặc đã qua sử dụng.
- Thời hạn bảo hành.
- Chủ sở hữu.
- Ghi chú nguồn gốc.

### 8.4. Trạng thái tài sản

Bộ trạng thái ban đầu:

- Đang sử dụng.
- Đang lưu kho.
- Đang cho mượn.
- Đang bảo trì hoặc sửa chữa.
- Ngừng sử dụng.
- Đã bán.
- Đã cho hoặc chuyển nhượng.
- Đã mất.
- Đã thanh lý.

Trạng thái không thay thế lịch sử. Khi thay đổi quan trọng xảy ra, hệ thống vẫn tạo hoặc cho phép tạo một sự kiện tương ứng trong dòng thời gian.

## 9. Loại tài sản và trường tùy chỉnh

Hệ thống cung cấp các mẫu loại tài sản phổ biến. Người dùng có thể:

- Tạo loại tài sản mới.
- Sao chép cấu trúc từ loại có sẵn.
- Đặt tên, biểu tượng và màu nhận diện.
- Thêm và sắp xếp các trường thông tin riêng.
- Ẩn hoặc vô hiệu hóa trường không còn sử dụng.

Không sửa trực tiếp mẫu hệ thống. Khi cần thay đổi, người dùng tạo một bản sao để tránh xung đột khi hệ thống được nâng cấp.

Các kiểu trường tùy chỉnh dự kiến trong MVP:

- Văn bản ngắn.
- Văn bản dài.
- Số.
- Tiền tệ.
- Ngày.
- Có hoặc không.
- Danh sách một lựa chọn.
- Danh sách nhiều lựa chọn.
- Đường dẫn.
- Số kèm đơn vị đo.
- Người hoặc đơn vị liên quan.

Định nghĩa trường được tách khỏi giá trị trường để hỗ trợ kiểm tra dữ liệu, tìm kiếm và lọc.

## 10. Đồng sở hữu

Một tài sản có thể có nhiều chủ sở hữu.

Mỗi quan hệ sở hữu có thể lưu:

- Chủ sở hữu là cá nhân hoặc nhóm gia đình.
- Tỷ lệ sở hữu.
- Ngày bắt đầu sở hữu.
- Ngày kết thúc sở hữu.
- Ghi chú.
- Giấy tờ chứng minh nếu có.

Tỷ lệ sở hữu không bắt buộc nhập.

Quy tắc kiểm tra:

- Nếu tất cả chủ sở hữu đều có tỷ lệ, tổng không được vượt quá 100%.
- Nếu tổng bằng 100%, hiển thị trạng thái đã xác định đầy đủ.
- Nếu tổng dưới 100%, hiển thị trạng thái chưa xác định đầy đủ.
- Nếu có ít nhất một tỷ lệ để trống, không yêu cầu tổng bằng 100%.
- Không dùng tỷ lệ sở hữu để tự động suy ra quyền chỉnh sửa.

## 11. Tài sản cha, tài sản con và tài sản liên quan

Một tài sản có thể gồm nhiều tài sản con.

Ví dụ:

```text
Bộ máy tính
├── Thùng máy
│   ├── Bo mạch chủ
│   ├── CPU
│   ├── RAM
│   └── Ổ cứng
├── Màn hình
├── Bàn phím
└── Chuột
```

Mỗi tài sản con vẫn là một tài sản hoàn chỉnh và có thể có:

- Số sê-ri riêng.
- Ngày mua và giá riêng.
- Hóa đơn và bảo hành riêng.
- Lịch sử sửa chữa riêng.
- Trạng thái và chủ sở hữu riêng.
- Mã nhận dạng riêng.

Các loại quan hệ dự kiến:

- Thành phần của.
- Phụ kiện của.
- Được lắp trong.
- Sử dụng cùng.
- Thay thế cho.

Quy tắc:

- Một tài sản không thể là con của chính nó.
- Không cho phép quan hệ tạo thành vòng lặp.
- Một linh kiện chỉ được lắp trong một tài sản tại cùng thời điểm.
- Gỡ tài sản con không xóa tài sản đó.
- Xóa tài sản cha không tự động xóa tài sản con.
- Quan hệ có thời gian bắt đầu và kết thúc để bảo toàn lịch sử.
- Giá trị bộ tài sản có thể nhập riêng hoặc tính từ thành phần nhưng không được tính trùng cả hai cách.

## 12. Giấy tờ và tệp đính kèm

Các loại giấy tờ có thể gồm:

- Hóa đơn.
- Phiếu bảo hành.
- Hợp đồng mua bán.
- Đăng ký, đăng kiểm hoặc bảo hiểm xe.
- Hướng dẫn sử dụng.
- Tài liệu tùy chỉnh.

Mỗi giấy tờ có thể lưu:

- Loại và tên giấy tờ.
- Số giấy tờ.
- Ngày cấp và ngày hết hạn.
- Nơi cấp.
- Ghi chú.
- Một hoặc nhiều ảnh hay tệp PDF.

Thông tin mô tả giấy tờ và nội dung tệp được tách riêng. Ví dụ, đăng ký xe có thể gồm ảnh mặt trước và mặt sau nhưng vẫn là một giấy tờ.

Tệp không lưu trực tiếp trong PostgreSQL. Hệ thống hỗ trợ:

- Ổ đĩa cục bộ cho máy tính hoặc NAS.
- Kho lưu trữ tương thích S3 cho VPS hoặc dịch vụ quản lý.

Mỗi tệp cần có checksum để phát hiện hỏng dữ liệu và kiểm tra tính toàn vẹn khi sao lưu hoặc khôi phục.

## 13. Lịch sử vòng đời tài sản

Lịch sử được tổ chức thành các sự kiện tài sản dùng chung thay vì các bảng nghiệp vụ hoàn toàn tách biệt.

Các loại sự kiện ban đầu:

- Mua tài sản.
- Bảo trì.
- Bảo dưỡng.
- Sửa chữa.
- Thay linh kiện.
- Nâng cấp.
- Kiểm tra.
- Cho mượn hoặc thu hồi.
- Chuyển vị trí.
- Bán, cho hoặc chuyển nhượng dưới dạng sự kiện ghi nhận.
- Ghi chú khác.

Mỗi sự kiện có thể lưu:

- Tài sản liên quan.
- Loại sự kiện.
- Ngày thực hiện.
- Đơn vị hoặc người thực hiện.
- Địa chỉ thực hiện.
- Nội dung công việc.
- Tình trạng trước và sau.
- Số công-tơ-mét hoặc số giờ vận hành nếu có.
- Ghi chú.
- Ảnh, hóa đơn và tài liệu.
- Nhiều khoản chi phí.
- Nhiều linh kiện được thay hoặc nâng cấp.

Một sự kiện có nhiều khoản chi phí để phản ánh chính xác tiền công, linh kiện và các phí khác.

### 13.1. Lịch sử dùng tiền

Ngoài lịch sử vòng đời tài sản, ứng dụng có một dòng thời gian riêng để người dùng biết mình đã chi tiền cho việc gì, khi nào và ở đâu.

Phạm vi đầu tiên chỉ ghi nhận tiền đã chi. Sổ thu - chi đầy đủ, số dư tài khoản, thu nhập và chuyển tiền giữa các tài khoản thuộc giai đoạn sau.

Mỗi khoản chi thuộc một không gian và có thể lưu:

- Nội dung khoản chi và thời điểm thanh toán.
- Người tạo, người thanh toán và người chỉnh sửa cuối.
- Nơi mua, địa chỉ, số điện thoại, hình thức thanh toán và mã đơn hàng.
- Trạng thái: hoàn tất, hoàn tiền một phần, đã hoàn tiền hoặc đã hủy.
- Một đơn vị tiền tệ cho toàn bộ giao dịch, mặc định lấy từ không gian.
- Ghi chú.
- Nhiều mặt hàng hoặc dịch vụ.

Mỗi mặt hàng hoặc dịch vụ có:

- Tên và danh mục snapshot tại thời điểm ghi nhận.
- Số lượng, đơn vị, đơn giá và giảm giá riêng.
- Liên kết tùy chọn tới danh mục chuẩn.
- Liên kết tùy chọn tới tài sản hoặc sự kiện tài sản.
- Ghi chú.

Mặt hàng hoặc dịch vụ chưa liên kết có thể được dùng làm nguồn tạo một tài sản mới. Trong biểu mẫu tạo hoặc sửa khoản chi, nút `Lưu khoản chi và tạo tài sản` lưu dữ liệu trước rồi mở biểu mẫu tài sản của đúng dòng hàng. Biểu mẫu tài sản được điền sẵn tên, ngày mua, giá của dòng hàng, nơi mua, địa chỉ, số điện thoại, hình thức thanh toán, mã đơn hàng và ghi chú. Người dùng kiểm tra hoặc chỉnh sửa trước khi lưu; sau khi tạo thành công, dòng hàng liên kết ngược tới tài sản mới.

Một dòng hàng chỉ được tạo tối đa một tài sản theo luồng này. Dòng đã liên kết không thể gỡ liên kết hoặc xóa khỏi khoản chi khi chỉnh sửa, nhằm giữ nguồn gốc dữ liệu. Việc xóa khoản chi hoặc tài sản được quản lý độc lập và không tự động xóa đối tượng còn lại.

Hệ thống lưu riêng:

- Tổng tiền hàng trước giảm giá.
- Tổng giảm giá theo mặt hàng.
- Giảm giá chung và phụ phí.
- Tổng dự kiến do hệ thống tính.
- Số tiền thực trả do người dùng xác nhận.

Nếu số thực trả khác tổng dự kiến, hệ thống cảnh báo nhưng không chặn lưu. Báo cáo sử dụng số thực trả. Giao dịch đã hoàn tiền toàn bộ hoặc đã hủy không được tính vào tổng tiền đã chi.

Số thực trả được phân bổ xuống từng dòng theo tỷ trọng giá trị của dòng sau giảm giá riêng. Phần sai số làm tròn được đưa vào dòng cuối để tổng phân bổ luôn bằng chính xác số thực trả. Nếu mọi dòng đều có giá trị bằng 0, số thực trả được chia đều. Giá mua của tài sản tạo từ khoản chi là số được phân bổ này, không phải một khoản chi mới.

Khoản chi là nguồn dữ liệu tài chính gốc. Khi sửa thời điểm, nơi mua, thông tin người bán, hình thức thanh toán, mã đơn hàng, tiền tệ hoặc số tiền của dòng chi, hệ thống đồng bộ lại bản sao thông tin mua trên tài sản liên kết. Tên, loại, trạng thái, vị trí và thông tin nhận dạng của tài sản vẫn được quản lý độc lập.

Trên tài sản đang có nguồn khoản chi, nhóm thông tin mua ở trạng thái chỉ đọc và dẫn tới khoản chi nguồn. Nếu khoản chi bị xóa vĩnh viễn, tài sản giữ bản sao tài chính cuối cùng và các trường này có thể được quản lý trực tiếp trở lại.

Hai chỉ số không được cộng chung:

- `Tổng đã chi` chỉ cộng số thực trả của giao dịch đủ điều kiện.
- `Tổng giá mua tài sản` chỉ cộng giá mua của tài sản.

Khi phân tích chi phí mua tài sản, hệ thống dùng dòng chi đã liên kết, không cộng thêm giá mua từ tài sản lần thứ hai.

Trong MVP, mọi thành viên đều xem được các khoản chi của không gian chung. Quyền thao tác:

| Vai trò | Quyền với khoản chi |
| --- | --- |
| Chủ không gian | Xem, tạo, sửa, đưa vào thùng rác, khôi phục và xóa vĩnh viễn |
| Người quản lý | Xem, tạo, sửa và đưa vào thùng rác |
| Người xem | Chỉ xem |

Khoản chi trong thùng rác được giữ 7 ngày. Việc hoàn tiền dưới dạng giao dịch điều chỉnh riêng và phân quyền chi tiết hơn được để ở phase sau.

## 14. Chia sẻ tài sản

Dữ liệu mặc định là riêng tư. Người dùng có thể chia sẻ một tài sản bằng liên kết có kiểm soát.

Khi tạo liên kết, người dùng lựa chọn nội dung được xem:

- Thông tin chung.
- Thông tin mua.
- Giá mua và tổng chi phí.
- Lịch sử bảo trì, sửa chữa và nâng cấp.
- Ảnh tài sản.
- Giấy tờ.

Quyền tải xuống được cấu hình riêng:

- Cho phép tải ảnh.
- Cho phép tải giấy tờ.

Quyền tải không được bật mặc định.

Các biện pháp bảo vệ:

- Đặt mật khẩu.
- Đặt ngày hết hạn.
- Thu hồi liên kết bất kỳ lúc nào.
- Có thể giới hạn lượt truy cập hoặc tải xuống trong tương lai.
- Ẩn số giấy tờ và thông tin nhạy cảm.
- Không cho công cụ tìm kiếm lập chỉ mục.
- Ghi nhận các hoạt động truy cập quan trọng mà không thu thập thông tin thừa.

## 15. Xóa, gỡ khỏi không gian và khôi phục

Cần phân biệt hai thao tác:

- `Gỡ khỏi không gian`: chỉ xóa quan hệ giữa tài sản và một không gian; tài sản vẫn tồn tại.
- `Xóa tài sản`: đưa toàn bộ tài sản vào thùng rác của không gian quản lý gốc.

Khi xóa tài sản:

- Tài sản biến mất khỏi danh sách thông thường.
- Các quan hệ với không gian khác tạm thời bị ẩn.
- Lịch sử, ảnh và giấy tờ vẫn được giữ nguyên.
- Liên kết chia sẻ bị vô hiệu hóa ngay.
- Người có quyền có thể khôi phục trong vòng 7 ngày.
- Sau 7 ngày, tài sản và tệp liên quan có thể bị xóa vĩnh viễn.

Khi khôi phục:

- Tài sản trở lại các không gian cũ.
- Thành viên nhận lại quyền trước đó.
- Liên kết chia sẻ cũ không tự động hoạt động lại.

Xóa tài sản cha không tự động xóa các tài sản con.

Khoản chi cũng sử dụng thùng rác 7 ngày nhưng tuân theo quyền của không gian: owner và manager được đưa vào thùng rác; chỉ owner được khôi phục hoặc xóa vĩnh viễn. Khoản chi hết hạn được xóa cùng các mặt hàng hoặc dịch vụ của giao dịch.

## 16. Nhật ký hoạt động

Các thao tác quan trọng cần được ghi nhận:

- Thêm hoặc gỡ tài sản khỏi không gian.
- Thay đổi người đồng sở hữu.
- Thay đổi vai trò và quyền thành viên.
- Tạo hoặc thu hồi liên kết chia sẻ.
- Tải giấy tờ qua liên kết chia sẻ.
- Đưa tài sản vào thùng rác.
- Khôi phục hoặc xóa vĩnh viễn.

Nhật ký không lưu mật khẩu, nội dung tệp hoặc dữ liệu bí mật không cần thiết.

## 17. Mô hình dữ liệu khái quát

```text
users
  │
  ├──< space_members >── spaces
  │                         ├──< expense_transactions
  │                         │          └── expense_items
  │                         │
  │                         └──< asset_spaces >── assets
  │                                                  │
  ├──< asset_owners >────────────────────────────────┤
  │                                                  ├── asset_attributes
  │                                                  ├── asset_relations
  │                                                  ├── asset_events
  │                                                  │      ├── event_costs
  │                                                  │      └── event_parts
  │                                                  ├── documents
  │                                                  ├── files
  │                                                  ├── asset_permissions
  │                                                  └── share_links
  │
  └── audit_logs
```

Các nhóm thực thể chính:

| Thực thể | Mục đích |
| --- | --- |
| `users` | Danh tính người dùng |
| `spaces` | Không gian cá nhân hoặc gia đình |
| `space_members` | Thành viên và vai trò trong không gian |
| `asset_types` | Loại tài sản hệ thống hoặc do người dùng tạo |
| `asset_field_definitions` | Định nghĩa trường tùy chỉnh |
| `assets` | Thông tin chung của tài sản |
| `asset_spaces` | Quan hệ nhiều-nhiều giữa tài sản và không gian |
| `asset_owners` | Quan hệ đồng sở hữu |
| `asset_field_values` | Giá trị thuộc tính tùy chỉnh |
| `asset_relations` | Quan hệ tài sản cha, con và liên quan |
| `locations` | Vị trí lưu giữ tài sản |
| `vendors` | Cửa hàng, gara hoặc đơn vị dịch vụ |
| `documents` | Thông tin mô tả giấy tờ |
| `files` | Thông tin tệp vật lý |
| `asset_documents` | Metadata giấy tờ và định danh tệp trên Cloudinary |
| `asset_events` | Lịch sử vòng đời tài sản |
| `asset_event_items` | Linh kiện, vật tư và chi phí từng mục trong sự kiện |
| `catalog_items` | Danh mục linh kiện và vật tư dùng chung |
| `expense_transactions` | Giao dịch chi tiền trong một không gian |
| `expense_items` | Mặt hàng hoặc dịch vụ và dữ liệu snapshot của giao dịch |
| `asset_permissions` | Ngoại lệ quyền trên từng tài sản |
| `share_links` | Liên kết chia sẻ có kiểm soát |
| `audit_logs` | Nhật ký thao tác quan trọng |

Đây mới là mô hình khái quát. Tên bảng, khóa, ràng buộc và chỉ mục sẽ được chốt trong tài liệu thiết kế cơ sở dữ liệu sau khi hoàn thành thiết kế luồng sử dụng.

## 18. Các màn hình dự kiến trong MVP

### 18.1. Tổng quan

- Tổng số tài sản.
- Tổng giá trị theo giá mua.
- Tổng thực trả trong lịch sử dùng tiền.
- Tổng chi mua tài sản đã liên kết trong tuần, tháng, quý và năm hiện tại.
- Phân bố theo loại.
- Tài sản vừa cập nhật.
- Hoạt động gần đây.

### 18.2. Danh sách tài sản

- Hiển thị dạng danh sách hoặc thẻ.
- Tìm kiếm theo tên, model hoặc số sê-ri.
- Lọc theo loại, trạng thái, vị trí và chủ sở hữu.
- Sắp xếp theo ngày mua, giá hoặc ngày cập nhật.

### 18.3. Chi tiết tài sản

- Thông tin tổng quan.
- Thông tin mua và sở hữu.
- Thông số và nhận dạng.
- Tài sản cha, con và liên quan.
- Ảnh và giấy tờ.
- Dòng thời gian lịch sử.
- Tổng chi phí phát sinh.
- Không gian đang hiển thị tài sản.
- Thiết lập chia sẻ.

### 18.4. Thêm hoặc chỉnh sửa tài sản

- Chia biểu mẫu thành các nhóm rõ ràng.
- Cho phép lưu tài sản với ít thông tin rồi bổ sung sau.
- Hiển thị trường theo loại tài sản.
- Cho phép thêm trường tùy chỉnh khi có quyền.

### 18.5. Ghi nhận sự kiện

- Chọn loại sự kiện.
- Ghi nơi và người thực hiện.
- Thêm nhiều khoản chi phí.
- Thêm linh kiện.
- Đính kèm ảnh, hóa đơn và tài liệu.

### 18.6. Lịch sử dùng tiền

- Hiển thị khoản chi theo dòng thời gian.
- Tìm sâu theo nội dung giao dịch, nơi mua, mặt hàng, danh mục và ghi chú.
- Thêm hoặc sửa một giao dịch có nhiều mặt hàng và dịch vụ.
- Liên kết mặt hàng với tài sản.
- Hiển thị tổng dự kiến, số thực trả và cảnh báo chênh lệch.
- Đưa vào thùng rác, khôi phục hoặc xóa vĩnh viễn theo vai trò.

### 18.7. Không gian và thành viên

- Danh sách thành viên.
- Vai trò và quyền.
- Danh sách tài sản trong không gian.
- Thêm hoặc gỡ tài sản khỏi không gian.

### 18.8. Chia sẻ

- Danh sách liên kết đang hoạt động.
- Phạm vi dữ liệu được chia sẻ.
- Quyền tải ảnh và giấy tờ.
- Ngày hết hạn.
- Thu hồi liên kết.

### 18.9. Thùng rác

- Tài sản đã xóa.
- Khoản chi đã xóa.
- Số ngày còn lại trước khi xóa vĩnh viễn.
- Khôi phục hoặc xóa vĩnh viễn nếu có quyền.

## 19. Các chế độ vận hành dài hạn

### 19.1. Máy chủ cá nhân

- Cài trên NAS, VPS hoặc máy tính.
- Dùng PostgreSQL.
- Dùng ổ đĩa cục bộ hoặc kho tương thích S3.
- Web và ứng dụng trong tương lai kết nối tới máy chủ này.

### 19.2. Dịch vụ được quản lý

- Dành cho người không muốn tự vận hành.
- Dùng cùng mã nguồn và tính năng với bản tự triển khai.
- Cho phép xuất toàn bộ dữ liệu để chuyển sang máy chủ riêng.

### 19.3. Chế độ độc lập trên thiết bị

- Dữ liệu lưu trong SQLite trên máy tính hoặc điện thoại.
- Không cần máy chủ và Internet.
- Phù hợp với một người và một thiết bị.

Chế độ độc lập trên điện thoại chưa thuộc MVP. Điện thoại cũng không nên đóng vai trò máy chủ gia đình vì hệ điều hành có thể dừng tiến trình nền.

## 20. Kiến trúc triển khai MVP

MVP ưu tiên web và máy chủ tự cài đặt:

```text
Web responsive
      │
      ▼
API dùng chung
      ├── PostgreSQL
      └── Kho tệp cục bộ hoặc S3
```

Bản tự cài đặt dự kiến được đóng gói bằng Docker Compose, gồm:

- Ứng dụng web và API.
- PostgreSQL.
- Kho tệp cục bộ mặc định.
- Tùy chọn kết nối kho tương thích S3.
- Công cụ sao lưu và khôi phục.
- Cấu hình để sử dụng tên miền và HTTPS.

Web phải responsive để sử dụng tốt trên điện thoại trong thời gian chưa có ứng dụng native.

## 21. Sao lưu, khôi phục và di chuyển dữ liệu

Sao lưu là yêu cầu bắt buộc đối với sản phẩm có khả năng tự triển khai.

Hệ thống cần hỗ trợ:

- Xuất toàn bộ một không gian.
- Khôi phục toàn bộ một không gian.
- Xuất một tài sản cùng lịch sử và tệp liên quan.
- Kiểm tra tính toàn vẹn trước khi khôi phục.
- Chuyển dữ liệu từ dịch vụ quản lý sang máy chủ riêng.

Định dạng gói sao lưu dự kiến:

```text
backup.zip
├── manifest.json
├── dữ liệu có cấu trúc
├── files/
└── checksums.json
```

Không nên chỉ cung cấp bản sao lưu PostgreSQL vì cách đó không thuận tiện cho người dùng phổ thông hoặc việc chuyển giữa các chế độ vận hành.

## 22. Chuẩn bị cho mã hóa trong tương lai

MVP chưa yêu cầu mã hóa đầu cuối để quản trị viên máy chủ không thể đọc tài liệu. Tuy nhiên, thiết kế ban đầu không được cản trở việc bổ sung tính năng này.

Các nguyên tắc cần áp dụng từ đầu:

- Tách metadata khỏi nội dung tệp.
- Dùng mã tệp ngẫu nhiên, không dùng tên giấy tờ làm đường dẫn.
- Không ghi dữ liệu nhạy cảm vào log.
- Không tạo đường dẫn tải công khai tồn tại vĩnh viễn.
- Có trường phiên bản định dạng tệp.
- Có thể thay đổi kho lưu trữ mà không thay đổi nghiệp vụ.
- API có khả năng nhận và trả byte dữ liệu mà không bắt buộc đọc nội dung.

Giai đoạn sau có thể triển khai:

1. Mã hóa ảnh, PDF và giấy tờ trên thiết bị trước khi tải lên.
2. Chia sẻ khóa cho thành viên được cấp quyền.
3. Mã hóa thêm metadata nhạy cảm nếu cần.

## 23. Phạm vi MVP chính thức

MVP bao gồm:

- Tài khoản người dùng.
- Không gian cá nhân và gia đình.
- Thành viên và phân quyền.
- Một tài sản xuất hiện trong nhiều không gian.
- Một không gian quản lý gốc cho mỗi tài sản.
- Quản lý tài sản và thuộc tính linh hoạt.
- Loại tài sản và trường tùy chỉnh.
- Đồng sở hữu, tỷ lệ có thể để trống.
- Tài sản cha, con và liên quan.
- Ảnh, giấy tờ và tệp đính kèm.
- Lịch sử bảo trì, sửa chữa và nâng cấp.
- Nhiều khoản chi phí và linh kiện trong một sự kiện.
- Lịch sử dùng tiền theo dòng thời gian, mỗi giao dịch có nhiều mặt hàng hoặc dịch vụ.
- Tìm kiếm sâu trong giao dịch và liên kết mặt hàng với tài sản.
- Tìm kiếm, lọc và sắp xếp.
- Chia sẻ bằng liên kết có kiểm soát.
- Quyền tải ảnh và giấy tờ là tùy chọn.
- Thùng rác 7 ngày.
- Nhật ký hoạt động quan trọng.
- Sao lưu, khôi phục và xuất dữ liệu.
- Web responsive.
- Máy chủ có thể tự cài trên NAS, VPS hoặc máy tính.
- PostgreSQL và kho tệp cục bộ hoặc S3.

## 24. Ngoài phạm vi MVP

Các nội dung sau được chuyển sang giai đoạn sau:

- Quy trình chuyển nhượng hoàn chỉnh.
- Chuyển quyền tài sản sang chủ mới.
- Tách lịch sử riêng cho chủ cũ và chủ mới.
- Chuyển hoặc đồng bộ tài sản giữa hai máy chủ.
- Ứng dụng điện thoại native.
- Chế độ SQLite độc lập trên điện thoại.
- Đồng bộ ngoại tuyến và xử lý xung đột.
- Mã hóa đầu cuối.
- Nhắc lịch bảo trì và hết hạn giấy tờ.
- OCR hoặc AI đọc hóa đơn và giấy tờ.
- Tính khấu hao và định giá hiện tại.
- Kết nối cửa hàng, gara hoặc hãng bảo hành.
- Sổ thu - chi đầy đủ, quản lý thu nhập, số dư và chuyển tiền.
- Hoàn tiền dưới dạng giao dịch điều chỉnh riêng.
- Phân quyền chi tiết từng khoản chi hoặc từng trường thông tin.

Trong MVP, bán, cho hoặc chuyển nhượng chỉ được ghi nhận như trạng thái và sự kiện lịch sử. Hệ thống chưa chuyển quyền và dữ liệu sang người nhận.

## 25. Lộ trình phát triển dự kiến

### Giai đoạn 1: Hoàn thiện thiết kế

- Chốt thuật ngữ nghiệp vụ.
- Thiết kế các màn hình và luồng sử dụng của MVP.
- Chốt mô hình cơ sở dữ liệu chi tiết.
- Chốt các quy tắc quyền và bảo mật.

### Giai đoạn 2: Xây dựng MVP web

- Xây API và cơ sở dữ liệu.
- Xây quản lý tệp.
- Xây web responsive.
- Hoàn thiện các chức năng quản lý và tra cứu.
- Xây sao lưu và khôi phục.

### Giai đoạn 3: Tự triển khai

- Đóng gói Docker Compose.
- Hỗ trợ NAS, VPS và máy tính.
- Viết hướng dẫn cài đặt, nâng cấp và sao lưu.

### Giai đoạn 4: Ứng dụng và dữ liệu cục bộ

- Xây ứng dụng điện thoại dùng chung API.
- Bổ sung chế độ SQLite độc lập.
- Bổ sung làm việc ngoại tuyến và đồng bộ.

### Giai đoạn 5: Bảo mật và nghiệp vụ mở rộng

- Mã hóa đầu cuối.
- Quy trình chuyển nhượng đầy đủ.
- Nhắc lịch và thông báo.
- OCR hoặc AI.
- Định giá và khấu hao.

## 26. Các nội dung cần thiết kế tiếp

Tài liệu chi tiết đã có: [Thiết kế MVP: Sơ đồ màn hình và luồng thêm tài sản đầu tiên](./thiet-ke-mvp-so-do-man-hinh-va-luong-them-tai-san-dau-tien.md).

Trong khi tiếp tục triển khai sản phẩm, cần hoàn thiện:

1. Sơ đồ màn hình và điều hướng.
2. Luồng thêm tài sản lần đầu.
3. Luồng thêm sự kiện bảo trì hoặc sửa chữa.
4. Luồng tạo không gian gia đình và mời thành viên.
5. Luồng đưa một tài sản vào nhiều không gian.
6. Luồng tạo và thu hồi liên kết chia sẻ.
7. Luồng xóa, khôi phục và xóa vĩnh viễn.
8. Ma trận quyền chi tiết.
9. Sơ đồ cơ sở dữ liệu và ràng buộc toàn vẹn.
10. Quy tắc sao lưu, khôi phục và quản lý tệp.


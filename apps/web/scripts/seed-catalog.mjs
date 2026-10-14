import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
const { Pool } = require("pg");

loadEnvConfig(process.cwd());

const items = [
  ["Ô tô", "Dầu động cơ", "Lít", "Dầu bôi trơn dùng khi bảo dưỡng động cơ ô tô."],
  ["Ô tô", "Lọc dầu động cơ", "Cái", "Lọc dầu thay định kỳ cho động cơ ô tô."],
  ["Ô tô", "Lọc gió động cơ", "Cái", "Lọc không khí nạp vào động cơ."],
  ["Ô tô", "Lọc gió điều hòa", "Cái", "Lọc không khí trong hệ thống điều hòa cabin."],
  ["Ô tô", "Bugi", "Cái", "Bugi đánh lửa cho động cơ xăng."],
  ["Ô tô", "Má phanh trước", "Bộ", "Bộ má phanh cho bánh trước."],
  ["Ô tô", "Má phanh sau", "Bộ", "Bộ má phanh cho bánh sau."],
  ["Ô tô", "Ắc quy", "Bình", "Ắc quy khởi động và cấp điện cho ô tô."],
  ["Ô tô", "Nước làm mát", "Lít", "Dung dịch làm mát động cơ."],
  ["Ô tô", "Dầu phanh", "Lít", "Dầu thủy lực dùng cho hệ thống phanh."],
  ["Ô tô", "Lốp ô tô", "Cái", "Lốp thay thế cho ô tô."],
  ["Ô tô", "Gạt mưa", "Cặp", "Cặp lưỡi gạt kính chắn gió."],
  ["Ô tô", "Bóng đèn ô tô", "Cái", "Bóng đèn chiếu sáng hoặc tín hiệu."],
  ["Xe máy", "Dầu nhớt xe máy", "Lít", "Dầu bôi trơn động cơ xe máy."],
  ["Xe máy", "Lọc dầu xe máy", "Cái", "Lọc dầu thay định kỳ cho xe máy."],
  ["Xe máy", "Lọc gió xe máy", "Cái", "Lọc không khí nạp của xe máy."],
  ["Xe máy", "Bugi xe máy", "Cái", "Bugi đánh lửa cho xe máy."],
  ["Xe máy", "Má phanh xe máy", "Bộ", "Má phanh đĩa hoặc phanh tang trống."],
  ["Xe máy", "Lốp xe máy", "Cái", "Lốp thay thế cho xe máy."],
  ["Xe máy", "Săm xe máy", "Cái", "Săm dùng cho bánh xe có săm."],
  ["Xe máy", "Ắc quy xe máy", "Bình", "Ắc quy khởi động và cấp điện cho xe máy."],
  ["Xe máy", "Bộ nhông xích", "Bộ", "Nhông trước, nhông sau và xích truyền động."],
  ["Máy tính", "RAM máy tính", "Thanh", "Bộ nhớ RAM cho máy tính để bàn hoặc máy tính xách tay."],
  ["Máy tính", "Ổ SSD SATA", "Ổ", "Ổ lưu trữ thể rắn giao tiếp SATA."],
  ["Máy tính", "Ổ SSD NVMe", "Ổ", "Ổ lưu trữ thể rắn giao tiếp NVMe."],
  ["Máy tính", "Ổ cứng HDD", "Ổ", "Ổ cứng cơ dùng lưu trữ dữ liệu."],
  ["Máy tính", "Nguồn máy tính", "Cái", "Bộ nguồn cho máy tính để bàn."],
  ["Máy tính", "Quạt tản nhiệt", "Cái", "Quạt làm mát linh kiện máy tính."],
  ["Máy tính", "Keo tản nhiệt", "Tuýp", "Keo truyền nhiệt cho CPU, GPU hoặc linh kiện điện tử."],
  ["Máy tính", "Pin laptop", "Cục", "Pin thay thế cho máy tính xách tay."],
  ["Máy tính", "Sạc laptop", "Bộ", "Bộ nguồn và dây sạc máy tính xách tay."],
  ["Máy tính", "Bàn phím", "Cái", "Bàn phím rời cho máy tính."],
  ["Máy tính", "Chuột máy tính", "Cái", "Chuột có dây hoặc không dây."],
  ["Máy tính", "Màn hình máy tính", "Cái", "Màn hình rời cho máy tính."],
  ["Điện thoại và máy tính bảng", "Pin điện thoại", "Cục", "Pin thay thế cho điện thoại."],
  ["Điện thoại và máy tính bảng", "Pin máy tính bảng", "Cục", "Pin thay thế cho máy tính bảng."],
  ["Điện thoại và máy tính bảng", "Củ sạc", "Cái", "Bộ chuyển đổi nguồn dùng sạc thiết bị."],
  ["Điện thoại và máy tính bảng", "Cáp sạc USB-C", "Sợi", "Cáp sạc và truyền dữ liệu đầu USB-C."],
  ["Điện thoại và máy tính bảng", "Cáp Lightning", "Sợi", "Cáp sạc và truyền dữ liệu đầu Lightning."],
  ["Điện thoại và máy tính bảng", "Kính cường lực", "Miếng", "Miếng bảo vệ màn hình."],
  ["Điện thoại và máy tính bảng", "Màn hình điện thoại", "Bộ", "Cụm màn hình thay thế cho điện thoại."],
  ["Điện thoại và máy tính bảng", "Ốp bảo vệ", "Cái", "Ốp hoặc vỏ bảo vệ thiết bị."],
  ["Điện gia dụng", "Lõi lọc nước", "Lõi", "Lõi lọc thay thế cho máy lọc nước."],
  ["Điện gia dụng", "Màng lọc máy lọc không khí", "Tấm", "Màng lọc bụi hoặc HEPA thay thế."],
  ["Điện gia dụng", "Túi lọc máy hút bụi", "Túi", "Túi chứa bụi dùng một lần hoặc thay thế."],
  ["Điện gia dụng", "Màng lọc máy hút bụi", "Tấm", "Màng lọc khí cho máy hút bụi."],
  ["Điện gia dụng", "Ống cấp nước máy giặt", "Sợi", "Ống dẫn nước đầu vào cho máy giặt."],
  ["Điện gia dụng", "Ống thoát nước máy giặt", "Sợi", "Ống thoát nước cho máy giặt."],
  ["Điện gia dụng", "Gioăng cửa tủ lạnh", "Bộ", "Gioăng cao su làm kín cửa tủ lạnh."],
  ["Điều hòa", "Lưới lọc điều hòa", "Tấm", "Lưới lọc bụi của dàn lạnh."],
  ["Điều hòa", "Gas lạnh R32", "Kg", "Môi chất lạnh R32."],
  ["Điều hòa", "Gas lạnh R410A", "Kg", "Môi chất lạnh R410A."],
  ["Điều hòa", "Tụ điều hòa", "Cái", "Tụ khởi động hoặc tụ ngậm của điều hòa."],
  ["Điều hòa", "Điều khiển điều hòa", "Cái", "Điều khiển từ xa thay thế."],
  ["Máy móc", "Vòng bi", "Cái", "Vòng bi hoặc bạc đạn dùng cho máy móc."],
  ["Máy móc", "Dây curoa", "Sợi", "Dây truyền động dùng cho máy móc."],
  ["Máy móc", "Xích truyền động", "Sợi", "Xích truyền động công nghiệp hoặc dân dụng."],
  ["Máy móc", "Dầu thủy lực", "Lít", "Dầu dùng cho hệ thống thủy lực."],
  ["Máy móc", "Dầu hộp số", "Lít", "Dầu bôi trơn hộp số và bộ truyền động."],
  ["Máy móc", "Mỡ bôi trơn", "Kg", "Mỡ bôi trơn ổ trục và chi tiết chuyển động."],
  ["Máy móc", "Phớt dầu", "Cái", "Phớt làm kín trục quay."],
  ["Máy móc", "Gioăng cao su", "Cái", "Gioăng làm kín cho thiết bị và máy móc."],
  ["Nội thất", "Bản lề tủ", "Cái", "Bản lề thay thế cho tủ và đồ nội thất."],
  ["Nội thất", "Ray ngăn kéo", "Cặp", "Cặp ray trượt cho ngăn kéo."],
  ["Nội thất", "Bánh xe nội thất", "Cái", "Bánh xe thay thế cho ghế, bàn hoặc tủ."],
  ["Nội thất", "Tay nắm tủ", "Cái", "Tay nắm thay thế cho cửa tủ hoặc ngăn kéo."],
  ["Nội thất", "Khóa tủ", "Cái", "Ổ khóa hoặc bộ khóa cho tủ."],
  ["Nội thất", "Keo dán gỗ", "Chai", "Keo dùng sửa chữa hoặc lắp ráp đồ gỗ."],
  ["Vật tư tiêu hao", "Pin AA", "Viên", "Pin kích thước AA dùng cho thiết bị điện tử."],
  ["Vật tư tiêu hao", "Pin AAA", "Viên", "Pin kích thước AAA dùng cho thiết bị điện tử."],
  ["Vật tư tiêu hao", "Pin CR2032", "Viên", "Pin cúc áo CR2032."],
  ["Vật tư tiêu hao", "Cầu chì", "Cái", "Cầu chì bảo vệ mạch điện."],
  ["Vật tư tiêu hao", "Băng keo điện", "Cuộn", "Băng keo cách điện."],
  ["Vật tư tiêu hao", "Dây rút nhựa", "Sợi", "Dây rút dùng cố định dây dẫn hoặc vật dụng."],
  ["Vật tư tiêu hao", "Bình xịt bôi trơn", "Bình", "Dung dịch xịt bôi trơn và chống gỉ."],
  ["Vật tư tiêu hao", "Vít các loại", "Cái", "Vít dùng lắp ráp hoặc sửa chữa."],
];

const databaseUrl = process.env.DATABASE_URL;
const administratorEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLocaleLowerCase())
  .filter(Boolean);

if (!databaseUrl) throw new Error("Thiếu DATABASE_URL.");
if (administratorEmails.length === 0) throw new Error("Thiếu ADMIN_EMAILS.");

const pool = new Pool({ connectionString: databaseUrl });

try {
  const administratorResult = await pool.query(
    "SELECT id, email FROM users WHERE lower(email) = ANY($1::text[]) ORDER BY created_at LIMIT 1",
    [administratorEmails],
  );
  const administrator = administratorResult.rows[0];

  if (!administrator) {
    throw new Error("Không tìm thấy tài khoản nào trong ADMIN_EMAILS. Hãy đăng ký tài khoản administrator trước.");
  }

  const existingResult = await pool.query(
    "SELECT lower(name) AS name, lower(coalesce(category, '')) AS category, lower(coalesce(part_number, '')) AS part_number FROM catalog_items",
  );
  const existingKeys = new Set(
    existingResult.rows.map((item) => `${item.category}|${item.name}|${item.part_number}`),
  );
  let inserted = 0;
  let skipped = 0;

  await pool.query("BEGIN");
  try {
    for (const [category, name, unit, description] of items) {
      const key = `${category.toLocaleLowerCase()}|${name.toLocaleLowerCase()}|`;
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }

      await pool.query(
        "INSERT INTO catalog_items (name, category, unit, description, is_active, created_by_user_id) VALUES ($1, $2, $3, $4, true, $5)",
        [name, category, unit, description, administrator.id],
      );
      existingKeys.add(key);
      inserted += 1;
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }

  console.log(`Seed danh mục hoàn tất: thêm ${inserted}, bỏ qua ${skipped}, tổng mẫu ${items.length}.`);
} finally {
  await pool.end();
}

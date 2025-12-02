export default async function handler(req, res) {
  try {
    // --- CHỈ CHO POST ---
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method không được hỗ trợ" });
    }

    // Lấy dữ liệu từ body
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Thiếu title hoặc content" });
    }

    // --- XỬ LÝ ANNOUNCEMENT ---
    // Ở đây bạn có thể gọi Discord webhook, Slack, gửi notification tới app khác, ...
    // Ví dụ hiện tại chỉ log ra console
    console.log("=== NEW ANNOUNCEMENT ===");
    console.log("Title:", title);
    console.log("Content:", content);

    // --- TRẢ VỀ RESPONSE ---
    return res.status(201).json({
      message: "Announcement đã gửi!",
      title,
      content
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Lỗi server", details: e.message });
  }
}

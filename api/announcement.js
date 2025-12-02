// Lưu tạm các announcement trong bộ nhớ server
let announcements = [];

export default async function handler(req, res) {
  try {
    // --- GET: trả về danh sách announcement ---
    if (req.method === "GET") {
      return res.status(200).json(announcements);
    }

    // --- POST: thêm announcement mới ---
    if (req.method === "POST") {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Thiếu title hoặc content" });
      }

      const newAnnouncement = { 
        id: Date.now().toString(), 
        title, 
        content, 
        createdAt: new Date().toISOString() 
      };

      announcements.push(newAnnouncement);

      console.log("=== NEW ANNOUNCEMENT ===");
      console.log("Title:", title);
      console.log("Content:", content);

      return res.status(201).json({
        message: "Announcement đã gửi!",
        announcement: newAnnouncement
      });
    }

    // --- Các method khác không được hỗ trợ ---
    return res.status(405).json({ error: "Method không được hỗ trợ" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Lỗi server", details: e.message });
  }
}

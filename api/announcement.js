let announcements = [];

// Thời gian tồn tại tối đa của announcement (ms)
const ANNOUNCEMENT_LIFETIME = 5000; // 5 giây

export default async function handler(req, res) {
  try {
    // ========== GET: Lấy danh sách announcement ==========
    if (req.method === "GET") {
      const { limit, since } = req.query;
      
      let result = announcements;
      
      if (since) {
        const sinceIndex = announcements.findIndex(a => a.id === since);
        if (sinceIndex !== -1) {
          result = announcements.slice(sinceIndex + 1);
        }
      }
      
      if (limit) {
        const limitNum = parseInt(limit);
        result = result.slice(-limitNum);
      }
      
      return res.status(200).json({
        success: true,
        count: result.length,
        total: announcements.length,
        data: result
      });
    }

    // ========== POST: Thêm announcement mới ==========
    if (req.method === "POST") {
      const { title, content, priority } = req.body;

      if (!title || !content) {
        return res.status(400).json({ 
          success: false,
          error: "Thiếu title hoặc content" 
        });
      }

      const newAnnouncement = { 
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        priority: priority || "normal",
        createdAt: new Date().toISOString(),
        readBy: []
      };

      announcements.push(newAnnouncement);

      // Tự động xóa sau 5 giây
      setTimeout(() => {
        const index = announcements.findIndex(a => a.id === newAnnouncement.id);
        if (index !== -1) {
          announcements.splice(index, 1);
          console.log("🗑️ Announcement expired:", newAnnouncement.id);
        }
      }, ANNOUNCEMENT_LIFETIME);

      console.log("📢 NEW ANNOUNCEMENT:", newAnnouncement.id, newAnnouncement.title);

      return res.status(201).json({
        success: true,
        message: "Announcement đã gửi!",
        data: newAnnouncement
      });
    }

    // ========== DELETE: Xóa announcement ==========
    if (req.method === "DELETE") {
      const { id } = req.query;
      
      if (!id) return res.status(400).json({ success: false, error: "Thiếu ID" });

      const index = announcements.findIndex(a => a.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: "Không tìm thấy announcement" });

      const deleted = announcements.splice(index, 1)[0];
      console.log("🗑️ Deleted announcement:", deleted.id);

      return res.status(200).json({
        success: true,
        message: "Đã xóa announcement",
        data: deleted
      });
    }

    // ========== PATCH: Đánh dấu đã đọc ==========
    if (req.method === "PATCH") {
      const { id, userId } = req.body;
      
      if (!id || !userId) return res.status(400).json({ success: false, error: "Thiếu ID hoặc userID" });

      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return res.status(404).json({ success: false, error: "Không tìm thấy announcement" });

      if (!announcement.readBy.includes(userId)) {
        announcement.readBy.push(userId);
      }

      return res.status(200).json({
        success: true,
        message: "Đã đánh dấu đã đọc",
        data: announcement
      });
    }

    return res.status(405).json({ 
      success: false,
      error: "Method không được hỗ trợ",
      allowedMethods: ["GET", "POST", "DELETE", "PATCH"]
    });

  } catch (e) {
    console.error("❌ Server error:", e);
    return res.status(500).json({ success: false, error: "Lỗi server", details: e.message });
  }
}

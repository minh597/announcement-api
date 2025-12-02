let announcements = [];

// Giới hạn số lượng announcements lưu trữ (tránh tràn bộ nhớ)
const MAX_ANNOUNCEMENTS = 100;

export default async function handler(req, res) {
  try {
    // ========== GET: Lấy danh sách announcement ==========
    if (req.method === "GET") {
      const { limit, since } = req.query;
      
      let result = announcements;
      
      // Lọc theo thời gian (lấy các announcement sau một ID nhất định)
      if (since) {
        const sinceIndex = announcements.findIndex(a => a.id === since);
        if (sinceIndex !== -1) {
          result = announcements.slice(sinceIndex + 1);
        }
      }
      
      // Giới hạn số lượng trả về
      if (limit) {
        const limitNum = parseInt(limit);
        result = result.slice(-limitNum); // Lấy N announcement mới nhất
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

      // Validation
      if (!title || !content) {
        return res.status(400).json({ 
          success: false,
          error: "Thiếu title hoặc content" 
        });
      }

      // Tạo announcement mới
      const newAnnouncement = { 
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        priority: priority || "normal", // low, normal, high, urgent
        createdAt: new Date().toISOString(),
        readBy: [] // Theo dõi ai đã đọc (optional)
      };

      announcements.push(newAnnouncement);

      // Giới hạn số lượng (xóa announcement cũ nhất nếu vượt quá)
      if (announcements.length > MAX_ANNOUNCEMENTS) {
        announcements.shift();
      }

      // Log server
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📢 NEW ANNOUNCEMENT");
      console.log("ID:", newAnnouncement.id);
      console.log("Title:", newAnnouncement.title);
      console.log("Content:", newAnnouncement.content);
      console.log("Priority:", newAnnouncement.priority);
      console.log("Time:", newAnnouncement.createdAt);
      console.log("Total announcements:", announcements.length);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return res.status(201).json({
        success: true,
        message: "Announcement đã gửi!",
        data: newAnnouncement
      });
    }

    // ========== DELETE: Xóa announcement (theo ID) ==========
    if (req.method === "DELETE") {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "Thiếu ID" 
        });
      }

      const index = announcements.findIndex(a => a.id === id);
      
      if (index === -1) {
        return res.status(404).json({ 
          success: false,
          error: "Không tìm thấy announcement" 
        });
      }

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
      
      if (!id || !userId) {
        return res.status(400).json({ 
          success: false,
          error: "Thiếu ID hoặc userID" 
        });
      }

      const announcement = announcements.find(a => a.id === id);
      
      if (!announcement) {
        return res.status(404).json({ 
          success: false,
          error: "Không tìm thấy announcement" 
        });
      }

      if (!announcement.readBy.includes(userId)) {
        announcement.readBy.push(userId);
      }

      return res.status(200).json({
        success: true,
        message: "Đã đánh dấu đã đọc",
        data: announcement
      });
    }

    // ========== Method không được hỗ trợ ==========
    return res.status(405).json({ 
      success: false,
      error: "Method không được hỗ trợ",
      allowedMethods: ["GET", "POST", "DELETE", "PATCH"]
    });

  } catch (e) {
    console.error("❌ Server error:", e);
    return res.status(500).json({ 
      success: false,
      error: "Lỗi server", 
      details: e.message 
    });
  }
}

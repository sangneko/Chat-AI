// api/chat.js
// Đây là Serverless Function cho Vercel để xử lý yêu cầu chat sử dụng một dịch vụ AI khác

// Import các thư viện cần thiết
const express = require('express');
// Thay thế dòng dưới bằng import thư viện của dịch vụ AI bạn chọn
// Ví dụ: const { NewAILibrary } = require("new-ai-library");

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON trong request body
app.use(express.json());

// Khởi tạo client cho dịch vụ AI mới với API Key từ biến môi trường của Vercel
// Đảm bảo biến môi trường cho dịch vụ AI mới đã được thiết lập trên Vercel
// Thay thế 'NEW_AI_API_KEY' bằng tên biến môi trường bạn dùng cho khóa API mới
// Thay thế 'NewAILibrary' bằng tên lớp/hàm khởi tạo client của thư viện mới
// const newAIClient = new NewAILibrary(process.env.NEW_AI_API_KEY);

// Kiểm tra xem API Key có được tải thành công không
// Thay thế 'NEW_AI_API_KEY' bằng tên biến môi trường bạn dùng
if (!process.env.NEW_AI_API_KEY) {
    console.error("Lỗi: Không tìm thấy biến môi trường NEW_AI_API_KEY.");
    console.error("Vui lòng thiết lập biến môi trường cho dịch vụ AI mới trong cài đặt dự án Vercel của bạn.");
    // Không thoát ngay mà vẫn export app để Vercel có thể deploy, nhưng function sẽ báo lỗi khi chạy
} else {
    console.log("Đã tải thành công NEW_AI_API_KEY.");
}

// Định nghĩa endpoint POST /api/chat
// Vercel sẽ định tuyến các yêu cầu đến /api/chat tới function này
app.post('/api/chat', async (req, res) => {
    // Lấy tin nhắn người dùng từ body của request
    const userMessage = req.body.message;

    // Kiểm tra xem có tin nhắn được gửi lên không
    if (!userMessage) {
        // Trả về lỗi nếu không có tin nhắn
        return res.status(400).json({ error: 'Không có tin nhắn được gửi.' });
    }

    // Kiểm tra lại API Key trước khi gọi API
    // Thay thế 'NEW_AI_API_KEY' bằng tên biến môi trường bạn dùng
     if (!process.env.NEW_AI_API_KEY) {
         return res.status(500).json({ error: 'API Key cho dịch vụ AI mới chưa được cấu hình trên server.' });
     }

    console.log(`Nhận tin nhắn từ người dùng: "${userMessage}"`);

    try {
        // --- Phần này cần được thay thế hoàn toàn bằng cách gọi API của dịch vụ AI mới ---
        // Tham khảo tài liệu API của dịch vụ AI bạn chọn để biết cách gửi prompt và nhận phản hồi

        // Ví dụ placeholder:
        // const aiResponse = await newAIClient.generateText({
        //     prompt: userMessage,
        //     maxLength: 200, // Tùy chỉnh giới hạn độ dài
        // });
        // const botReply = aiResponse.text; // Cách lấy nội dung phản hồi tùy thuộc vào thư viện

        // --- Kết thúc phần thay thế ---

        // **Mô phỏng phản hồi nếu chưa tích hợp API thật:**
        // Xóa phần mô phỏng này khi bạn đã tích hợp API thật
         console.warn("Chú ý: Đang sử dụng phản hồi mô phỏng vì API AI mới chưa được tích hợp.");
         await new Promise(resolve => setTimeout(resolve, 1000)); // Mô phỏng độ trễ
         const botReply = `(Mô phỏng) Tôi đã nhận được tin nhắn của bạn: "${userMessage}". Vui lòng tích hợp API của dịch vụ AI mới.`;
        // **Kết thúc mô phỏng**


        // Ghi log phản hồi từ AI
        console.log(`Phản hồi từ AI: "${botReply}"`);

        // Gửi phản hồi về cho frontend dưới dạng JSON
        res.json({ reply: botReply });

    } catch (error) {
        // Xử lý lỗi trong quá trình gọi API của dịch vụ AI mới
        console.error('Lỗi khi gọi API dịch vụ AI mới:', error);

        // Trả về lỗi cho frontend
        let errorMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn với dịch vụ AI mới.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.response && error.response.data) {
             errorMessage = `Lỗi từ API dịch vụ AI mới: ${JSON.stringify(error.response.data)}`;
        }

        res.status(error.status || error.response?.status || 500).json({ error: errorMessage });
    }
});

// Xuất ứng dụng Express làm handler cho Serverless Function
// Vercel sẽ sử dụng export này để chạy function
module.exports = app;

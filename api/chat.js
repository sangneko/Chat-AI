// api/chat.js
// Đây là Serverless Function cho Vercel để xử lý yêu cầu chat sử dụng Google AI Gemini

// Import các thư viện cần thiết
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import thư viện Google AI

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON trong request body
app.use(express.json());

// Khởi tạo GoogleGenerativeAI với API Key từ biến môi trường của Vercel
// Vercel sẽ tự động cung cấp biến môi trường GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Kiểm tra xem API Key có được tải thành công không
if (!process.env.GOOGLE_API_KEY) {
    console.error("Lỗi: Không tìm thấy biến môi trường GOOGLE_API_KEY.");
    console.error("Vui lòng thiết lập biến môi trường GOOGLE_API_KEY trong cài đặt dự án Vercel của bạn.");
    // Không thoát ngay mà vẫn export app để Vercel có thể deploy, nhưng function sẽ báo lỗi khi chạy
} else {
    console.log("Đã tải thành công GOOGLE_API_KEY.");
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
     if (!process.env.GOOGLE_API_KEY) {
         return res.status(500).json({ error: 'API Key cho Google AI chưa được cấu hình trên server.' });
     }

    console.log(`Nhận tin nhắn từ người dùng: "${userMessage}"`);

    try {
        // Chọn mô hình Gemini bạn muốn sử dụng
        const model = genAI.getGenerativeModel({ model: "gemini-pro"}); // Hoặc "gemini-ultra", tùy thuộc vào quyền truy cập của bạn

        // Bắt đầu một cuộc hội thoại với mô hình
        const chat = model.startChat({
            // Có thể thêm lịch sử chat ở đây nếu bạn muốn bot nhớ ngữ cảnh
            // history: [
            //   {
            //     role: "user",
            //     parts: "Xin chào!",
            //   },
            //   {
            //     role: "model",
            //     parts: "Chào bạn! Tôi là AI Bot. Bạn có câu hỏi gì không?",
            //   },
            // ],
            generationConfig: {
                maxOutputTokens: 200, // Giới hạn độ dài phản hồi (có thể điều chỉnh)
            },
        });

        // Gửi tin nhắn của người dùng và nhận phản hồi
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const botReply = response.text(); // Lấy nội dung phản hồi từ AI

        // Ghi log phản hồi từ AI
        console.log(`Phản hồi từ AI: "${botReply}"`);

        // Gửi phản hồi về cho frontend dưới dạng JSON
        res.json({ reply: botReply });

    } catch (error) {
        // Xử lý lỗi trong quá trình gọi API Google AI
        console.error('Lỗi khi gọi API Google AI:', error);

        // Trả về lỗi cho frontend
        if (error.response) {
             // Lỗi từ phản hồi của Google AI API (có thể kiểm tra status code nếu API cung cấp)
             console.error("API Response Error:", error.response.status, error.response.data);
             res.status(error.response.status || 500).json({ error: 'Lỗi từ API Google AI', details: error.response.data });
        } else {
            // Các lỗi khác (ví dụ: lỗi mạng, lỗi khởi tạo)
            console.error('Lỗi:', error.message);
             res.status(500).json({ error: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.', details: error.message });
        }
    }
});

// Xuất ứng dụng Express làm handler cho Serverless Function
// Vercel sẽ sử dụng export này để chạy function
module.exports = app;

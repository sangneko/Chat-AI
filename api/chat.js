// api/chat.js
// Đây là Serverless Function cho Vercel để xử lý yêu cầu chat

// Import các thư viện cần thiết
const express = require('express');
const OpenAI = require('openai');
// Không cần require('dotenv').config() ở đây vì Vercel quản lý biến môi trường

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON trong request body
app.use(express.json());

// Khởi tạo OpenAI client với API Key từ biến môi trường của Vercel
// Vercel sẽ tự động cung cấp biến môi trường OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Ghi log (sẽ hiển thị trong dashboard Vercel)
    console.log(`Nhận tin nhắn từ người dùng: "${userMessage}"`);

    try {
        // Gọi API của OpenAI để tạo phản hồi
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Hoặc mô hình khác bạn muốn sử dụng (ví dụ: gpt-4)
            messages: [
                {"role": "system", "content": "Bạn là một trợ lý AI hữu ích."}, // Vai trò của bot
                {"role": "user", "content": userMessage} // Tin nhắn của người dùng
            ],
            max_tokens: 200, // Giới hạn độ dài phản hồi (có thể điều chỉnh)
        });

        // Lấy nội dung phản hồi từ AI
        const botReply = completion.choices[0].message.content;

        // Ghi log phản hồi từ AI
        console.log(`Phản hồi từ AI: "${botReply}"`);

        // Gửi phản hồi về cho frontend dưới dạng JSON
        res.json({ reply: botReply });

    } catch (error) {
        // Xử lý lỗi trong quá trình gọi API OpenAI
        console.error('Lỗi khi gọi API OpenAI:', error);

        // Trả về lỗi cho frontend
        if (error.response) {
            // Lỗi từ phản hồi của OpenAI API
            console.error(error.response.status);
            console.error(error.response.data);
             res.status(error.response.status).json({ error: 'Lỗi từ API OpenAI', details: error.response.data });
        } else {
            // Các lỗi khác (ví dụ: lỗi mạng)
            console.error('Lỗi:', error.message);
             res.status(500).json({ error: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.', details: error.message });
        }
    }
});

// Xuất ứng dụng Express làm handler cho Serverless Function
// Vercel sẽ sử dụng export này để chạy function
module.exports = app;

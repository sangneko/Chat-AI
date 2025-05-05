// api/chat.js
// Đây là Serverless Function cho Vercel để xử lý yêu cầu chat sử dụng API từ puter.com
// Tham khảo hướng dẫn tại https://developer.puter.com/tutorials/free-unlimited-openai-api/

// Import các thư viện cần thiết
const express = require('express');
// Import thư viện OpenAI
const OpenAI = require("openai");

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON trong request body
app.use(express.json());

// Lấy API Key từ biến môi trường của Vercel
// Thay thế 'PUTER_API_KEY' bằng tên biến môi trường mà hướng dẫn từ puter.com gợi ý
const apiKey = process.env.PUTER_API_KEY;

// Lấy Base URL từ hướng dẫn của puter.com
// Thay thế 'https://api.puter.com/v1' bằng Base URL thực tế từ hướng dẫn
const baseURL = "https://api.puter.com/v1"; // <-- Thay thế bằng Base URL từ hướng dẫn

// Kiểm tra xem API Key có được tải thành công không
// Thay thế 'PUTER_API_KEY' bằng tên biến môi trường bạn dùng
if (!apiKey) {
    console.error("Lỗi: Không tìm thấy biến môi trường PUTER_API_KEY.");
    console.error("Vui lòng thiết lập biến môi trường PUTER_API_KEY trong cài đặt dự án Vercel của bạn.");
    // Không thoát ngay mà vẫn export app để Vercel có thể deploy, nhưng function sẽ báo lỗi khi chạy
} else {
    console.log("Đã tải thành công PUTER_API_KEY.");
}

// Khởi tạo OpenAI client, trỏ đến base_url của dịch vụ mới
const client = new OpenAI({
  apiKey: apiKey, // Sử dụng API Key từ biến môi trường
  baseURL: baseURL, // Trỏ đến Base URL của dịch vụ mới
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

    // Kiểm tra lại API Key trước khi gọi API
     if (!process.env.PUTER_API_KEY) { // <-- Thay thế bằng tên biến môi trường bạn dùng
         return res.status(500).json({ error: 'API Key cho dịch vụ AI mới chưa được cấu hình trên server.' });
     }

    console.log(`Nhận tin nhắn từ người dùng: "${userMessage}"`);

    try {
        // Gọi API chat completions thông qua client đã cấu hình
        // Chọn mô hình dựa trên những gì dịch vụ mới hỗ trợ.
        // Tham khảo tài liệu của dịch vụ mới để biết tên mô hình chính xác.
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo", // <-- Kiểm tra và thay thế bằng tên mô hình được hỗ trợ
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
        // Xử lý lỗi trong quá trình gọi API của dịch vụ mới
        console.error('Lỗi khi gọi API dịch vụ AI mới:', error);

        // Trả về lỗi cho frontend
        let errorMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn với dịch vụ AI mới.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.response && error.response.data) {
             errorMessage = `Lỗi từ API dịch vụ AI mới: ${JSON.stringify(error.response.data)}`;
        } else {
             // Xử lý lỗi từ thư viện OpenAI client
             errorMessage = `Lỗi từ thư viện OpenAI: ${error.message}`;
        }


        res.status(error.status || error.response?.status || 500).json({ error: errorMessage });
    }
});

// Xuất ứng dụng Express làm handler cho Serverless Function
// Vercel sẽ sử dụng export này để chạy function
module.exports = app;

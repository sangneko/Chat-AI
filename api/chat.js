// api/chat.js
// Đây là Serverless Function cho Vercel để xử lý yêu cầu chat sử dụng API của aimlapi.com

// Import các thư viện cần thiết
const express = require('express');
// Import thư viện aimlapi
const AIMLAPI = require("@aimlapi/aimlapi");

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON trong request body
app.use(express.json());

// Khởi tạo AIMLAPI client với API Key từ biến môi trường của Vercel
// Đảm bảo biến môi trường AIMLAPI_API_KEY đã được thiết lập trên Vercel
const aimlapi = new AIMLAPI(process.env.AIMLAPI_API_KEY);

// Kiểm tra xem API Key có được tải thành công không
if (!process.env.AIMLAPI_API_KEY) {
    console.error("Lỗi: Không tìm thấy biến môi trường AIMLAPI_API_KEY.");
    console.error("Vui lòng thiết lập biến môi trường AIMLAPI_API_KEY trong cài đặt dự án Vercel của bạn.");
    // Không thoát ngay mà vẫn export app để Vercel có thể deploy, nhưng function sẽ báo lỗi khi chạy
} else {
    console.log("Đã tải thành công AIMLAPI_API_KEY.");
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
     if (!process.env.AIMLAPI_API_KEY) {
         return res.status(500).json({ error: 'API Key cho aimlapi.com chưa được cấu hình trên server.' });
     }

    console.log(`Nhận tin nhắn từ người dùng: "${userMessage}"`);

    try {
        // Gọi API của aimlapi.com để tạo phản hồi chat
        // Bạn có thể chỉ định model cụ thể nếu muốn, ví dụ: model: "gpt-3.5-turbo"
        const completion = await aimlapi.chat.completions.create({
            model: "gpt-3.5-turbo", // Sử dụng mô hình mặc định hoặc chỉ định mô hình khác
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
        // Xử lý lỗi trong quá trình gọi API của aimlapi.com
        console.error('Lỗi khi gọi API aimlapi.com:', error);

        // Trả về lỗi cho frontend
        let errorMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn với aimlapi.com.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.response && error.response.data) {
             errorMessage = `Lỗi từ API aimlapi.com: ${JSON.stringify(error.response.data)}`;
        } else {
             // Xử lý lỗi từ thư viện AIMLAPI client
             errorMessage = `Lỗi từ thư viện AIMLAPI: ${error.message}`;
        }


        res.status(error.status || error.response?.status || 500).json({ error: errorMessage });
    }
});

// Xuất ứng dụng Express làm handler cho Serverless Function
// Vercel sẽ sử dụng export này để chạy function
module.exports = app;

import { createClient } from '@supabase/supabase-js';

// 1. Khởi tạo Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Bản đồ phím tắt cho trạng thái
const statusMap: Record<string, string> = {
  'ddr': 'Đang diễn ra',
  'sdr': 'Sắp diễn ra',
  'het': 'Hết trận'
};

// Hàm hỗ trợ gửi tin nhắn ngược lại cho Telegram
async function sendTelegram(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message?.text;
    const chatId = body.message?.chat.id;

    if (!message || !chatId) return Response.json({ ok: true });

    // 3. BẢO MẬT: Chỉ cho phép "ông chủ" (ID của ông) được quyền dùng lệnh
    // Lưu ý: Đảm bảo ông đã điền đúng MY_CHAT_ID trên Vercel Env
    if (chatId.toString() !== process.env.MY_CHAT_ID) {
      console.log(`Phát hiện xâm nhập từ ID: ${chatId}`);
      return Response.json({ ok: true });
    }

    // --- XỬ LÝ LỆNH /up (Cập nhật tỉ số & trạng thái) ---
    if (message.startsWith('/up')) {
      const parts = message.split(' ');
      if (parts.length < 3) {
        await sendTelegram(chatId, "⚠️ Sai cú pháp! Dùng: /up [ID] [Tỉ số] [Trạng thái]\nVí dụ: /up 1 2-1 ddr");
        return Response.json({ ok: true });
      }

      const id = parts[1];
      const score = parts[2];
      const rawStatus = parts[3]?.toLowerCase();
      
      // Dịch trạng thái từ phím tắt hoặc lấy mặc định
      const status = statusMap[rawStatus] || (parts[3] ? parts.slice(3).join(' ') : 'Đang diễn ra');
      const [hScore, aScore] = score.split('-');

      const { error } = await supabase
        .from('matches')
        .update({ 
          home_score: hScore, 
          away_score: aScore, 
          status: status 
        })
        .eq('id', id);

      const reply = error ? `❌ Lỗi DB: ${error.message}` : `✅ Trận ${id}: ${score} [${status}]`;
      await sendTelegram(chatId, reply);
    }

    // --- XỬ LÝ LỆNH /st (Chỉ cập nhật trạng thái) ---
    else if (message.startsWith('/st')) {
      const parts = message.split(' ');
      if (parts.length < 3) {
        await sendTelegram(chatId, "⚠️ Sai cú pháp! Dùng: /st [ID] [Trạng thái]\nVí dụ: /st 1 het");
        return Response.json({ ok: true });
      }

      const id = parts[1];
      const rawStatus = parts[2]?.toLowerCase();
      const status = statusMap[rawStatus] || parts.slice(2).join(' ');

      const { error } = await supabase
        .from('matches')
        .update({ status: status })
        .eq('id', id);

      const reply = error ? `❌ Lỗi DB: ${error.message}` : `✅ Trận ${id} đã chuyển sang: ${status}`;
      await sendTelegram(chatId, reply);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return Response.json({ ok: true });
  }
}
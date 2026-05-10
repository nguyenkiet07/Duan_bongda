import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const message = body.message?.text;
  const chatId = body.message?.chat.id;

  // Chỉ cho ông mới có quyền sửa
  if (chatId?.toString() !== process.env.MY_CHAT_ID) return Response.json({ ok: true });

  if (message?.startsWith('/up')) {
    const [_, id, score] = message.split(' ');
    const [hScore, aScore] = score.split('-');

    const { error } = await supabase
      .from('matches')
      .update({ home_score: hScore, away_score: aScore, status: 'Đang diễn ra' })
      .eq('id', id);

    const reply = error ? "Lỗi DB rồi!" : `✅ Đã cập nhật tỉ số trận ${id} thành ${score}`;
    
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    });
  }

  return Response.json({ ok: true });
}
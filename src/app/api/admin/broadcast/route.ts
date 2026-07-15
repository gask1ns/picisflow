import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getBot } from "@/lib/telegram/bot";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, body, sendTelegram, toAll } = await request.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const service = createServiceClient();

  if (toAll) {
    const { data: users } = await service
      .from("profiles")
      .select("id");

    if (users) {
      const notifications = users.map((u) => ({
        user_id: u.id,
        type: "info" as const,
        title,
        body: body || null,
        link: null,
      }));
      await service.from("notifications").insert(notifications);
    }
  } else {
    await service.from("notifications").insert({
      user_id: user.id,
      type: "info",
      title,
      body: body || null,
    });
  }

  if (sendTelegram) {
    const bot = getBot();
    const msg = `📢 *${title}*${body ? `\n\n${body}` : ""}`;

    if (toAll) {
      const { data: links } = await service
        .from("telegram_links")
        .select("telegram_chat_id")
        .eq("is_verified", true)
        .not("telegram_chat_id", "is", null);

      if (links) {
        for (const l of links) {
          if (!l.telegram_chat_id) continue;
          try {
            await bot.api.sendMessage(l.telegram_chat_id, msg, { parse_mode: "Markdown" });
          } catch { /* skip */ }
        }
      }
    } else {
      const { data: link } = await service
        .from("telegram_links")
        .select("telegram_chat_id")
        .eq("user_id", user.id)
        .single();

      if (link?.telegram_chat_id) {
        await bot.api.sendMessage(link.telegram_chat_id, msg, { parse_mode: "Markdown" });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

import { InlineKeyboard } from "grammy";

// Not used yet — reserved for inline keyboard flow v2
export function categoryKeyboard(
  categories: { id: string; name: string; icon: string | null }[]
): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const cat of categories) {
    kb.text(`${cat.icon ?? "📄"} ${cat.name}`, `cat_${cat.id}`);
  }
  return kb;
}

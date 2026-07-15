export function wibNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
}

export function wibDate(): string {
  return wibNow().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export function wibDayOfWeek(): number {
  return wibNow().getDay();
}

export function wibDayOfMonth(): number {
  return wibNow().getDate();
}

export function wibWeekRange(): { start: string; end: string } {
  const now = wibNow();
  const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const monOffset = day === 0 ? -6 : 1 - day;
  const sunOffset = monOffset + 6;
  const start = new Date(now);
  start.setDate(now.getDate() + monOffset);
  const end = new Date(now);
  end.setDate(now.getDate() + sunOffset);
  return {
    start: start.toLocaleDateString("en-CA"),
    end: end.toLocaleDateString("en-CA"),
  };
}

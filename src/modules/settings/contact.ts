export type WhatsAppMessageInput = {
  service?: string;
  solution?: string;
  material?: string;
  dimensions?: string;
  city?: string;
  district?: string;
  notes?: string;
};

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function phoneHref(value: string) {
  return `tel:${value.replace(/\s/g, "")}`;
}

export function buildWhatsAppMessage(defaultMessage: string | null | undefined, input: WhatsAppMessageInput) {
  const lines = [defaultMessage?.trim() || "السلام عليكم، أود الاستفسار عن أعمال التظليل."];
  const details = [
    ["الخدمة", input.service],
    ["الحل", input.solution],
    ["المادة", input.material],
    ["الأبعاد التقريبية", input.dimensions],
    ["المدينة", input.city],
    ["الحي", input.district],
    ["ملاحظات", input.notes],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));

  if (details.length) {
    lines.push("", "تفاصيل الطلب:", ...details.map(([label, value]) => `${label}: ${value.trim()}`));
  }

  return lines.join("\n");
}

export function buildWhatsAppUrl(number: string, defaultMessage: string | null | undefined, input: WhatsAppMessageInput = {}) {
  const digits = digitsOnly(number);
  const message = buildWhatsAppMessage(defaultMessage, input);

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

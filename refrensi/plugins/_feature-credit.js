// Kredit fitur Rimuru MD.
// Sengaja disimpan di folder plugins, bukan config.js.

export const FEATURE_CREDIT =
  'Fitur By Anita Putri Azzahra\nTiktok: https://tiktok.com/@anita.putri.azzah1\nFitur dari bot Rimuru MD👑';

const MEDIA_KEYS = ["image", "video", "document"];
const hasMedia = (payload) =>
  payload && typeof payload === "object" && MEDIA_KEYS.some((key) => key in payload);

const addCredit = (caption) => {
  const text = String(caption ?? "");
  if (text.includes("Fitur By Anita Putri Azzahra") && text.includes("anita.putri.azzah1")) {
    return text;
  }
  return text ? `${text}\n\n${FEATURE_CREDIT}` : FEATURE_CREDIT;
};

export function decoratePluginContext(m, sock) {
  const wrappedSock = new Proxy(sock, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original !== "function") return original;

      if (prop === "sendMessage") {
        return async function (jid, content, options) {
          if (hasMedia(content)) {
            const next = { ...content };
            if ("caption" in next || next.image || next.video || next.document) {
              next.caption = addCredit(next.caption);
            }
            content = next;
          }
          return original.call(target, jid, content, options);
        };
      }

      if (prop === "sendMedia") {
        return async function (jid, source, caption = "", quoted, options = {}) {
          return original.call(target, jid, source, addCredit(caption), quoted, options);
        };
      }

      if (prop === "sendFile") {
        return async function (jid, input, options = {}) {
          const next = { ...options };
          const mime = String(next.mimetype || "");
          const filename = String(next.filename || "").toLowerCase();
          const isMedia =
            mime.startsWith("image/") ||
            mime.startsWith("video/") ||
            mime.startsWith("application/pdf") ||
            /\\.(?:jpe?g|png|gif|webp|mp4|mov|mkv|pdf)$/i.test(filename);
          if (isMedia || "caption" in next) next.caption = addCredit(next.caption);
          return original.call(target, jid, input, next);
        };
      }

      if (prop === "sendButton") {
        return async function (jid, source, text = null, quoted, options = {}) {
          const hasSource = source !== null && source !== undefined;
          const nextText = hasSource ? addCredit(text) : text;
          return original.call(target, jid, source, nextText, quoted, options);
        };
      }

      return original.bind(target);
    },
  });

  const wrappedMessage = new Proxy(m, {
    get(target, prop, receiver) {
      if (prop === "reply") {
        return async function (text, ...args) {
          const value = typeof text === "string" ? addCredit(text) : text;
          return target.reply.call(target, value, ...args);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver);
    },
  });

  return { m: wrappedMessage, sock: wrappedSock };
}

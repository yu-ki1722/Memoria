import twemoji from "twemoji";

export function emojiToTwemoji(emoji: string) {
  return twemoji.parse(emoji, {
    folder: "svg",
    ext: ".svg",
    base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/", // これでCDN利用
    className: "twemoji",
  });
}

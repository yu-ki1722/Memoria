import twemoji from "twemoji";

export function emojiToTwemoji(emoji: string) {
  const codepoint = twemoji.convert.toCodePoint(emoji);
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`;
}

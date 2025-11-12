"use client";

import {
  BsEmojiSmile,
  BsEmojiLaughing,
  BsEmojiHeartEyes,
  BsEmojiFrown,
  BsEmojiSurprise,
  BsEmojiNeutral,
  BsEmojiExpressionless,
} from "react-icons/bs";

type Props = {
  emotion: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function EmotionIcon({ emotion, className = "", style }: Props) {
  switch (emotion) {
    case "😊":
      return <BsEmojiSmile className={className} style={style} />;
    case "😂":
      return <BsEmojiLaughing className={className} style={style} />;
    case "😍":
      return <BsEmojiHeartEyes className={className} style={style} />;
    case "😢":
      return <BsEmojiFrown className={className} style={style} />; // ← 修正
    case "😮":
      return <BsEmojiSurprise className={className} style={style} />;
    case "🤔":
      return <BsEmojiNeutral className={className} style={style} />; // ← 修正
    default:
      return <BsEmojiExpressionless className={className} style={style} />;
  }
}

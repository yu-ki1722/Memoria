import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Calendar, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { TbMapPinUp } from "react-icons/tb";

type Memory = {
  id: number;
  emotion: string;
  text: string;
  image_url: string | null;
  prefecture: string | null;
  city: string | null;
  facility: string | null;
  created_at: string;
  tags: string[] | null;
};

type EmotionColor = { bg: string; accent: string };
type GetEmotionColorFn = (emotion: string) => EmotionColor;

interface Props {
  memory: Memory;
  onClose: () => void;
  getEmotionColor: GetEmotionColorFn;
}

const isVideo = (url: string | null) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg)$/i.test(url);
};

export default function MemoryDetailModal({
  memory,
  onClose,
  getEmotionColor,
}: Props) {
  const router = useRouter();

  const color = getEmotionColor(memory.emotion);
  const date = new Date(memory.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const location = [memory.prefecture, memory.city, memory.facility]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleMoveToMap = () => {
    router.push(`/map?memoryId=${memory.id}`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className={`relative w-full max-w-lg bg-[#fffefb] rounded-2xl shadow-2xl border border-black/5 flex flex-col max-h-[90vh]`}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-20"
        >
          <X size={24} />
        </button>

        <div
          className={`relative w-full flex items-center justify-center ${color.bg} rounded-t-2xl flex-shrink-0 p-6`}
        >
          {memory.image_url ? (
            isVideo(memory.image_url) ? (
              <video
                src={memory.image_url}
                controls
                playsInline
                autoPlay
                className="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : (
              <img
                src={memory.image_url}
                alt={memory.text}
                className="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            )
          ) : (
            <div className="w-full aspect-video flex items-center justify-center">
              <ImageOff className={`w-20 h-20 ${color.accent} opacity-40`} />
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl flex-shrink-0">{memory.emotion}</span>
            <h2 className="text-2xl font-bold text-gray-800 break-words">
              {memory.text || "（タイトルなし）"}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 text-gray-600 mb-2">
            <Calendar size={18} className={`${color.accent}`} />
            <span className="text-md font-medium">{date}</span>
          </div>

          {location && (
            <div className="flex items-start gap-2.5 text-gray-600 mb-4">
              <MapPin size={18} className={`${color.accent}`} />
              <span className="text-md font-medium break-words">
                {location}
              </span>
            </div>
          )}

          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.accent}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleMoveToMap}
            className={`
    w-full mt-6 py-3 px-4
    flex items-center justify-center gap-2
    rounded-full font-semibold shadow-md
    hover:shadow-lg active:scale-95 transition-all duration-200
    ${color.bg} 
  `}
          >
            <TbMapPinUp size={20} className={`${color.accent}`} />
            <span className={`${color.accent}`}>マップで見る</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

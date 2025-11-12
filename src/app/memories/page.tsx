"use client";

import { useEffect, useState } from "react";
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs";
import { Loader2, ImageOff, MapPin, Calendar } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case "😊":
      return {
        bg: "bg-[#FFF8E1]",
        accent: "text-[#F59E0B]",
      };
    case "😂":
      return {
        bg: "bg-[#FEF3C7]",
        accent: "text-[#FB923C]",
      };
    case "😍":
      return {
        bg: "bg-[#FCE7F3]",
        accent: "text-[#EC4899]",
      };
    case "😢":
      return {
        bg: "bg-[#DBEAFE]",
        accent: "text-[#3B82F6]",
      };
    case "😮":
      return {
        bg: "bg-[#D1FAE5]",
        accent: "text-[#10B981]",
      };
    case "🤔":
      return {
        bg: "bg-[#EDE9FE]",
        accent: "text-[#8B5CF6]",
      };
    default:
      return {
        bg: "bg-white",
        accent: "text-gray-600",
      };
  }
};

type Memory = {
  id: number;
  emotion: string;
  text: string;
  image_url: string | null;
  prefecture: string | null;
  city: string | null;
  facility: string | null;
  created_at: string;
};

export default function MemoriesPage() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    fetchSession();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (!error && data) setMemories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [session, supabase]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <>
      <Header title="思い出一覧" />
      <main className="min-h-screen bg-[#fffefb] pt-20 pb-24 px-4 relative">
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-20 pointer-events-none"></div>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh] text-gray-500">
            <Loader2 className="animate-spin mr-2" />
            読み込み中...
          </div>
        ) : memories.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            まだ思い出がありません。
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-md mx-auto flex flex-col gap-5 pb-10"
          >
            {memories.map((memory) => {
              const color = getEmotionColor(memory.emotion);
              const hasImage = Boolean(memory.image_url);
              const date = new Date(memory.created_at).toLocaleDateString(
                "ja-JP"
              );

              return (
                <motion.div
                  key={memory.id}
                  variants={cardVariants}
                  className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${color.bg}`}
                >
                  {hasImage ? (
                    memory.image_url?.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                      <video
                        src={memory.image_url!}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-52 object-cover bg-black"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={memory.image_url!}
                        alt={memory.text}
                        className="w-full h-52 object-cover"
                      />
                    )
                  ) : (
                    <div className="h-52 flex items-center justify-center bg-white/60">
                      <ImageOff
                        className={`w-12 h-12 ${color.accent} opacity-40`}
                      />
                    </div>
                  )}

                  <div className="p-4 pb-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{memory.emotion}</span>
                      <span
                        className={`text-xs flex items-center gap-1 ${color.accent}`}
                      >
                        <Calendar size={14} />
                        {date}
                      </span>
                    </div>

                    <p
                      className={`text-gray-700 text-[15px] leading-snug mt-1 line-clamp-2`}
                    >
                      {memory.text || "（タイトルなし）"}
                    </p>

                    {(memory.prefecture || memory.city) && (
                      <div
                        className={`flex items-center gap-1 mt-3 text-sm text-gray-500`}
                      >
                        <MapPin size={14} />
                        <span>
                          {memory.prefecture ?? ""}
                          {memory.city ? ` ${memory.city}` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
      <Footer onTagManagerOpen={() => {}} />
    </>
  );
}

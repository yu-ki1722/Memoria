"use client";

import { useEffect, useState } from "react";
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs";
import { Loader2, ImageOff } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case "😊":
      return {
        border: "border-[#FACC15]",
        bg: "bg-[#FEF9C3]",
        text: "text-[#CA8A04]",
      };
    case "😂":
      return {
        border: "border-[#FB923C]",
        bg: "bg-[#FFF7ED]",
        text: "text-[#C2410C]",
      };
    case "😍":
      return {
        border: "border-[#F472B6]",
        bg: "bg-[#FDF2F8]",
        text: "text-[#BE185D]",
      };
    case "😢":
      return {
        border: "border-[#60A5FA]",
        bg: "bg-[#EFF6FF]",
        text: "text-[#1D4ED8]",
      };
    case "😮":
      return {
        border: "border-[#34D399]",
        bg: "bg-[#ECFDF5]",
        text: "text-[#047857]",
      };
    case "🤔":
      return {
        border: "border-[#A78BFA]",
        bg: "bg-[#F5F3FF]",
        text: "text-[#5B21B6]",
      };
    default:
      return {
        border: "border-gray-200",
        bg: "bg-white",
        text: "text-gray-700",
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
      transition: { staggerChildren: 0.08, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      <Header title="思い出一覧" />
      <main className="min-h-screen bg-[#fffdf8] p-6 relative pt-20 pb-20 md:pb-6">
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex gap-6">
          <div className="w-full">
            {loading ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
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
                className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6"
              >
                {memories.map((memory) => {
                  const colors = getEmotionColor(memory.emotion);
                  const hasImage = Boolean(memory.image_url);

                  return (
                    <motion.div
                      key={memory.id}
                      variants={cardVariants}
                      className="relative transition-transform duration-300 hover:scale-[1.03]"
                    >
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-16 h-4 bg-yellow-100/70 shadow-md z-10"
                        style={{
                          rotate: `${(memory.id % 5) - 2}deg`,
                          clipPath:
                            "polygon(5% 0, 95% 0, 100% 20%, 95% 40%, 100% 60%, 95% 80%, 100% 100%, 5% 100%, 0 80%, 5% 60%, 0 40%, 5% 20%)",
                          background:
                            "linear-gradient(180deg, rgba(253, 230, 138, 0.8), rgba(254, 249, 195, 0.9))",
                          boxShadow:
                            "inset 0 1px 2px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.15)",
                        }}
                      ></div>

                      <div
                        className={`w-full bg-white border ${colors.border} shadow-lg hover:shadow-xl transition-shadow rounded-sm overflow-hidden`}
                      >
                        <div className="p-4 pb-2">
                          {hasImage ? (
                            <img
                              src={memory.image_url!}
                              alt={memory.text}
                              className="w-full h-[200px] object-cover rounded-none"
                            />
                          ) : (
                            <div
                              className={`w-full h-[200px] flex flex-col items-center justify-center ${colors.bg} rounded-none`}
                            >
                              <ImageOff
                                className={`w-12 h-12 ${colors.text} opacity-30`}
                              />
                            </div>
                          )}
                        </div>

                        <div className="px-3 pb-4 bg-white flex flex-col items-center justify-center text-center">
                          <p
                            className={`text-lg font-[Caveat] tracking-wide ${colors.text} leading-snug text-center h-7 line-clamp-1`}
                          >
                            {memory.text || "（タイトルなし）"}
                          </p>
                          <div className="flex justify-between items-end w-full mt-2 text-sm text-gray-500">
                            <span className="text-lg">{memory.emotion}</span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(memory.created_at).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer onTagManagerOpen={() => {}} />
    </>
  );
}

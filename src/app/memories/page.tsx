"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs";
import {
  Loader2,
  ImageOff,
  Calendar,
  List,
  Columns2,
  LayoutGrid,
} from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MemoryDetailModal from "@/components/MemoryDetailModal";
import MemoriesListSearchModal from "@/components/MemoriesListSearchModal";

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
  tags: string[] | null;
};

type GroupedMemories = {
  [key: string]: Memory[];
};

export default function MemoriesPage() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<number>(1);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const [groupedMemories, setGroupedMemories] = useState<GroupedMemories>({});

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEmotions, setSearchEmotions] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchStartDate, setSearchStartDate] = useState<string>("");
  const [searchEndDate, setSearchEndDate] = useState<string>("");
  const [searchPrefecture, setSearchPrefecture] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchPlace, setSearchPlace] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    fetchSession();
  }, [supabase]);

  const fetchAllMemories = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setMemories(data as Memory[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session, supabase]);

  useEffect(() => {
    if (session) {
      fetchAllMemories();
    }
  }, [session, fetchAllMemories]);

  const handleFilterResults = (filteredData: Memory[]) => {
    setMemories(filteredData);
  };

  const handleSearchReset = useCallback(async () => {
    setSearchQuery("");
    setSearchEmotions([]);
    setSearchTags([]);
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchPrefecture("");
    setSearchCity("");
    setSearchPlace("");

    await fetchAllMemories();
  }, [fetchAllMemories]);

  useEffect(() => {
    if (memories.length === 0) {
      setGroupedMemories({});
      return;
    }

    const groups: GroupedMemories = {};

    memories.forEach((memory) => {
      const memoryDate = new Date(memory.created_at);
      const key = `${memoryDate.getFullYear()}年${memoryDate.getMonth() + 1}月`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(memory);
    });

    setGroupedMemories(groups);
  }, [memories]);

  const layoutOptions = [
    { value: 1, icon: List, label: "1列" },
    { value: 2, icon: Columns2, label: "2列" },
    { value: 4, icon: LayoutGrid, label: "4列" },
  ];

  const gridColsClass: { [key: number]: string } = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    4: "grid-cols-4",
  };

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
      <Header
        title="思い出一覧"
        rightActions={
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="思い出を検索"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              transform="scale(1.5)"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
                transform="translate(6.2, 6.3) scale(0.40)"
              />
            </svg>
          </button>
        }
      />

      <main className="min-h-screen bg-[#fffefb] pt-16 pb-24 px-4 relative">
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-20 pointer-events-none"></div>

        <div className="flex justify-end gap-2 sticky top-16 z-20 py-2">
          {layoutOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLayout(option.value)}
              aria-label={option.label}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${
                  layout === option.value
                    ? "bg-gray-800 text-white shadow"
                    : "text-gray-500 bg-white/70 backdrop-blur-sm shadow-md hover:bg-gray-100 hover:text-gray-700"
                }
              `}
            >
              <option.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

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
          <div className="flex flex-col gap-6">
            {Object.entries(groupedMemories).map(
              ([monthYear, monthMemories]) => (
                <section key={monthYear} className="pb-4">
                  <div
                    className={`
                      flex items-center gap-3 pb-4 pt-2
                      mx-auto transition-all duration-300
                      ${layout === 1 ? "max-w-md" : "max-w-5xl"}
                    `}
                  >
                    <h2 className="text-lg font-bold text-gray-700 whitespace-nowrap">
                      {monthYear}
                    </h2>
                    <span className="h-px flex-grow bg-gray-200"></span>
                  </div>

                  <motion.div
                    key={
                      monthYear + "_" + monthMemories.map((m) => m.id).join("-")
                    }
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className={`
                      mx-auto grid ${gridColsClass[layout]} 
                      ${layout === 4 ? "gap-2" : "gap-4"} 
                      transition-all duration-300
                      ${layout === 1 ? "max-w-md" : "max-w-5xl"}
                    `}
                  >
                    {monthMemories.map((memory) => {
                      const color = getEmotionColor(memory.emotion);
                      const hasImage = Boolean(memory.image_url);
                      const date = new Date(
                        memory.created_at
                      ).toLocaleDateString("ja-JP");
                      const isThumbnailView = layout === 4;

                      return (
                        <motion.div
                          key={memory.id}
                          variants={cardVariants}
                          onClick={() => setSelectedMemory(memory)}
                          className={`cursor-pointer ${
                            !isThumbnailView
                              ? `rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${color.bg}`
                              : "relative"
                          }`}
                        >
                          {hasImage ? (
                            memory.image_url?.match(
                              /\.(mp4|mov|webm|ogg)$/i
                            ) ? (
                              <video
                                src={memory.image_url!}
                                controls={!isThumbnailView}
                                playsInline
                                preload="metadata"
                                className={`w-full aspect-square object-cover bg-black ${
                                  isThumbnailView ? "rounded-lg shadow-md" : ""
                                }`}
                                onClick={(e) => {
                                  if (isThumbnailView) return;
                                  e.stopPropagation();
                                }}
                              />
                            ) : (
                              <img
                                src={memory.image_url!}
                                alt={memory.text}
                                className={`w-full aspect-square object-cover ${
                                  isThumbnailView ? "rounded-lg shadow-md" : ""
                                }`}
                              />
                            )
                          ) : (
                            <div
                              className={`relative aspect-square flex items-center justify-center ${
                                isThumbnailView
                                  ? `rounded-lg shadow-md ${color.bg}`
                                  : "bg-white/60"
                              }`}
                            >
                              <ImageOff
                                className={`w-10 h-10 ${color.accent} ${
                                  isThumbnailView ? "opacity-60" : "opacity-40"
                                }`}
                              />
                            </div>
                          )}

                          {!isThumbnailView && (
                            <div className="p-4 pb-5">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl flex-shrink-0">
                                  {memory.emotion}
                                </span>
                                <p className="text-gray-800 font-semibold text-lg leading-tight line-clamp-2">
                                  {memory.text || "（タイトルなし）"}
                                </p>
                              </div>

                              <div
                                className={`flex items-center gap-1 text-xs ${color.accent}`}
                              >
                                <Calendar size={14} />
                                <span className="font-medium">{date}</span>
                              </div>
                            </div>
                          )}

                          {isThumbnailView && (
                            <span
                              className="absolute -top-1 -left-1 text-xl z-10"
                              style={{
                                textShadow:
                                  "0px 2px 4px rgba(0, 0, 0, 0.2), 0px -1px 2px rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              {memory.emotion}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </section>
              )
            )}
          </div>
        )}

        <AnimatePresence>
          {selectedMemory && (
            <MemoryDetailModal
              memory={selectedMemory}
              onClose={() => setSelectedMemory(null)}
              getEmotionColor={getEmotionColor}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSearchOpen && (
            <MemoriesListSearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onFilterResults={handleFilterResults}
              supabase={supabase}
              query={searchQuery}
              setQuery={setSearchQuery}
              selectedEmotions={searchEmotions}
              setSelectedEmotions={setSearchEmotions}
              selectedTags={searchTags}
              setSelectedTags={setSearchTags}
              startDate={searchStartDate}
              setStartDate={setSearchStartDate}
              endDate={searchEndDate}
              setEndDate={setSearchEndDate}
              prefectureInput={searchPrefecture}
              setPrefectureInput={setSearchPrefecture}
              cityInput={searchCity}
              setCityInput={setSearchCity}
              placeInput={searchPlace}
              setPlaceInput={setSearchPlace}
              onReset={handleSearchReset}
            />
          )}
        </AnimatePresence>
      </main>
      <Footer onTagManagerOpen={() => {}} />
    </>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Place = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  photos?: { photo_reference: string }[];
};

export default function PlaceSearchModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const lat = 35.6812;
    const lng = 139.7671;

    try {
      const res = await fetch(
        `/api/searchPlaces?query=${input}&lat=${lat}&lng=${lng}`
      );
      const data = await res.json();

      console.log("Google API 検索結果:", data);
      setResults(data.results || []);
    } catch (err) {
      console.error("検索エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[1999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="
              fixed md:right-0 md:top-0 md:w-[400px] md:h-full
              bottom-0 w-full h-[70vh]
              bg-white rounded-t-2xl md:rounded-none shadow-xl
              z-[2000] flex flex-col
            "
            initial={{ y: "100%", opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring", damping: 25, stiffness: 200 },
            }}
            exit={{ y: "100%", opacity: 0 }}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">場所を検索</h2>
              <button onClick={onClose}>
                <X size={24} className="text-gray-600 hover:text-black" />
              </button>
            </div>

            {/* 検索バー */}
            <div className="p-4 flex gap-2 items-center border-b">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="場所名・住所を入力"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="
                  flex-1 px-3 py-2 border rounded-lg text-sm
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg"
              >
                検索
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <p className="text-gray-500">検索中...</p>}
              {!loading && results.length === 0 && (
                <p className="text-gray-400 text-sm">
                  検索結果がここに表示されます
                </p>
              )}
              {results.map((place) => (
                <div
                  key={place.place_id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-medium text-sm">{place.name}</p>
                  <p className="text-xs text-gray-500">
                    {place.formatted_address}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

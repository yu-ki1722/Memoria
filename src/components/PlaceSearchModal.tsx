"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Search, ArrowLeft } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
};

type Place = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
  rating?: number;
  photos?: { photo_reference: string }[];
  distance?: number;
};

export default function PlaceSearchModal({
  isOpen,
  onClose,
  onSelectPlace,
}: Props) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearch = async () => {
    if (!location) {
      setErrorMsg("位置情報を取得できませんでした");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const { lat, lng } = location;

    const hasSpecificLocation = /[都道府県市区町村]/.test(input);

    const url = input.trim()
      ? hasSpecificLocation
        ? `/api/searchPlaces?query=${encodeURIComponent(
            input
          )}&lat=${lat}&lng=${lng}`
        : `/api/searchPlaces?query=${encodeURIComponent(
            input
          )}&lat=${lat}&lng=${lng}&radius=2000`
      : `/api/searchPlaces?lat=${lat}&lng=${lng}&radius=1000`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      if (!data.results || data.results.length === 0) {
        setErrorMsg("該当する施設が見つかりませんでした");
        setResults([]);
        return;
      }

      const enriched: Place[] = data.results
        .map((p: Place) => {
          if (!p.geometry?.location) return p;
          const dx = p.geometry.location.lat - lat;
          const dy = p.geometry.location.lng - lng;
          const dist = Math.sqrt(dx * dx + dy * dy) * 111000;
          return { ...p, distance: Math.round(dist) };
        })
        .sort((a: Place, b: Place) => (a.distance ?? 0) - (b.distance ?? 0));

      setResults(enriched);
    } catch (err) {
      console.error("検索エラー:", err);
      setErrorMsg("検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      () => {
        setErrorMsg("現在地の取得に失敗しました");
      }
    );
  }, [isOpen]);

  useEffect(() => {
    if (!location) return;

    const timer = setTimeout(() => {
      if (input.trim()) {
        handleSearch();
      } else {
        handleSearch();
      }
    }, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, location]);

  useEffect(() => {
    if (isOpen && location && results.length === 0) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, location]);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  const DRAG_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 500;

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      info.offset.y > DRAG_THRESHOLD ||
      info.velocity.y > VELOCITY_THRESHOLD
    ) {
      onClose();
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
              z-[2000] flex flex-col overflow-hidden border-l border-gray-300
            "
            initial={
              isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }
            }
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.5,
                ease: "easeOut",
              },
            }}
            exit={
              isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }
            }
            {...(isMobile
              ? {
                  drag: "y",
                  dragConstraints: { top: 0 },
                  dragElastic: 0.1,
                  onDragEnd: handleDragEnd,
                }
              : {})}
          >
            {isMobile && (
              <div className="flex-shrink-0 flex justify-center items-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
            )}

            <div className="p-4 border-b border-gray-300 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Search size={20} className="text-memoria-secondary" />
                {selectedPlace ? "場所の詳細" : "場所検索"}
              </h2>
              <button onClick={onClose}>
                <X size={24} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <motion.div layout className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence mode="wait">
                {!selectedPlace ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative w-full mb-3">
                      <input
                        type="text"
                        placeholder="場所名・住所を入力（例：コンビニ）"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full px-4 py-3 pl-4 pr-14 border border-gray-300 rounded-full text-sm 
                                   focus:ring-2 focus:ring-memoria-secondary outline-none
                                   bg-gray-50 text-gray-800 placeholder:text-gray-500"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 
                                   bg-transparent hover:bg-gray-100 
                                   text-white text-sm font-semibold w-10 h-10 rounded-full transition-colors
                                   flex items-center justify-center"
                      >
                        <Search size={20} className="text-gray-700" />
                      </button>
                    </div>

                    {loading && <p className="text-gray-600">検索中...</p>}
                    {!loading && results.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        現在地付近の施設を取得中...
                      </p>
                    )}
                    {!loading &&
                      !errorMsg &&
                      results.map((place) => (
                        <motion.div
                          layoutId={place.place_id}
                          key={place.place_id}
                          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectPlace(place)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="font-medium text-sm text-gray-800">
                            {place.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {place.formatted_address}
                          </p>
                          {place.distance && !input.trim() && (
                            <p className="text-xs text-gray-500">
                              約 {place.distance}m
                            </p>
                          )}
                        </motion.div>
                      ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    layoutId={selectedPlace.place_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <button
                      onClick={() => setSelectedPlace(null)}
                      className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm"
                    >
                      <ArrowLeft size={16} /> 検索結果に戻る
                    </button>

                    <h3 className="text-xl font-semibold text-gray-800">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedPlace.formatted_address}
                    </p>

                    {selectedPlace.photos?.[0] && (
                      <motion.img
                        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${selectedPlace.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                        alt={selectedPlace.name}
                        className="rounded-lg w-full h-48 object-cover shadow-md"
                        layoutId={`${selectedPlace.place_id}-photo`}
                      />
                    )}

                    {selectedPlace.rating && (
                      <p className="text-yellow-600 font-semibold">
                        ⭐ {selectedPlace.rating}
                      </p>
                    )}

                    <div className="border-t border-gray-300 pt-4">
                      <button
                        onClick={() => {
                          onSelectPlace(selectedPlace);
                          onClose();
                        }}
                        className="bg-gray-700 hover:bg-gray-800 text-white text-base font-bold px-4 py-3 rounded-lg w-full transition-colors"
                      >
                        この場所に思い出を記録する
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

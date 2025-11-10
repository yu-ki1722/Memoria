"use client";
import Image from "next/image";
import Button from "./Button";
import { motion, type PanInfo } from "framer-motion";
import { ChevronDown, ChevronUp, X, Info } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  place: {
    lng: number;
    lat: number;
    name: string;
    address?: string;
    phone?: string | null;
    hours?: string[] | null;
    rating?: number | null;
    website?: string | null;
    googleMapUrl?: string | null;
    photoUrl?: string | null;
    placeId?: string;
  };
  onClose: () => void;
  onAddMemory: () => void;
};

export default function PlaceDetailModal({
  place,
  onClose,
  onAddMemory,
}: Props) {
  const uniqueKey = place.placeId || `${place.lat}-${place.lng}`;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <>
      <motion.div
        key={`${uniqueKey}-overlay`}
        className="fixed inset-0 bg-black/30 z-[1999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        onClick={onClose}
      />

      <motion.div
        key={`${uniqueKey}-panel`}
        className="
          fixed bottom-0 md:bottom-auto md:right-0
          w-full md:w-[420px] h-[70vh] md:h-full
          bg-white rounded-t-2xl md:rounded-none shadow-2xl  
          z-[2000] overflow-y-auto border-l border-black/10
          flex flex-col
        "
        initial={{
          x:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? "100%"
              : 0,
          y:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "100%"
              : 0,
        }}
        animate={{
          x: 0,
          y: 0,
        }}
        exit={{
          x:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? "100%"
              : 0,
          y:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "100%"
              : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 30,
        }}
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

        <div className="p-4 border-b border-black/10 flex items-center bg-white">
          {" "}
          <h2 className="text-lg font-semibold text-memoria-text flex items-center gap-2">
            {" "}
            <Info size={20} className="text-memoria-secondary" />
            場所の詳細
          </h2>
          <button onClick={onClose} className="ml-auto">
            <X
              size={24}
              className="text-memoria-text/60 hover:text-memoria-primary"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {place.photoUrl && (
            <Image
              src={place.photoUrl}
              alt={place.name}
              width={400}
              height={250}
              className="rounded-xl w-full h-48 object-cover mb-3 shadow-md border border-black/5"
            />
          )}

          <h2 className="text-2xl font-bold text-memoria-text">{place.name}</h2>
          {place.rating && (
            <p className="text-[#eb7791] font-semibold text-base flex items-center">
              {"★".repeat(Math.floor(place.rating))} {place.rating.toFixed(1)}
            </p>
          )}

          <div className="space-y-2 text-memoria-text/80 text-sm">
            {place.address && <p>{place.address}</p>}
            {place.phone && <p>📞 {place.phone}</p>}
          </div>

          {place.hours && place.hours.length > 0 && (
            <details className="mt-2 text-sm group">
              <summary className="cursor-pointer text-memoria-text/80 font-semibold flex items-center justify-between">
                営業時間
                <span className="group-open:hidden">
                  <ChevronDown size={18} />
                </span>
                <span className="group-open:block hidden">
                  <ChevronUp size={18} />
                </span>
              </summary>
              <ul className="text-xs text-memoria-text/80 mt-2 pl-4 list-disc space-y-1">
                {place.hours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="space-y-3 mt-4 pt-4 border-t border-black/5">
            {place.googleMapUrl && (
              <Button
                variant="gradient"
                className="w-full bg-gradient-to-r from-[#a8e0c4] to-[#8bc4ed] text-white rounded-full py-3 shadow-md"
                onClick={() => window.open(place.googleMapUrl!, "_blank")}
              >
                Googleマップで開く
              </Button>
            )}
            {place.website && (
              <Button
                variant="gradient"
                className="w-full bg-gradient-to-r from-[#D5B0ED] to-[#B099DD] text-white rounded-full py-3 shadow-md"
                onClick={() => window.open(place.website!, "_blank")}
              >
                公式サイト
              </Button>
            )}
          </div>

          {place.name !== "検索中..." && (
            <div className="mt-6 py-3 text-lg">
              <Button
                variant="gradient"
                className="w-full bg-gradient-to-r from-[#f9bbb6] to-[#E897A8] text-white rounded-full py-3 shadow-lg shadow-pink-200/50"
                onClick={onAddMemory}
              >
                この場所に思い出を記録する
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

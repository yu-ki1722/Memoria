"use client";
import Image from "next/image";
import Button from "./Button";

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
  };
  onClose: () => void;
  onAddMemory: () => void;
};

export default function PlaceDetailModal({
  place,
  onClose,
  onAddMemory,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1999]" onClick={onClose} />

      <div
        className="
        fixed bottom-0 md:bottom-auto md:right-0
        w-full md:w-[420px] h-[70vh] md:h-full
        bg-white rounded-t-2xl md:rounded-none shadow-2xl
        animate-slideUp md:animate-slideInRight
        z-[2000] overflow-y-auto
      "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-gray-900"
        >
          ×
        </button>

        <div className="p-6 mt-6 space-y-3">
          {place.photoUrl && (
            <Image
              src={place.photoUrl}
              alt={place.name}
              width={400}
              height={250}
              className="rounded-lg w-full h-48 object-cover mb-3"
            />
          )}

          <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>
          <p className="text-gray-600 text-sm">{place.address}</p>
          {place.phone && (
            <p className="text-sm text-gray-700">📞 {place.phone}</p>
          )}
          {place.rating && (
            <p className="text-yellow-600 font-semibold">⭐ {place.rating}</p>
          )}

          {place.hours && (
            <details className="mt-2">
              <summary className="text-sm cursor-pointer text-gray-800 font-semibold">
                営業時間
              </summary>
              <ul className="text-xs text-gray-600 mt-1">
                {place.hours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="space-y-1 mt-3">
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm block"
              >
                公式サイト
              </a>
            )}
            {place.googleMapUrl && (
              <a
                href={place.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold text-sm block"
              >
                Googleマップで開く
              </a>
            )}
          </div>

          {place.name !== "検索中..." && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">
                この場所に思い出を追加しますか？
              </p>
              <Button variant="primary" onClick={onAddMemory}>
                思い出を追加
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
          bg-memoria-background rounded-t-2xl md:rounded-none shadow-2xl
          animate-slideUp md:animate-slideInRight
          z-[2000] overflow-y-auto border-l border-black/10
        "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl font-light text-memoria-text/40 hover:text-memoria-primary transition-colors"
        >
          &times;
        </button>

        <div className="p-6 mt-8 space-y-4">
          {place.photoUrl && (
            <Image
              src={place.photoUrl}
              alt={place.name}
              width={400}
              height={250}
              className="rounded-lg w-full h-48 object-cover mb-3 shadow-md border border-black/5"
            />
          )}

          <h2 className="text-2xl font-bold text-memoria-text">{place.name}</h2>

          <div className="space-y-2">
            {place.address && (
              <p className="text-memoria-text/80 text-sm">{place.address}</p>
            )}
            {place.phone && (
              <p className="text-sm text-memoria-text/80">📞 {place.phone}</p>
            )}
            {place.rating && (
              <p className="text-yellow-600 font-semibold">⭐ {place.rating}</p>
            )}
          </div>

          {place.hours && (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-memoria-text/80 font-semibold">
                営業時間
              </summary>
              <ul className="text-xs text-memoria-text/60 mt-2 pl-4 list-disc">
                {place.hours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="space-y-2 mt-4 border-t border-black/10 pt-4">
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-memoria-secondary hover:text-memoria-secondary-dark font-semibold text-sm block transition-colors"
              >
                公式サイト →
              </a>
            )}
            {place.googleMapUrl && (
              <a
                href={place.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-memoria-primary hover:text-memoria-primary-dark font-semibold text-sm block transition-colors"
              >
                Googleマップで開く →
              </a>
            )}
          </div>

          {place.name !== "検索中..." && (
            <div className="mt-6 py-3 text-lg">
              <Button variant="primary" onClick={onAddMemory}>
                この場所に思い出を記録する
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

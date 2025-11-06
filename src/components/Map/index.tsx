"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Header from "../Header";
import MemoryForm from "../MemoryForm";
import Button from "../Button";
import CurrentLocationButton from "../CurrentLocationButton";
import RealtimeLocationMarker from "../RealtimeLocationMarker";
import MemoryPinIcon from "../MemoryPinIcon";
import PlaceDetailModal from "../PlaceDetailPanel";
import SearchButton from "../SearchButton";
import PlaceSearchModal from "../PlaceSearchModal";
import TagManagerModal from "../TagManagerModal";
import TagManagerButton from "../TagManagerButton";
import MemorySearchButton from "../MemorySearchButton";
import MemorySearchModal from "../MemorySearchModal";

const emotionStyles = {
  "😊": { bg: "bg-emotion-happy", shadow: "shadow-glow-happy" },
  "😂": { bg: "bg-emotion-laugh", shadow: "shadow-glow-laugh" },
  "😍": { bg: "bg-emotion-love", shadow: "shadow-glow-love" },
  "😢": { bg: "bg-emotion-sad", shadow: "shadow-glow-sad" },
  "😮": { bg: "bg-emotion-surprise", shadow: "shadow-glow-surprise" },
  "🤔": { bg: "bg-emotion-thinking", shadow: "shadow-glow-thinking" },
} as const;

const emotionGradientColors = {
  "😊": { start: "#FFD18E", end: "#FFA07A" },
  "😂": { start: "#ffff7aff", end: "#efffb6ff" },
  "😍": { start: "#FFB6C1", end: "#FF69B4" },
  "😢": { start: "#ADD8E6", end: "#87CEFA" },
  "😮": { start: "#afeeb0ff", end: "#7fff88ff" },
  "🤔": { start: "#D8BFD8", end: "#BA55D3" },
};

type Emotion = keyof typeof emotionStyles;

type Memory = {
  id: number;
  emotion: string;
  text: string;
  latitude: number;
  longitude: number;
  user_id: string;
  image_url: string | null;
  tags: string[] | null;
};

type ClickedPoi = {
  lng: number;
  lat: number;
  name: string;
  address?: string;
  rating?: number;
  photoUrl?: string | null;
  placeId?: string;
  phone?: string | null;
  hours?: string[];
  website?: string | null;
  googleMapUrl?: string | null;
};

type Place = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: { location: { lat: number; lng: number } };
  rating?: number;
  photos?: { photo_reference: string }[];
};

export default function MapWrapper({ session }: { session: Session }) {
  console.log("Mapbox Token:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemoryLocation, setNewMemoryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [editingMemory, setEditingMemory] = useState<number | null>(null);
  const [initialView, setInitialView] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [clickedPoi, setClickedPoi] = useState<ClickedPoi | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTagInputOpen, setIsTagInputOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isMemorySearchOpen, setIsMemorySearchOpen] = useState(false);
  const [filteredMemories, setFilteredMemories] = useState<Memory[] | null>(
    null
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setInitialView({
          latitude,
          longitude,
          zoom: 15,
        });
      },
      () => {
        console.warn("現在地取得に失敗しました。デフォルト位置を使用します。");
        setInitialView({
          latitude: 35.6895,
          longitude: 139.6917,
          zoom: 12,
        });
      }
    );
  }, []);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id);
      if (data) setMemories(data);
    };
    if (session) fetchMemories();
  }, [session]);

  useEffect(() => {
    if (newMemoryLocation) {
      mapRef.current?.flyTo({
        center: [newMemoryLocation.lng, newMemoryLocation.lat],
        zoom: 15,
        padding: { top: 400, bottom: 0, left: 0, right: 0 },
      });
    }
  }, [newMemoryLocation]);

  useEffect(() => {
    if (selectedMemory) {
      mapRef.current?.flyTo({
        center: [selectedMemory.longitude, selectedMemory.latitude],
        zoom: 15,
        padding: { top: 100, bottom: 0, left: 0, right: 0 },
      });
    }
  }, [selectedMemory]);

  useEffect(() => {
    if (editingMemory) {
      const memoryToEdit = memories.find((m) => m.id === editingMemory);
      if (memoryToEdit) {
        mapRef.current?.flyTo({
          center: [memoryToEdit.longitude, memoryToEdit.latitude],
          zoom: 15,
          padding: { top: 400, bottom: 0, left: 0, right: 0 },
        });
      }
    }
  }, [editingMemory, memories]);

  const handleSaveMemory = async (
    emotion: string,
    text: string,
    imageFile: File | null,
    tags: string[]
  ) => {
    if (!newMemoryLocation || !session) return;

    const fetchAddress = async (lat: number, lng: number) => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ja`;
      const res = await fetch(url);
      const data = await res.json();

      const context = data.features?.[0]?.context || [];
      const prefecture =
        context.find((c: { id: string }) => c.id.startsWith("region"))?.text ||
        "";
      const city =
        context.find((c: { id: string }) => c.id.startsWith("place"))?.text ||
        "";
      const placeName = data.features?.[0]?.text || "";

      return { prefecture, city, placeName };
    };

    const { prefecture, city, placeName } = await fetchAddress(
      newMemoryLocation!.lat,
      newMemoryLocation!.lng
    );

    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      const sanitizeFileName = (fileName: string) =>
        fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
      let finalName = sanitizeFileName(imageFile.name);
      if (finalName.startsWith(".")) finalName = `file${finalName}`;
      const filePath = `${session.user.id}/${Date.now()}-${finalName}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-images")
        .upload(filePath, imageFile);
      if (uploadError)
        return alert("画像アップロード失敗: " + uploadError.message);

      const { data: urlData } = supabase.storage
        .from("memory-images")
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const finalPlaceName =
      placeName && placeName.trim() !== "" ? placeName : null;

    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          emotion,
          text,
          user_id: session.user.id,
          image_url: imageUrl,
          latitude: newMemoryLocation!.lat,
          longitude: newMemoryLocation!.lng,
          tags,
          prefecture,
          city,
          place_name: finalPlaceName,
        },
      ])
      .select()
      .single();

    if (error) return alert("保存失敗: " + error.message);

    setMemories([...memories, data]);
    setNewMemoryLocation(null);
    alert("思い出を記録しました！");
  };

  const handleUpdateMemory = async (
    id: number,
    emotion: string,
    text: string,
    imageFile: File | null,
    imageWasCleared: boolean,
    tags: string[]
  ) => {
    const originalMemory = memories.find((m) => m.id === id);
    if (!originalMemory) return;

    let finalImageUrl: string | null = originalMemory.image_url;

    if (imageFile) {
      if (originalMemory.image_url) {
        const oldFilePath = originalMemory.image_url
          .split("/")
          .slice(-2)
          .join("/");
        await supabase.storage.from("memory-images").remove([oldFilePath]);
      }
      const sanitizeFileName = (fileName: string) =>
        fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
      let finalName = sanitizeFileName(imageFile.name);
      if (finalName.startsWith(".")) finalName = `file${finalName}`;
      const newFilePath = `${session.user.id}/${Date.now()}-${finalName}`;
      const { error: uploadError } = await supabase.storage
        .from("memory-images")
        .upload(newFilePath, imageFile);
      if (uploadError)
        return alert("画像アップロード失敗: " + uploadError.message);
      const { data: urlData } = supabase.storage
        .from("memory-images")
        .getPublicUrl(newFilePath);
      finalImageUrl = urlData.publicUrl;
    } else if (imageWasCleared && originalMemory.image_url) {
      const oldFilePath = originalMemory.image_url
        .split("/")
        .slice(-2)
        .join("/");
      await supabase.storage.from("memory-images").remove([oldFilePath]);
      finalImageUrl = null;
    }

    const { data, error } = await supabase
      .from("memories")
      .update({ text, emotion, image_url: finalImageUrl, tags: tags })
      .eq("id", id)
      .select()
      .single();

    if (error) return alert("更新失敗: " + error.message);

    setMemories(memories.map((m) => (m.id === id ? data : m)));
    setEditingMemory(null);
    alert("思い出を更新しました。");
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("この思い出を本当に削除しますか？")) return;

    const memoryToDelete = memories.find((memory) => memory.id === id);
    if (memoryToDelete?.image_url) {
      const filePath = memoryToDelete.image_url.split("/").slice(-2).join("/");
      await supabase.storage.from("memory-images").remove([filePath]);
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) return alert("削除失敗: " + error.message);

    setMemories(memories.filter((memory) => memory.id !== id));
    setSelectedMemory(null);
    alert("思い出を削除しました。");
  };

  const fetchGooglePlaceDetails = async (
    lat: number,
    lng: number,
    mapboxName: string
  ) => {
    const searchUrl = `/api/places?lat=${lat}&lng=${lng}&keyword=${encodeURIComponent(
      mapboxName
    )}`;

    try {
      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.status === "OK" && data.result) {
        const place = data.result;
        const photoRef = place.photos?.[0]?.photo_reference;
        const photoUrl = photoRef
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          : null;

        setClickedPoi({
          lng,
          lat,
          name: place.name ?? mapboxName,
          address: place.formatted_address ?? "住所情報なし",
          rating: place.rating ?? null,
          photoUrl,
          phone: place.formatted_phone_number ?? null,
          website: place.website ?? null,
          hours: place.opening_hours?.weekday_text ?? [],
          googleMapUrl: place.url ?? null,
        });
      } else {
        setClickedPoi({ lng, lat, name: mapboxName, address: "詳細情報なし" });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSelectPlace = async (place: Place) => {
    if (!place.geometry?.location) return;

    const { lat, lng } = place.geometry.location;
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16 });

    try {
      const res = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&keyword=${encodeURIComponent(
          place.name
        )}`
      );
      const data = await res.json();

      if (
        data?.status === "OK" &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        const detail = data.results[0];
        const photoRef = detail.photos?.[0]?.photo_reference;
        const photoUrl = photoRef
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          : null;
      } else {
        console.warn("Google API returned no results:", data);
      }
    } catch (error) {
      console.error("詳細取得エラー:", error);
    }
  };

  const handleMapClick = (event: MapMouseEvent) => {
    if (isTagInputOpen) {
      setIsTagInputOpen(false);
      return;
    }
    const map = mapRef.current?.getMap();
    if (!map) return;

    const targetElement = event.originalEvent.target as HTMLElement;
    if (targetElement?.closest(".mapboxgl-marker, .mapboxgl-popup")) return;

    const features = map.queryRenderedFeatures(event.point);
    const poi = features.find((f) => f.properties && f.properties.name);

    if (poi && poi.properties?.name) {
      const name = poi.properties.name as string;
      const { lng, lat } = event.lngLat;

      if (clickedPoi && clickedPoi.name === name) {
        setClickedPoi(null);
        return;
      }

      setClickedPoi(null);
      setTimeout(() => {
        setClickedPoi({
          lng,
          lat,
          name: "検索中...",
        });
        fetchGooglePlaceDetails(lat, lng, name);
      }, 0);

      setNewMemoryLocation(null);
      setSelectedMemory(null);
      setEditingMemory(null);
      return;
    }

    if (clickedPoi || selectedMemory || editingMemory || newMemoryLocation) {
      setClickedPoi(null);
      setSelectedMemory(null);
      setEditingMemory(null);
      setNewMemoryLocation(null);
      return;
    }

    const { lng, lat } = event.lngLat;
    setNewMemoryLocation({ lng, lat });
    setSelectedMemory(null);
    setClickedPoi(null);
  };

  const handleFilterResults = (filtered: Memory[]) => {
    setFilteredMemories(filtered);
  };

  const fetchAddress = async (lat: number, lng: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ja`;
    const res = await fetch(url);
    const data = await res.json();

    const context = data.features?.[0]?.context || [];
    const prefecture =
      context.find((c: { id: string }) => c.id.startsWith("region"))?.text ||
      "";
    const city =
      context.find((c: { id: string }) => c.id.startsWith("place"))?.text || "";
    const placeName = data.features?.[0]?.text || "";

    return { prefecture, city, placeName };
  };

  return (
    <>
      <Header session={session} />
      <SearchButton onClick={() => setIsSearchOpen(true)} />
      <PlaceSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPlace={handleSelectPlace}
      />
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
      <TagManagerButton onClick={() => setIsTagManagerOpen(true)} />
      <MemorySearchModal
        isOpen={isMemorySearchOpen}
        onClose={() => setIsMemorySearchOpen(false)}
        onFilterResults={(filtered) => {
          setMemories(filtered);
        }}
      />
      <MemorySearchButton onClick={() => setIsMemorySearchOpen(true)} />
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        {isLocating && (
          <div className="absolute top-0 left-0 w-full h-full z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            <p>現在地を取得中...</p>
          </div>
        )}
        {!initialView ? (
          <p className="absolute top-0 left-0 w-full h-full z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            現在地を取得中...
          </p>
        ) : (
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            ref={mapRef}
            initialViewState={initialView}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/yu-ki1722/cmh2dk0dm00el01srfg7yfpkt"
            onClick={handleMapClick}
          >
            <RealtimeLocationMarker />
            {memories.map((memory) => {
              const colors = emotionGradientColors[
                memory.emotion as Emotion
              ] || { start: "#CCCCCC", end: "#999999" };

              return (
                <Marker
                  key={`memory-${memory.id}`}
                  longitude={memory.longitude}
                  latitude={memory.latitude}
                  anchor="bottom"
                >
                  <div
                    className="w-10 h-10 cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedPoi(null);
                      setEditingMemory(null);
                      setSelectedMemory(memory);
                      setNewMemoryLocation(null);
                      setIsTagInputOpen(false);
                    }}
                  >
                    <MemoryPinIcon
                      startColor={colors.start}
                      endColor={colors.end}
                    />
                  </div>
                </Marker>
              );
            })}

            {selectedMemory && !editingMemory && (
              <Popup
                key={selectedMemory.id}
                longitude={selectedMemory.longitude}
                latitude={selectedMemory.latitude}
                onClose={() => setSelectedMemory(null)}
                anchor="bottom"
                className="memoria-popup"
              >
                {(() => {
                  const emotionKey = selectedMemory.emotion as Emotion;
                  const style = emotionStyles[emotionKey] || null;

                  return (
                    <div
                      className={`w-56 flex flex-col gap-2 rounded-lg animate-softAppear ${style.bg} ${style.shadow} p-4 pt-8 mt-4 relative`}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`w-12 h-12 rounded-full text-3xl flex items-center justify-center ${style.bg} ${style.shadow}`}
                        >
                          {selectedMemory.emotion}
                        </div>
                      </div>

                      {selectedMemory.image_url && (
                        <Image
                          src={selectedMemory.image_url}
                          alt={selectedMemory.text}
                          width={200}
                          height={150}
                          className="rounded-md object-cover w-full"
                        />
                      )}
                      <p className="text-gray-700 text-sm pb-8">
                        {selectedMemory.text}
                      </p>
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickedPoi(null);
                            setEditingMemory(selectedMemory.id);
                            setSelectedMemory(null);
                          }}
                          className="memoria-icon-button memoria-edit-button"
                          title="思い出を書き換える"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickedPoi(null);
                            handleDeleteMemory(selectedMemory.id);
                          }}
                          className="memoria-icon-button memoria-delete-button"
                          title="思い出を削除"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 1.75C9 1.336 9.336 1 9.75 1h4.5C14.664 1 15 1.336 15 1.75V3h5.25c.414 0 .75.336.75.75v1.5c0 .414-.336.75-.75.75H3.75a.75.75 0 0 1-.75-.75V3.75c0-.414.336-.75.75-.75H9V1.75zM4.5 7.5v12.75C4.5 21.216 5.284 22 6.25 22h11.5c.966 0 1.75-.784 1.75-1.75V7.5H4.5zM10 10.5a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5zm5.5 0a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </Popup>
            )}

            {editingMemory &&
              (() => {
                const memoryToEdit = memories.find(
                  (m) => m.id === editingMemory
                );
                if (!memoryToEdit) return null;
                return (
                  <Popup
                    longitude={memoryToEdit.longitude}
                    latitude={memoryToEdit.latitude}
                    onClose={() => setEditingMemory(null)}
                    anchor="bottom"
                    className="memoria-popup new-memory-popup"
                    data-emotion={memoryToEdit.emotion}
                  >
                    <MemoryForm
                      user={session.user}
                      onSave={(
                        emotion,
                        text,
                        imageFile,
                        imageWasCleared,
                        tags
                      ) =>
                        handleUpdateMemory(
                          memoryToEdit.id,
                          emotion,
                          text,
                          imageFile,
                          imageWasCleared,
                          tags
                        )
                      }
                      buttonText="更新"
                      initialEmotion={memoryToEdit.emotion}
                      initialText={memoryToEdit.text}
                      initialImageUrl={memoryToEdit.image_url}
                      initialTags={memoryToEdit.tags}
                      isTagInputOpen={isTagInputOpen}
                      setIsTagInputOpen={setIsTagInputOpen}
                      onCancel={() => setEditingMemory(null)}
                    />
                  </Popup>
                );
              })()}

            {newMemoryLocation && (
              <Popup
                key={`${newMemoryLocation.lat}-${newMemoryLocation.lng}`}
                longitude={newMemoryLocation.lng}
                latitude={newMemoryLocation.lat}
                onClose={() => setNewMemoryLocation(null)}
                anchor="bottom"
                className="memoria-popup new-memory-popup"
              >
                <MemoryForm
                  user={session.user}
                  onSave={(emotion, text, imageFile, imageWasCleared, tags) =>
                    handleSaveMemory(emotion, text, imageFile, tags)
                  }
                  buttonText="記録する"
                  isTagInputOpen={isTagInputOpen}
                  setIsTagInputOpen={setIsTagInputOpen}
                  onCancel={() => setNewMemoryLocation(null)}
                />
              </Popup>
            )}
            {clickedPoi && (
              <PlaceDetailModal
                place={clickedPoi}
                onClose={() => setClickedPoi(null)}
                onAddMemory={() => {
                  setNewMemoryLocation({
                    lng: clickedPoi.lng,
                    lat: clickedPoi.lat,
                  });
                  setClickedPoi(null);
                }}
              />
            )}
          </Map>
        )}
        <CurrentLocationButton mapRef={mapRef} setIsLocating={setIsLocating} />
      </div>
    </>
  );
}

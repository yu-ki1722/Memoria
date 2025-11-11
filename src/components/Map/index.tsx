"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Header from "../Header";
import Footer from "../Footer";
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
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const emotionStyles = {
  "😊": { bg: "bg-emotion-happy", shadow: "shadow-glow-happy" },
  "😂": { bg: "bg-emotion-laugh", shadow: "shadow-glow-laugh" },
  "😍": { bg: "bg-emotion-love", shadow: "shadow-glow-love" },
  "😢": { bg: "bg-emotion-sad", shadow: "shadow-glow-sad" },
  "😮": { bg: "bg-emotion-surprise", shadow: "shadow-glow-surprise" },
  "🤔": { bg: "bg-emotion-thinking", shadow: "shadow-glow-thinking" },
} as const;

const emotionColors = {
  "😊": "#FFBE98",
  "😂": "#FDEE93",
  "😍": "#FFAEC7",
  "😢": "#77C3EC",
  "😮": "#8DECB4",
  "🤔": "#BEAEE2",
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
  prefecture?: string | null;
  city?: string | null;
  place_name?: string | null;
  place_id?: string | null;
  place_address?: string | null;
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

type NewMemoryLocation = {
  lat: number;
  lng: number;
  placeId?: string;
  placeName?: string;
  placeAddress?: string;
};

const isStringVideo = (url: string | null | undefined) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".mov"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.endsWith(ext));
};

export default function MapWrapper({ session }: { session: Session }) {
  console.log("Mapbox Token:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemoryLocation, setNewMemoryLocation] =
    useState<NewMemoryLocation | null>(null);
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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newlyAddedPinId, setNewlyAddedPinId] = useState<number | null>(null);

  const [zoomedMediaUrl, setZoomedMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

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
        padding: {
          top: isMobile ? 650 : 400,
          bottom: isMobile ? 56 : 0,
          left: 0,
          right: 0,
        },
      });
    }
  }, [newMemoryLocation, isMobile]);

  useEffect(() => {
    if (selectedMemory) {
      mapRef.current?.flyTo({
        center: [selectedMemory.longitude, selectedMemory.latitude],
        zoom: 15,
        padding: {
          top: isMobile ? 350 : 100,
          bottom: isMobile ? 56 : 0,
          left: 0,
          right: 0,
        },
      });
    }
  }, [selectedMemory, isMobile]);

  useEffect(() => {
    if (editingMemory) {
      const memoryToEdit = memories.find((m) => m.id === editingMemory);
      if (memoryToEdit) {
        mapRef.current?.flyTo({
          center: [memoryToEdit.longitude, memoryToEdit.latitude],
          zoom: 15,
          padding: {
            top: isMobile ? 650 : 400,
            bottom: isMobile ? 56 : 0,
            left: 0,
            right: 0,
          },
        });
      }
    }
  }, [editingMemory, memories, isMobile]);

  useEffect(() => {
    if (newlyAddedPinId) {
      const timer = setTimeout(() => {
        setNewlyAddedPinId(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedPinId]);

  const handleSaveMemory = async (
    emotion: string,
    text: string,
    imageFile: File | null,
    tags: string[]
  ) => {
    if (!newMemoryLocation || !session) return;

    const { prefecture, city } = await fetchAddress(
      newMemoryLocation.lat,
      newMemoryLocation.lng
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
        return toast.error("画像アップロード失敗: " + uploadError.message);

      const { data: urlData } = supabase.storage
        .from("memory-images")
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    let finalPlaceId: string | null = null;
    let finalPlaceName: string | null = null;
    let finalPlaceAddress: string | null = null;

    if (newMemoryLocation.placeId) {
      finalPlaceId = newMemoryLocation.placeId;
      finalPlaceName = newMemoryLocation.placeName ?? null;
      finalPlaceAddress = newMemoryLocation.placeAddress ?? null;
    }
    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          emotion,
          text,
          user_id: session.user.id,
          image_url: imageUrl,
          latitude: newMemoryLocation.lat,
          longitude: newMemoryLocation.lng,
          tags,
          prefecture,
          city,
          place_name: finalPlaceName,
          place_id: finalPlaceId,
          place_address: finalPlaceAddress,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("保存失敗:", error);
      return toast.error("保存失敗: " + error.message);
    }

    setMemories([...memories, data]);
    setNewMemoryLocation(null);

    const centerPadding = isMobile
      ? { top: 56, bottom: 56, left: 0, right: 0 }
      : { top: 64, bottom: 0, left: 0, right: 0 };

    mapRef.current?.flyTo({
      center: [data.longitude, data.latitude],
      zoom: 16,
      padding: centerPadding,
      duration: 1000,
    });

    toast.success("思い出を記録しました！");

    setNewlyAddedPinId(data.id);
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
        return toast.error("画像アップロード失敗: " + uploadError.message);
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

    if (error) return toast.error("更新失敗: " + error.message);

    setMemories(memories.map((m) => (m.id === id ? data : m)));
    setEditingMemory(null);

    const centerPadding = isMobile
      ? { top: 56, bottom: 56, left: 0, right: 0 }
      : { top: 64, bottom: 0, left: 0, right: 0 };

    mapRef.current?.flyTo({
      center: [data.longitude, data.latitude],
      zoom: 16,
      padding: centerPadding,
      duration: 1000,
    });

    toast.success("思い出を更新しました。");
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("この思い出を本当に削除しますか？")) return;

    const memoryToDelete = memories.find((memory) => memory.id === id);
    if (memoryToDelete?.image_url) {
      const filePath = memoryToDelete.image_url.split("/").slice(-2).join("/");
      await supabase.storage.from("memory-images").remove([filePath]);
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) return toast.error("削除失敗: " + error.message);

    setMemories(memories.filter((memory) => memory.id !== id));
    setSelectedMemory(null);
    toast.success("思い出を削除しました。");
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

      if (data?.status !== "OK" || !data.result) {
        console.warn("No place data:", data);
        setClickedPoi({ lng, lat, name: mapboxName, address: "詳細情報なし" });
        return;
      }

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
        placeId: place.place_id ?? null,
        phone: place.formatted_phone_number ?? null,
        website: place.website ?? null,
        hours: place.opening_hours?.weekday_text ?? [],
        googleMapUrl: place.url ?? null,
      });
    } catch (err) {
      console.error("Error fetching Google place details:", err);
      setClickedPoi({
        lng,
        lat,
        name: mapboxName,
        address: "詳細の取得に失敗",
      });
    }
  };

  const handleSelectPlace = (place: Place) => {
    if (!place.geometry?.location) return;

    const { lat, lng } = place.geometry.location;

    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1000 });

    setNewMemoryLocation({
      lat,
      lng,
      placeId: place.place_id,
      placeName: place.name,
      placeAddress: place.formatted_address,
    });

    setIsSearchOpen(false);
    setClickedPoi(null);
    setSelectedMemory(null);
    setEditingMemory(null);
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

    const features = map.queryRenderedFeatures(event.point); // ★ POIの可能性があるフィーチャを "filter" で全て探し出す

    const poiFeatures = features.filter(
      (f) =>
        f.properties &&
        (f.properties.name || f.properties.name_ja || f.properties.name_en)
    );

    let poiName: string | null = null;
    let poi: mapboxgl.MapboxGeoJSONFeature | null = null;

    if (poiFeatures.length > 0) {
      poi = poiFeatures[0];
      poiName =
        poi.properties!.name ||
        poi.properties!.name_ja ||
        poi.properties!.name_en;
    }

    if (poi && poiName) {
      const { lng, lat } = event.lngLat;

      if (clickedPoi && clickedPoi.name === poiName) {
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
        fetchGooglePlaceDetails(lat, lng, poiName!);
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

  const handleTagManagerClick = () => {
    if (isMobile) {
      router.push("/tag-manager");
    } else {
      setIsTagManagerOpen(true);
    }
  };

  const handleFilterResults = (filtered: Memory[]) => {
    setFilteredMemories(filtered);
  };

  const fetchAddress = async (lat: number, lng: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ja`;
    const res = await fetch(url);
    const data = await res.json();

    const feature = data.features?.[0];
    const context = feature?.context || [];

    const prefecture =
      context.find((c: { id: string }) => c.id.startsWith("region"))?.text ||
      "";

    let city = "";

    const place =
      context.find((c: { id: string }) => c.id.startsWith("place"))?.text || "";

    if (prefecture === "東京都" && place === "東京都") {
      city =
        context.find((c: { id: string }) => c.id.startsWith("district"))
          ?.text ||
        context.find((c: { id: string }) => c.id.startsWith("locality"))
          ?.text ||
        "";
    } else {
      city = place;
    }

    if (!city && feature?.place_type?.includes("place")) {
      city = feature.text;
    }
    if (!city) {
      city =
        context.find((c: { id: string }) => c.id.startsWith("district"))
          ?.text ||
        context.find((c: { id: string }) => c.id.startsWith("locality"))
          ?.text ||
        "";
    }
    if (
      city &&
      !city.endsWith("市") &&
      !city.endsWith("区") &&
      feature?.text &&
      (feature.text.endsWith("市") || feature.text.endsWith("区"))
    ) {
      city = feature.text;
    }

    return { prefecture, city };
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <Header
        title="Memoria"
        rightActions={
          <>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-memoria-text hover:text-memoria-secondary-dark transition"
            >
              <Search className="w-6 h-6" />
            </button>

            {session && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="
                    w-10 h-10 rounded-full bg-memoria-secondary text-white 
                    flex items-center justify-center font-bold text-lg 
                    hover:scale-105 transition-transform
                  "
                >
                  {session?.user?.email?.[0]?.toUpperCase() ?? "?"}
                </button>

                {isMenuOpen && (
                  <div
                    className="
                      absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-30 
                      overflow-hidden border border-gray-100
                    "
                  >
                    <div className="p-3 border-b text-sm text-gray-600">
                      {session?.user?.email ?? "No email"}
                    </div>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/");
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-memoria-secondary hover:text-white transition"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        }
      />
      <PlaceSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPlace={handleSelectPlace}
      />
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
      <TagManagerButton
        onClick={handleTagManagerClick}
        className="hidden md:block"
      />
      <MemorySearchModal
        isOpen={isMemorySearchOpen}
        onClose={() => setIsMemorySearchOpen(false)}
        onFilterResults={(filtered) => {
          setMemories(filtered);
        }}
      />
      <MemorySearchButton onClick={() => setIsMemorySearchOpen(true)} />
      <div className="relative w-full h-[calc(100vh-112px)] mt-14 md:mt-0 md:h-[calc(100vh-64px)]">
        {isLocating && (
          <div className="absolute inset-0 z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            <p>現在地を取得中...</p>
          </div>
        )}
        {!initialView ? (
          <div className="absolute inset-0 z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            現在地を取得中...
          </div>
        ) : (
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            ref={mapRef}
            initialViewState={initialView}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/yu-ki1722/cmh2dk0dm00el01srfg7yfpkt"
            onLoad={() => {
              if (mapRef.current) {
                const map = mapRef.current.getMap();
                map.setLanguage("ja");
                map.setConfigProperty("basemap", "showPlaceLabels", false);
                map.setConfigProperty("basemap", "showTransitLabels", false);
                map.setConfigProperty("basemap", "showRoadLabels", false);
              }
            }}
            onClick={handleMapClick}
          >
            <RealtimeLocationMarker />
            {memories.map((memory) => {
              const color =
                emotionColors[memory.emotion as Emotion] || "#999999";

              const isNew = newlyAddedPinId === memory.id;

              return (
                <Marker
                  key={`memory-${memory.id}`}
                  longitude={memory.longitude}
                  latitude={memory.latitude}
                  anchor="bottom"
                >
                  <div
                    className={`
                      w-10 h-10 cursor-pointer transition-transform duration-300 ease-out 
                      ${
                        isMobile && selectedMemory?.id === memory.id
                          ? "scale-125"
                          : "hover:scale-110"
                      }
                      ${isNew ? "animate-pin-drop" : ""}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedPoi(null);
                      setEditingMemory(null);
                      setSelectedMemory(memory);
                      setNewMemoryLocation(null);
                      setIsTagInputOpen(false);
                    }}
                  >
                    <MemoryPinIcon color={color} />
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
                      className={`relative w-64 rounded-xl p-4 pt-10 
                        ${
                          style ? `${style.bg} ${style.shadow}` : "bg-gray-200"
                        }`}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`w-16 h-16 rounded-full text-4xl flex items-center justify-center 
                            ${
                              style
                                ? `${style.bg} ${style.shadow}`
                                : "bg-gray-200"
                            }`}
                        >
                          {selectedMemory.emotion}
                        </div>
                      </div>

                      {selectedMemory.image_url &&
                        (isStringVideo(selectedMemory.image_url) ? (
                          <video
                            src={selectedMemory.image_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="rounded-lg w-full aspect-video object-cover mb-3 cursor-pointer"
                            onClick={() =>
                              setZoomedMediaUrl(selectedMemory.image_url)
                            }
                          />
                        ) : (
                          <Image
                            src={selectedMemory.image_url}
                            alt={selectedMemory.text}
                            width={256}
                            height={144}
                            className="rounded-lg w-full aspect-video object-cover mb-3 cursor-pointer"
                            onClick={() =>
                              setZoomedMediaUrl(selectedMemory.image_url)
                            }
                          />
                        ))}

                      <p className="text-gray-800 text-base leading-relaxed mb-3 break-words text-center">
                        {selectedMemory.text}
                      </p>
                      {(selectedMemory.prefecture ||
                        selectedMemory.city ||
                        selectedMemory.place_name) && (
                        <div className="text-center text-xs text-gray-600/70 mb-3">
                          <span>
                            {selectedMemory.prefecture
                              ? `${selectedMemory.prefecture} `
                              : ""}
                            {selectedMemory.city
                              ? `${selectedMemory.city} `
                              : ""}
                            {selectedMemory.place_name
                              ? `｜${selectedMemory.place_name}`
                              : ""}
                          </span>
                        </div>
                      )}

                      {selectedMemory.tags &&
                        selectedMemory.tags.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {selectedMemory.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-white/60 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickedPoi(null);
                            setEditingMemory(selectedMemory.id);
                            setSelectedMemory(null);
                          }}
                          className="memoria-icon-button memoria-edit-button text-gray-700 hover:bg-black/10"
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
                          className="memoria-icon-button memoria-delete-button text-gray-700 hover:bg-black/10"
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
                    offset={25}
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
                offset={25}
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
            <AnimatePresence>
              {clickedPoi && (
                <PlaceDetailModal
                  place={clickedPoi}
                  onClose={() => setClickedPoi(null)}
                  onAddMemory={() => {
                    if (!clickedPoi || !clickedPoi.placeId) {
                      console.warn(
                        "❌ placeId missing in clickedPoi:",
                        clickedPoi
                      );
                      return;
                    }
                    setNewMemoryLocation({
                      lng: clickedPoi.lng,
                      lat: clickedPoi.lat,
                      placeId: clickedPoi.placeId,
                      placeName: clickedPoi.name,
                      placeAddress: clickedPoi.address,
                    });
                    setClickedPoi(null);
                  }}
                />
              )}
            </AnimatePresence>
          </Map>
        )}
        <CurrentLocationButton mapRef={mapRef} setIsLocating={setIsLocating} />
      </div>
      <Footer onTagManagerOpen={handleTagManagerClick} />{" "}
      <AnimatePresence>
        {zoomedMediaUrl && (
          <motion.div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-stone-100/80 backdrop-blur-sm"
            onClick={() => setZoomedMediaUrl(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {isStringVideo(zoomedMediaUrl) ? (
                <video
                  src={zoomedMediaUrl}
                  autoPlay
                  controls
                  playsInline
                  className="rounded-xl shadow-2xl object-contain max-w-[90vw] max-h-[80vh]"
                />
              ) : (
                <Image
                  src={zoomedMediaUrl}
                  alt="拡大画像"
                  width={1200}
                  height={900}
                  className="rounded-xl shadow-2xl object-contain max-w-[90vw] max-h-[80vh]"
                />
              )}

              <motion.button
                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:bg-white transition-colors"
                onClick={() => setZoomedMediaUrl(null)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, scale: 0.5 }}
                title="画像を閉じる"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

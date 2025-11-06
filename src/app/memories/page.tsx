"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createClientComponentClient,
  type Session,
} from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

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
  const [session, setSession] = useState<Session | null>(null); // ✅ ← anyをSession型に変更
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

        if (error && Object.keys(error).length > 0) {
          console.error("思い出取得エラー:", error);
        } else if (data) {
          setMemories(data);
        }
      } catch (err) {
        console.error("通信エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [session, supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">思い出一覧</h1>
          <Link href="/map">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition">
              🌏 マップに戻る
            </button>
          </Link>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer group overflow-hidden"
              >
                {memory.image_url ? (
                  <img
                    src={memory.image_url}
                    alt={memory.text}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-5xl bg-gray-100">
                    {memory.emotion}
                  </div>
                )}

                <div className="p-4">
                  <p className="font-medium text-gray-800 line-clamp-2 mb-1">
                    {memory.text || "（本文なし）"}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span>{memory.prefecture ?? ""}</span>
                    <span>{memory.city ?? ""}</span>
                  </div>

                  {memory.facility && (
                    <p className="text-xs text-gray-400 truncate mb-1">
                      📍 {memory.facility}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    {new Date(memory.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

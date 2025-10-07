// src/app/login/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0", // 背景色を少しつけて見やすくします
      }}
    >
      <div style={{ width: "320px" }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["github"]} // GitHubログインを使わない場合はこの行を削除
        />
      </div>
    </div>
  );
}

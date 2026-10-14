"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="sign-out-button" disabled={isSigningOut} onClick={signOut} type="button">
      {isSigningOut ? "Đang thoát..." : "Đăng xuất"}
    </button>
  );
}

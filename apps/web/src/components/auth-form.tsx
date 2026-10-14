"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result =
        mode === "register"
          ? await authClient.signUp.email({
              email,
              password,
              name: String(formData.get("name") ?? "").trim(),
            })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(
          mode === "register"
            ? "Không thể tạo tài khoản. Email có thể đã được sử dụng."
            : "Email hoặc mật khẩu không chính xác.",
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="auth-brand" href="/">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>Gia Sản</span>
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">{isRegister ? "Bắt đầu quản lý" : "Chào mừng trở lại"}</p>
          <h1>{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h1>
          <p>
            {isRegister
              ? "Dữ liệu của bạn mặc định là riêng tư."
              : "Truy cập tài sản và lịch sử của bạn."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label>
              Tên hiển thị
              <input
                autoComplete="name"
                maxLength={160}
                name="name"
                placeholder="Nguyễn Minh Anh"
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              autoComplete="email"
              inputMode="email"
              maxLength={320}
              name="email"
              placeholder="ban@example.com"
              required
              type="email"
            />
          </label>

          <label>
            Mật khẩu
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              name="password"
              placeholder="Tối thiểu 8 ký tự"
              required
              type="password"
            />
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Đang xử lý..."
              : isRegister
                ? "Tạo tài khoản"
                : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </Link>
        </p>
      </section>

      <aside className="auth-context">
        <p className="eyebrow">Không gian riêng của bạn</p>
        <h2>Mọi tài sản, giấy tờ và lịch sử trong một nơi.</h2>
        <ul>
          <li>Riêng tư theo mặc định</li>
          <li>Có thể tự lưu trữ dữ liệu</li>
          <li>Sẵn sàng mở rộng cho gia đình</li>
        </ul>
      </aside>
    </main>
  );
}

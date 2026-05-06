"use client"
import Link from "next/link";
import { use, useState } from "react";
import { loginApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await loginApi(account, password);
            if (res.success) {
                setSuccess("登入成功！");
                localStorage.setItem("userName", res.user.User_Name); // 假設後端回傳 user.User_Name
                router.push("/myWardrobe/1-1");
            } else {
                setError(res.message || "登入失敗");
            }
        } catch (err) {
            setError("伺服器錯誤");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex h-full flex-col items-center bg-base-100 px-5 pb-8 pt-12">
            <header>
                <h1 className="text-center text-[84px] font-semibold leading-none tracking-tight text-black mt-20">
                    我衫咧
                </h1>
                <p className="mt-2 text-center text-[44px] leading-none tracking-tight text-black">
                    gua sánn leh
                </p>
            </header>

            <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-[90%] border p-4 mt-28">
                    <legend className="fieldset-legend text-lg font-bold">Login</legend>

                    <label className="label">Email</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="Email"
                        value={account}
                        onChange={e => setAccount(e.target.value)}
                        required
                    />

                    <label className="label">Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <button className="btn btn-neutral mt-4" type="submit" disabled={loading}>
                        {loading ? "登入中..." : "Login"}
                    </button>
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                    {success && <div className="text-green-600 mt-2">{success}</div>}
                </fieldset>
            </form>

            <p className="mt-4 text-sm text-base-content/70">
                尚未登入？
                <Link href="/registration" className="ml-1 underline underline-offset-4 hover:text-base-content">
                    點此註冊
                </Link>
            </p>
        </main>
    );
}


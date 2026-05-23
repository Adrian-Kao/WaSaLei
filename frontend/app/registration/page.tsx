"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi } from "@/lib/api/auth";

export default function RegistrationPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await registerApi(name, account, password);
            if (res.success) {
                setSuccess("Register success. Please log in.");
            } else {
                setError(res.message || "Register failed");
            }
        } catch (err) {
            setError("Please try again later");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex h-full flex-col items-center bg-base-100 px-5 pb-8 pt-12">
            <header>
                <h1 className="text-center text-[84px] font-semibold leading-none tracking-tight text-black mt-20">
                    WaSaLei
                </h1>
                <p className="mt-2 text-center text-[44px] leading-none tracking-tight text-black">
                    gua sann leh
                </p>
            </header>

            <form onSubmit={handleRegister} className="w-full flex flex-col items-center">
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-[90%] border p-4 mt-28">
                    <legend className="fieldset-legend text-lg font-bold">Registration</legend>

                    <label className="label">Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />

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
                        {loading ? "Registering..." : "Register"}
                    </button>
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                    {success && <div className="text-green-600 mt-2">{success}</div>}
                    <span
                        className="block mt-4 text-black hover:underline cursor-pointer text-center select-none"
                        onClick={() => router.push("/login")}
                    >
                        Back to login
                    </span>
                </fieldset>
            </form>
        </main>
    );
}

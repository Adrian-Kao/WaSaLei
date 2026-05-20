"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/store";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

type UserInfo = {
    User_ID: number;
    User_Name: string;
    User_Account: string;
    Password: string;
};


type UserDataType = {
    success: boolean;
    status: string;
    data: UserInfo;
};

export default function MyAccountPage() {
    const userId = useUserStore((state) => state.userId);
    const [UserData, setUserData] = useState<UserDataType | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState("");

    async function handleChangePassword() {
        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/auth/${userId}/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        oldPassword,
                        newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                setMessage("密碼修改成功");
                await fetchUser();
                setOldPassword("");
                setNewPassword("");
                setShowModal(false);
            } else {
                setMessage(data.message || "修改失敗");
            }
        } catch (error) {
            setMessage("伺服器錯誤");
        }
    }

    async function fetchUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}`);

            const data = await response.json();

            console.log("完整data:", data);

            setUserData(data);
        } catch (error) {
            console.error("取得使用者資料失敗", error);
        }
    }


    useEffect(() => {
        if (!userId) return;
        fetchUser();
    }, [userId]);
    return (
        <main className="flex h-[90%] flex-col items-center bg-base-100 px-6 pb-32 pt-10 text-black">
            <div className="avatar mt-4">
                <div className="w-50 rounded-full bg-base-300">
                    <img
                        src="https://img.daisyui.com/images/profile/demo/batperson@192.webp"
                        alt="profile avatar"
                    />
                </div>
            </div>

            <h1 className="mt-5 text-3xl font-medium">
                {UserData?.data.User_Name || "載入中"}
            </h1>

            <section className="mt-28 w-full max-w-xs space-y-8 text-2xl">
                <p>帳號：{UserData?.data.User_Account}</p>
                <p>密碼：{UserData?.data.Password}</p>
            </section>

            <button
                onClick={() => setShowModal(true)}
                className="btn btn-neutral btn-outline mt-24 h-15 w-40 text-2xl font-medium"
            >
                修改密碼
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-2xl font-bold">修改密碼</h2>

                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="舊密碼"
                                className="input input-bordered w-full"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />

                            <input
                                type="password"
                                placeholder="新密碼"
                                className="input input-bordered w-full"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        {message && (
                            <p className="mt-3 text-sm text-red-500">
                                {message}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowModal(false)}
                            >
                                取消
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                            >
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}


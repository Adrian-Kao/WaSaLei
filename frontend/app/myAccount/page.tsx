"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/store";
import { apiFetch } from "@/lib/api/api-client";

type UserInfo = {
    User_ID: number;
    User_Name: string;
    User_Account: string;
};

type UserDataType = {
    success: boolean;
    status: string;
    data: UserInfo;
};

export default function MyAccountPage() {
    const userId = useUserStore((state: any) => state.userId);
    const [UserData, setUserData] = useState<UserDataType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleChangePassword() {
        try {
            const response = await apiFetch(`/api/auth/${userId}/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Password changed");
                await fetchUser();
                setOldPassword("");
                setNewPassword("");
                setShowModal(false);
            } else {
                setMessage(data.message || "Password change failed");
            }
        } catch (error) {
            setMessage("Please try again later");
        }
    }

    async function fetchUser() {
        try {
            const response = await apiFetch(`/api/user/${userId}`);
            const data = await response.json();
            console.log("User data:", data);
            setUserData(data);
        } catch (error) {
            console.error("Failed to get user data", error);
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
                {UserData?.data.User_Name || "Not logged in"}
            </h1>

            <section className="mt-28 w-full max-w-xs space-y-8 text-2xl">
                <p>Account: {UserData?.data.User_Account}</p>
                <p>Password: *******</p>
            </section>

            <button
                onClick={() => setShowModal(true)}
                className="btn btn-neutral btn-outline mt-24 h-15 w-40 text-2xl font-medium"
            >
                Change password
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-2xl font-bold">Change password</h2>

                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="Old password"
                                className="input input-bordered w-full"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />

                            <input
                                type="password"
                                placeholder="New password"
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
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

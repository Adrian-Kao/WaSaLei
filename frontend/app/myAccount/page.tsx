export default function MyAccountPage() {
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

            <h1 className="mt-5 text-3xl font-medium">許先生</h1>

            <section className=" mt-28 w-full max-w-xs space-y-8 text-2xl">
                <p>帳號：1234567</p>
                <p>密碼：**********</p>
            </section>

            <button className="btn btn-neutral btn-outline mt-24 h-15 w-40 text-2xl font-medium">
                修改密碼
            </button>
        </main>
    );
}


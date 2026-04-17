import Link from "next/link";

export default function LoginPage() {
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


            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-[90%] border p-4 mt-28">
                <legend className="fieldset-legend text-lg font-bold">Login</legend>

                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Email"  />

                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Password" />

                <button className="btn btn-neutral mt-4">Login</button>
            </fieldset>

            <p className="mt-4 text-sm text-base-content/70">
                尚未登入？
                <Link href="/registration" className="ml-1 underline underline-offset-4 hover:text-base-content">
                    點此註冊
                </Link>
            </p>

        </main>
    );
}


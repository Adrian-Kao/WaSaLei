"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PATHS = new Set(["/login", "/registration"]);

export default function Menu() {
	const pathname = usePathname();
	const shouldShowTabs = !HIDDEN_PATHS.has(pathname);
	const isMyWardrobe = pathname.startsWith("/myWardrobe");
	const isMyOutfits = pathname.startsWith("/myOutfits");
	const isLuggagePacking = pathname.startsWith("/luggagePacking");
	const isMyAccount = pathname.startsWith("/myAccount");

	if (!shouldShowTabs) {
		return null;
	}

	return (
		<div role="tablist" className="tabs tabs-box absolute inset-x-0 bottom-0 h-[10%] w-full rounded-none bg-base-300 p-1">
			<Link
				href="/myWardrobe/1-1"
				className={`tab h-full flex-1 rounded-xl border-0 text-base ${isMyWardrobe ? "bg-base-100 text-base-content font-semibold" : "text-base-content/60"}`}
			>
				我的衣櫃
			</Link>
			<Link
				href="/myOutfits"
				className={`tab h-full flex-1 rounded-xl border-0 text-base ${isMyOutfits ? "bg-base-100 text-base-content font-semibold" : "text-base-content/60"}`}
			>
				我的穿搭
			</Link>
			<Link
				href="/luggagePacking"
				className={`tab h-full flex-1 rounded-xl border-0 text-base ${isLuggagePacking ? "bg-base-100 text-base-content font-semibold" : "text-base-content/60"}`}
			>
				一鍵打包
			</Link>
			<Link
				href="/myAccount"
				className={`tab h-full flex-1 rounded-xl border-0 text-base ${isMyAccount ? "bg-base-100 text-base-content font-semibold" : "text-base-content/60"}`}
			>
				我的帳號
			</Link>
		</div>
	);
}

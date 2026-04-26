import { useMemo } from "react";

// TODO: 接上 zustand 後，改成從 store selector 讀取目前房間。
export function useCurrentRoom() {
	return useMemo(() => "台北宿舍", []);
}

"use client";

export default function CameraCapturePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  }

  async function handleUploadAndNext() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const res = await import("@/lib/api/outfits");
      const result = await res.uploadOutfitImage(selectedFile);
      if (result && result.url) {
        // 跳轉到 createOutfits，帶上圖片 url
        router.push(`/myOutfits/createOutfits?imageUrl=${encodeURIComponent(result.url)}`);
      }
    } catch (e) {
      alert("圖片上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-base-100 px-4 pb-8 pt-8 text-black">
      <div className="mt-20 rounded-3xl bg-base-300 p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-base-300">
          {previewUrl ? (
            <img src={previewUrl} alt="預覽" className="object-contain w-full h-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-medium">圖片暫存區域</div>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-[2fr_1fr] gap-3 px-4">
        <label className="btn btn-outline btn-primary h-14 rounded-2xl text-3xl font-medium shadow-sm cursor-pointer">
          上傳圖檔
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>

        <button
          type="button"
          className="btn btn-outline btn-primary h-14 rounded-2xl text-3xl font-medium shadow-sm"
          disabled={!selectedFile || uploading}
          onClick={handleUploadAndNext}
        >
          {uploading ? "上傳中..." : "確認"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Offset = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originOffset: Offset;
};

export default function CameraCapturePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  const baseScale = useMemo(() => {
    if (!imageSize || viewportSize === 0) {
      return 1;
    }

    return Math.max(viewportSize / imageSize.width, viewportSize / imageSize.height);
  }, [imageSize, viewportSize]);

  const renderedWidth = imageSize ? imageSize.width * baseScale * zoom : 0;
  const renderedHeight = imageSize ? imageSize.height * baseScale * zoom : 0;

  const clampOffset = useCallback(
    (nextOffset: Offset, nextZoom: number) => {
      if (!imageSize || viewportSize === 0) {
        return { x: 0, y: 0 };
      }

      const scaledWidth = imageSize.width * baseScale * nextZoom;
      const scaledHeight = imageSize.height * baseScale * nextZoom;
      const maxX = Math.max(0, (scaledWidth - viewportSize) / 2);
      const maxY = Math.max(0, (scaledHeight - viewportSize) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
      };
    },
    [baseScale, imageSize, viewportSize],
  );

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const target = viewportRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const nextSize = Math.floor(Math.min(entry.contentRect.width, entry.contentRect.height));
      setViewportSize(nextSize);
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setOffset((previous) => clampOffset(previous, zoom));
  }, [clampOffset, zoom]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return objectUrl;
    });

    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const image = new window.Image();
    image.onload = () => {
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = objectUrl;
  }

  function handleZoomChange(nextZoom: number) {
    const clampedZoom = Math.min(4, Math.max(1, nextZoom));
    setZoom(clampedZoom);
    setOffset((previous) => clampOffset(previous, clampedZoom));
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!previewUrl) {
      return;
    }

    event.preventDefault();
    const step = event.deltaY < 0 ? 0.08 : -0.08;
    handleZoomChange(zoom + step);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!previewUrl) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originOffset: offset,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const nextOffset = {
      x: dragState.originOffset.x + dx,
      y: dragState.originOffset.y + dy,
    };

    setOffset(clampOffset(nextOffset, zoom));
  }

  function clearDragState(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("圖片讀取失敗"));
      image.src = url;
    });
  }

  function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("圖片輸出失敗"));
          return;
        }

        resolve(blob);
      }, "image/png");
    });
  }

  async function handleConfirm() {
    if (!previewUrl || !imageSize || viewportSize === 0) {
      return;
    }

    try {
      const outputSize = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const image = await loadImage(previewUrl);
      const ratio = outputSize / viewportSize;
      const drawWidth = imageSize.width * baseScale * zoom * ratio;
      const drawHeight = imageSize.height * baseScale * zoom * ratio;
      const drawX = outputSize / 2 - drawWidth / 2 + offset.x * ratio;
      const drawY = outputSize / 2 - drawHeight / 2 + offset.y * ratio;

      context.clearRect(0, 0, outputSize, outputSize);
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const blob = await canvasToBlob(canvas);
      const outputFile = new File([blob], "wardrobe-icon.png", { type: "image/png" });

      // TODO: 接上 API 時，將 outputFile 送出後端。
      console.log("1:1 圖片已準備好", outputFile);
    } catch {}
  }

  return (
    <div className="flex h-full flex-col bg-base-100 px-4 pb-8 pt-8 text-black">
      <div className="mt-20 rounded-3xl bg-base-300 p-4">
        <div
          ref={viewportRef}
          className="relative aspect-square w-full overflow-hidden rounded-3xl bg-base-300"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={clearDragState}
          onPointerCancel={clearDragState}
        >
          {previewUrl && imageSize ? (
            <img
              src={previewUrl}
              alt="上傳預覽"
              draggable={false}
              className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none ${dragRef.current ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                width: renderedWidth,
                height: renderedHeight,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-medium">圖片暫存區域</div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="上傳圖片"
      />

      <div className="mt-auto grid grid-cols-[2fr_1fr] gap-3 px-4">
        <button
          type="button"
          onClick={handleOpenFilePicker}
          className="btn btn-outline btn-primary h-14 rounded-2xl text-3xl font-medium shadow-sm"
        >
          上傳圖檔
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="btn btn-outline btn-primary h-14 rounded-2xl text-3xl font-medium shadow-sm"
        >
          確認
        </button>
      </div>
    </div>
  );
}

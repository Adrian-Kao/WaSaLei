"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ImagePlus, Loader2, Play, Upload } from "lucide-react";

import {
  getApiImageUrl,
  parseInputImage,
  ParsedColor,
  uploadInputImage,
} from "@/lib/api/image-preview";

type StepState = "idle" | "uploading" | "uploaded" | "parsing" | "parsed" | "error";

export default function ImagePreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [inputPath, setInputPath] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ParsedColor[]>([]);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<StepState>("idle");

  const canUpload = Boolean(file) && step !== "uploading" && step !== "parsing";
  const canParse = Boolean(inputPath) && step !== "uploading" && step !== "parsing";

  const statusText = useMemo(() => {
    if (step === "uploading") return "Uploading to input";
    if (step === "uploaded") return "Image is in input";
    if (step === "parsing") return "Parsing image";
    if (step === "parsed") return "Output is ready";
    if (step === "error") return "Action failed";
    return "Choose an image";
  }, [step]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setInputPath(null);
    setOutputUrl(null);
    setColors([]);
    setMessage("");
    setStep(selectedFile ? "idle" : "idle");

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  }

  async function handleUpload() {
    if (!file) return;

    setStep("uploading");
    setMessage("");
    setOutputUrl(null);
    setColors([]);

    const result = await uploadInputImage(file);

    if (!result.success || !result.input_path) {
      setStep("error");
      setMessage(result.message ?? "Upload failed.");
      return;
    }

    setInputPath(result.input_path);
    setStep("uploaded");
  }

  async function handleParse() {
    setStep("parsing");
    setMessage("");

    const result = await parseInputImage("garment");

    if (!result.success || !result.preview_url) {
      setStep("error");
      setMessage(result.message ?? "Parsing failed.");
      return;
    }

    setOutputUrl(getApiImageUrl(`${result.preview_url}?t=${Date.now()}`));
    setColors(result.colors ?? []);
    setStep("parsed");
  }

  return (
    <main className="flex h-full flex-col bg-base-100 px-5 pb-24 pt-8 text-base-content">
      <header className="mb-6">
        <p className="text-sm font-medium text-base-content/60">Image pipeline</p>
        <h1 className="mt-1 text-3xl font-semibold">Input to Output</h1>
      </header>

      <section className="space-y-4">
        <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-base-300 bg-base-200 text-center">
          {localPreview ? (
            <img src={localPreview} alt="Selected upload" className="h-full w-full rounded-lg object-contain p-2" />
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-base-content/60" aria-hidden="true" />
              <span className="text-sm text-base-content/70">Select an image</span>
            </>
          )}
          <input className="hidden" type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <div className="rounded-lg border border-base-300 bg-base-100 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file?.name ?? "No file selected"}</p>
              <p className="text-xs text-base-content/60">{statusText}</p>
            </div>
            {(step === "uploading" || step === "parsing") && (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
            )}
          </div>
          {inputPath && <p className="mt-2 truncate text-xs text-base-content/60">{inputPath}</p>}
          {message && <p className="mt-2 text-sm text-error">{message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-neutral min-h-11" disabled={!canUpload} onClick={handleUpload}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Input
          </button>
          <button className="btn btn-outline min-h-11" disabled={!canParse} onClick={handleParse}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Parse
          </button>
        </div>
      </section>

      <section className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <h2 className="mb-3 text-lg font-semibold">Output</h2>

        <div className="flex h-52 items-center justify-center rounded-lg border border-base-300 bg-base-200">
          {outputUrl ? (
            <img src={outputUrl} alt="Parsed output" className="h-full w-full rounded-lg object-contain p-2" />
          ) : (
            <p className="text-sm text-base-content/60">No output yet</p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {colors.length > 0 ? (
            colors.map((item, index) => (
              <div key={`${item.color}-${index}`} className="flex items-center justify-between rounded-md bg-base-200 px-3 py-2">
                <span className="text-sm font-medium">{item.color ?? "No color"}</span>
                <span className="text-sm text-base-content/60">
                  {item.percent === null ? "--" : `${item.percent}%`}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-base-content/60">Colors will appear after parsing.</p>
          )}
        </div>
      </section>
    </main>
  );
}

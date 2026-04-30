const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

export type ParsedColor = {
  color: string | null;
  percent: number | null;
};

export type UploadInputResponse = {
  success: boolean;
  input_path?: string;
  message?: string;
};

export type ParseInputResponse = {
  success: boolean;
  input_path?: string;
  preview_path?: string;
  preview_url?: string;
  colors?: ParsedColor[];
  message?: string;
};

export function getApiImageUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

export async function uploadInputImage(file: File): Promise<UploadInputResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/images/upload-input`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export async function parseInputImage(mode = "garment"): Promise<ParseInputResponse> {
  const response = await fetch(`${API_BASE_URL}/api/images/parse-input`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode }),
  });

  return response.json();
}

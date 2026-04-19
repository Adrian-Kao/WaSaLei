"use client";

import { useState } from "react";

export default function MyWardrobePage() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/wardrobe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, capacity }),
    });
  };

  return (
    <main className="flex h-[90%] flex-col items-center bg-base-100 px-6 pt-16 text-black">
      <h1 className="text-center text-4xl font-medium">建立新衣櫃</h1>

      <div className="mt-28 w-full max-w-md space-y-16">
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-2xl">名稱</legend>
          <input
            type="text"
            className="input w-full bg-base-200"
            placeholder="Value"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-2xl">容量</legend>
          <input
            type="text"
            className="input w-full bg-base-200"
            placeholder="Value"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
        </fieldset>

        <div className="pt-15 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-neutral btn-outline mt-20 h-13 w-40 text-2xl font-medium"
          >
            確定
          </button>
        </div>
      </div>
    </main>
  );
}

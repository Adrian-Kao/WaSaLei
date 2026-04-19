export default function WardrobeListPage() {
  return (
    <div className="flex h-[90%] flex-col items-center bg-base-100 px-5 pb-6 text-black">
      <div className="text-7xl font-bold tracking-tight mt-28">衣櫃列表</div>

      <div className="mt-10 w-full h-full rounded-2xl bg-base-300 px-4 py-6 space-y-3 overflow-scroll scrollbar-hide">
        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        <button
          type="button"
          className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200"
        >
          <div className="text-center text-3xl">房間A</div>
          <div className="absolute bottom-3 right-4 text-2xl">5/30</div>
        </button>

        {/* <div className="relative flex h-25 items-center justify-center rounded-2xl bg-base-100 p-4"> */}
          <button
            type="button"
            className="btn btn-neutral btn-outline btn-xs h-25 w-full rounded-2xl text-5xl font-semibold"
          >
            + 
          </button>
        {/* </div> */}

      </div>
    </div>
  );
}

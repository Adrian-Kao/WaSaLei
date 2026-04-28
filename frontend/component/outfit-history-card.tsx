import Image from "next/image";

type OutfitHistoryCardProps = {
  imageUrl: string;
  wornDate: string;
  occasion: string;
};

export default function OutfitHistoryCard({ imageUrl, wornDate, occasion }: OutfitHistoryCardProps) {
  return (
    <article className="rounded-xl bg-[#D3D3D3] p-4">
      <div className="relative rounded-xl mb-3 aspect-4/5 w-full overflow-hidden bg-[#E4E4E4]">
        <Image
          src={imageUrl}
          alt="歷史穿搭"
          fill
          sizes="(max-width: 768px) 45vw, 180px"
          className="object-cover"
        />
      </div>

      <p className="text-center text-2xl leading-none text-black">{wornDate}</p>

      <div className="mt-2 flex justify-center">
        <span className="inline-flex h-10 min-w-22 items-center justify-center rounded-full bg-[#303236] px-4 text-xl leading-none text-white">
          {occasion}
        </span>
      </div>
    </article>
  );
}

type ListingPlaceholderImageProps = {
  src?: string | null;
  alt?: string;
  aspectClass?: string;
  className?: string;
};

export function ListingPlaceholderImage({
  src,
  alt = "",
  aspectClass = "aspect-[4/3]",
  className = "",
}: ListingPlaceholderImageProps) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden bg-zinc-100 ${aspectClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-zinc-100 ${aspectClass} ${className}`}
    >
      <span className="text-sm font-medium text-zinc-400">No image</span>
    </div>
  );
}

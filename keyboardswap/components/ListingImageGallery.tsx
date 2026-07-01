"use client";

import { useState } from "react";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";

type ListingImageGalleryProps = {
  images: string[];
  title: string;
};

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <ListingPlaceholderImage
        aspectClass="aspect-[16/10] lg:aspect-[21/9]"
      />
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <ListingPlaceholderImage
        src={activeImage}
        alt={`${title} — photo ${activeIndex + 1}`}
        aspectClass="aspect-[16/10] lg:aspect-[21/9]"
      />

      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={url} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={isActive}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    isActive
                      ? "border-zinc-900"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <ListingPlaceholderImage
                    src={url}
                    alt={`${title} — thumbnail ${index + 1}`}
                    aspectClass="aspect-[4/3] w-20 sm:w-24"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

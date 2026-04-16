"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect } from "react";

import { isVideoUrl } from "@/utils/media";

type Theme2FullsizeMediaModalProps = {
  isOpen: boolean;
  mediaList: string[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onSelect: (index: number) => void;
};

export function Theme2FullsizeMediaModal({
  isOpen,
  mediaList,
  activeIndex,
  productName,
  onClose,
  onSelect,
}: Theme2FullsizeMediaModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeMedia = mediaList[activeIndex] || mediaList[0] || "/file.svg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} full size media`}
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-6xl gap-3 overflow-hidden bg-[#f4f4f1] p-2 sm:grid-cols-[1fr_96px] sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#c2c9c6] bg-white text-[#314744] transition hover:bg-[#e7ece9]"
          aria-label="Close media modal"
        >
          <X size={16} />
        </button>

        <div className="flex min-h-0 items-center justify-center bg-white">
          {isVideoUrl(activeMedia) ? (
            <video
              src={activeMedia}
              controls
              autoPlay
              muted
              playsInline
              className="max-h-[80vh] w-full object-contain"
            />
          ) : (
            <Image
              src={activeMedia}
              alt={productName}
              width={1800}
              height={1400}
              className="max-h-[80vh] w-full object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>

        {mediaList.length > 1 ? (
          <div className="flex max-h-[80vh] gap-2 overflow-auto sm:block sm:space-y-2">
            {mediaList.map((media, index) => (
              <button
                key={`${media}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={`overflow-hidden border ${
                  index === activeIndex ? "border-[#5f7b75] ring-1 ring-[#5f7b75]/35" : "border-[#c9d0cd]"
                }`}
                aria-label={`Open media ${index + 1}`}
              >
                {isVideoUrl(media) ? (
                  <video src={media} muted className="h-16 w-16 object-cover sm:h-[72px] sm:w-[72px]" />
                ) : (
                  <Image
                    src={media}
                    alt={`${productName}-${index + 1}`}
                    width={120}
                    height={120}
                    className="h-16 w-16 object-cover sm:h-[72px] sm:w-[72px]"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

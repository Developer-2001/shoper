"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { addToCart } from "@/store/slices/cartSlice";
import { useTheme2CartToast } from "@/themes/theme2/cart-toast";
import { Theme2FullsizeMediaModal } from "@/themes/theme2/fullsize-media-modal";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme2ProductDetail({ slug, product }: ThemeProductDetailProps) {
  const dispatch = useAppDispatch();
  const { showAddedToCart } = useTheme2CartToast();
  useCartStorage();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const mediaList = useMemo(() => (product.images.length ? product.images.slice(0, 6) : ["/file.svg"]), [product.images]);
  const activeMedia = mediaList[activeIndex] || product.images[0] || "/file.svg";
  const finalPrice = salePrice(product.price, product.discountPercentage);
  const showDiscountPrice = product.discountPercentage > 0 && finalPrice < product.price;
  const productDescription = product.description?.trim() || "No description added yet.";

  function handleAddToCart() {
    dispatch(
      addToCart({
        slug,
        productId: product._id,
        name: product.name,
        image: product.images[0] || "/file.svg",
        price: finalPrice,
        currency: product.currency,
        quantity: 1,
      }),
    );
    showAddedToCart(product.name);
  }

  return (
    <article className="grid gap-10 lg:grid-cols-[1.25fr_1fr] [font-family:var(--font-theme2-sans)]">
      <section>
        <div className="overflow-hidden border border-[#bcc4c1] bg-white">
          {isVideoUrl(activeMedia) ? (
            <video src={activeMedia} controls muted className="h-[340px] w-full object-cover sm:h-[500px]" />
          ) : (
            <Image
              src={activeMedia}
              alt={product.name}
              width={1200}
              height={1000}
              className="h-[340px] w-full object-cover sm:h-[500px]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          )}
        </div>

        {mediaList.length > 1 ? (
          <div className="mt-4 grid grid-cols-6 gap-2">
            {mediaList.map((media, index) => (
              <button
                key={`${media}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden border ${
                  index === activeIndex ? "border-[#5f7b75] ring-1 ring-[#5f7b75]/30" : "border-[#d2d8d5]"
                }`}
                aria-label={`Preview image ${index + 1}`}
              >
                {isVideoUrl(media) ? (
                  <video src={media} muted className="h-20 w-full object-cover" />
                ) : (
                  <Image
                    src={media}
                    alt={`${product.name}-${index + 1}`}
                    width={160}
                    height={120}
                    className="h-20 w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#556864]">
          <button type="button" className="hover:underline cursor-pointer" onClick={() => setIsMediaModalOpen(true)}>
            View fullsize image
          </button>
        </div>
      </section>

      <section>
        <h1 className="text-5xl uppercase leading-none text-[#233532] [font-family:var(--font-theme2-serif)]">{product.name}</h1>
        <p className="mt-4 text-2xl text-[#243934]">{formatMoney(finalPrice, product.currency)}</p>
        {showDiscountPrice ? (
          <p className="mt-1 text-sm text-[#6a7d79] line-through">{formatMoney(product.price, product.currency)}</p>
        ) : null}
        <p className="mt-2 text-sm text-[#2b3f3b]">In stock: {product.inStock ?? 0}</p>

        <div className="mt-8 space-y-3 border-y border-[#bfc7c4] py-6">
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-2 inline-flex h-11 items-center justify-center bg-[#9db597] px-7 text-sm cursor-pointer font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#88a384]"
          >
            Add To Cart
          </button>
          <div>
            <Link href={`/${slug}/cart`} className="text-sm uppercase tracking-[0.16em] text-[#2f4540] underline">
              View Cart
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#324542]">
          <p className="whitespace-pre-line">{productDescription}</p>
        </div>
      </section>

      <Theme2FullsizeMediaModal
        isOpen={isMediaModalOpen}
        mediaList={mediaList}
        activeIndex={activeIndex}
        productName={product.name}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={setActiveIndex}
      />
    </article>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { addToCart } from "@/store/slices/cartSlice";
import { useTheme2CartToast } from "@/themes/theme2/cart-toast";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { ThemeProductDetailProps } from "@/themes/types";

function splitDescription(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function Theme2ProductDetail({ slug, product }: ThemeProductDetailProps) {
  const dispatch = useAppDispatch();
  const { showAddedToCart } = useTheme2CartToast();
  useCartStorage();

  const [activeIndex, setActiveIndex] = useState(0);
  const [plantChoice, setPlantChoice] = useState("No Plant");
  const [drinkChoice, setDrinkChoice] = useState("Coffee");

  const mediaList = useMemo(() => product.images.slice(0, 6), [product.images]);
  const activeMedia = mediaList[activeIndex] || product.images[0] || "/file.svg";
  const finalPrice = salePrice(product.price, product.discountPercentage);
  const installment = finalPrice / 4;
  const descriptionLines = splitDescription(product.description || "");

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
          <button type="button" className="hover:underline">
            View fullsize image
          </button>
          <button type="button" className="hover:underline">
            Email us about this product
          </button>
        </div>
      </section>

      <section>
        <h1 className="text-5xl uppercase leading-none text-[#233532] [font-family:var(--font-theme2-serif)]">{product.name}</h1>
        <p className="mt-4 text-2xl text-[#243934]">{formatMoney(finalPrice, product.currency)}</p>
        <p className="mt-1 text-sm text-[#6a7d79]">Taxes calculated at checkout</p>
        <p className="mt-4 text-sm text-[#2b3f3b]">
          or <span className="font-semibold">4 payments of {formatMoney(installment, product.currency)}</span> with sezzle
        </p>

        <div className="mt-8 space-y-3 border-y border-[#bfc7c4] py-6">
          <label className="grid grid-cols-[110px_1fr] items-center gap-3 text-sm uppercase tracking-[0.12em] text-[#2e413e]">
            <span>Plant:</span>
            <select
              value={plantChoice}
              onChange={(event) => setPlantChoice(event.target.value)}
              className="h-10 border border-[#7f8f8b] bg-white px-3 text-sm text-[#293b38]"
            >
              <option>No Plant</option>
              <option>Succulent</option>
              <option>Mini Fern</option>
            </select>
          </label>

          <label className="grid grid-cols-[110px_1fr] items-center gap-3 text-sm uppercase tracking-[0.12em] text-[#2e413e]">
            <span>Choose:</span>
            <select
              value={drinkChoice}
              onChange={(event) => setDrinkChoice(event.target.value)}
              className="h-10 border border-[#7f8f8b] bg-white px-3 text-sm text-[#293b38]"
            >
              <option>Coffee</option>
              <option>Tea</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-2 inline-flex h-11 items-center justify-center bg-[#9db597] px-7 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#88a384]"
          >
            Add To Cart
          </button>
        </div>

        <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#324542]">
          {descriptionLines.length ? (
            descriptionLines.map((line, index) => {
              const [label, ...rest] = line.split(":");
              if (!rest.length) {
                return <p key={`${line}-${index}`}>{line}</p>;
              }

              return (
                <p key={`${line}-${index}`}>
                  <span className="font-semibold uppercase tracking-[0.08em]">{label}:</span> {rest.join(":").trim()}
                </p>
              );
            })
          ) : (
            <p>
              Sweet, hand-crafted local treats to share with friends, family and coworkers. Every item is fresh and made
              from high quality ingredients.
            </p>
          )}

          <button
            type="button"
            className="mt-4 inline-flex h-11 items-center justify-center bg-[#9db597] px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#88a384]"
          >
            Add Items
          </button>
          <p className="text-sm italic text-[#5c6f6b]">Want to add a little something extra to make this gift truly personalized?</p>
        </div>

        <div className="mt-8 border-t border-[#bfc7c4] pt-5">
          <Link href={`/${slug}/cart`} className="text-sm uppercase tracking-[0.16em] text-[#2f4540] underline">
            View Cart
          </Link>
        </div>
      </section>
    </article>
  );
}

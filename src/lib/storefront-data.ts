import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const getCachedStoreBySlug = unstable_cache(
  async (slug: string) => {
    await connectToDatabase();
    return await Store.findOne({ slug }).lean();
  },
  ["store-by-slug"],
  { revalidate: 3600, tags: ["store"] }
);

const getCachedPublishedProducts = unstable_cache(
  async (storeId: string, limit: number = 100) => {
    await connectToDatabase();
    return await Product.find({ storeId, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },
  ["published-products"],
  { revalidate: 1800, tags: ["products"] }
);

const getCachedCategories = unstable_cache(
  async (storeId: string) => {
    await connectToDatabase();
    return await Category.find({ storeId }).sort({ createdAt: 1 }).lean();
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export async function getActiveStoreBySlug(slug: string) {
  const store = await getCachedStoreBySlug(slug);

  if (!store || store.status === "inactive") {
    return null;
  }

  return toPlain(store);
}

export async function getPublishedProductsByStoreId(storeId: unknown, limit: number = 100) {
  const products = await getCachedPublishedProducts(String(storeId), limit);
  return toPlain(products);
}

export async function getStoreProductById(storeId: unknown, productId: string) {
  await connectToDatabase();

  const product = await Product.findOne({
    _id: productId,
    storeId,
    isPublished: true,
  }).lean();

  if (!product) return null;

  return toPlain(product);
}

export async function getStorefrontHomeData(slug: string, productLimit: number = 100) {
  const store = await getCachedStoreBySlug(slug);

  if (!store || store.status === "inactive") return null;

  const [products, categories] = await Promise.all([
    getCachedPublishedProducts(String(store._id), productLimit),
    getCachedCategories(String(store._id)),
  ]);

  return {
    store: toPlain(store),
    products: toPlain(products),
    categories: toPlain(categories),
  };
}

export async function getStorefrontProductData(
  slug: string,
  productId: string,
  productLimit: number = 100
) {
  const store = await getCachedStoreBySlug(slug);

  if (!store || store.status === "inactive") return null;

  await connectToDatabase();

  const [product, products] = await Promise.all([
    Product.findOne({
      _id: productId,
      storeId: store._id,
      isPublished: true,
    }).lean(),
    getCachedPublishedProducts(String(store._id), productLimit),
  ]);

  if (!product) return null;

  return {
    store: toPlain(store),
    product: toPlain(product),
    products: toPlain(products),
  };
}

import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";

function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 🚀 OPTIMIZATION: Cached store lookup (1 hour TTL)
 * Prevents multiple store queries per request
 */
const getCachedStoreBySlug = unstable_cache(
    async (slug: string) => {
        await connectToDatabase();
        return await Store.findOne({ slug }).lean();
    },
    ["store-by-slug"],
    { revalidate: 3600, tags: ["store"] }
);

/**
 * 🚀 OPTIMIZATION: Cached published products (30 min TTL)
 * Limits to first 100 products to prevent memory bloat
 * Sorts by creation date for consistency
 */
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

/**
 * 🚀 OPTIMIZATION: Cached categories (1 hour TTL)
 * Categories rarely change, safe to cache longer
 */
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

export async function getPublishedProductsByStoreId(
    storeId: unknown,
    limit: number = 100
) {
    const products = await getCachedPublishedProducts(String(storeId), limit);
    return toPlain(products);
}

export async function getStoreProductById(
    storeId: unknown,
    productId: string
) {
    await connectToDatabase();

    const product = await Product.findOne({
        _id: productId,
        storeId,
        isPublished: true,
    }).lean();

    if (!product) return null;

    return toPlain(product);
}

/**
 * 🚀 OPTIMIZATION: Get storefront home data with:
 * - Cached store lookup
 * - Cached products (limited to 100)
 * - Cached categories
 * - Parallel queries using Promise.all
 */
export async function getStorefrontHomeData(slug: string, productLimit: number = 100) {
    const store = await getCachedStoreBySlug(slug);

    if (!store || store.status === "inactive") return null;

    // ✅ Parallel fetch: products + categories
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

/**
 * 🚀 OPTIMIZATION: Get product detail page data with:
 * - Cached store lookup
 * - Direct specific product query
 * - Cached all products for recommendations
 */
export async function getStorefrontProductData(
    slug: string,
    productId: string,
    productLimit: number = 100
) {
    const store = await getCachedStoreBySlug(slug);

    if (!store || store.status === "inactive") return null;

    await connectToDatabase();

    // ✅ Parallel fetch: specific product + all products for related items
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

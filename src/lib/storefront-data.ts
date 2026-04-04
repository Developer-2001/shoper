import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getActiveStoreBySlug(slug: string) {
  await connectToDatabase();

  const store = await Store.findOne({ slug }).lean();
  if (!store || store.status === "inactive") {
    return null;
  }

  return toPlain(store);
}

export async function getPublishedProductsByStoreId(storeId: unknown) {
  await connectToDatabase();

  const products = await Product.find({ storeId, isPublished: true })
    .sort({ createdAt: -1 })
    .lean();

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

export async function getStorefrontHomeData(slug: string) {
  await connectToDatabase();

  const store = await Store.findOne({ slug }).lean();
  if (!store || store.status === "inactive") return null;

  const [products, categories] = await Promise.all([
    Product.find({ storeId: store._id, isPublished: true })
      .sort({ createdAt: -1 })
      .lean(),
    Category.find({ storeId: store._id }).sort({ createdAt: 1 }).lean(),
  ]);

  return {
    store: toPlain(store),
    products: toPlain(products),
    categories: toPlain(categories),
  };
}

export async function getStorefrontProductData(slug: string, productId: string) {
  await connectToDatabase();

  const store = await Store.findOne({ slug }).lean();
  if (!store || store.status === "inactive") return null;

  const [product, products] = await Promise.all([
    Product.findOne({
      _id: productId,
      storeId: store._id,
      isPublished: true,
    }).lean(),
    Product.find({ storeId: store._id, isPublished: true })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!product) return null;

  return {
    store: toPlain(store),
    product: toPlain(product),
    products: toPlain(products),
  };
}

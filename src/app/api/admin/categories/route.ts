import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { categorySchema } from "@/lib/validations";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function toNormalizedKey(name: string) {
  return normalizeCategoryName(name).toLowerCase();
}

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const search = request.nextUrl.searchParams.get("search")?.trim();
  const query: Record<string, unknown> = { storeId: auth.payload.storeId };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const [categories, productCategories] = await Promise.all([
    Category.find(query).sort({ name: 1 }).lean(),
    Product.distinct("category", { storeId: auth.payload.storeId }),
  ]);

  const merged = new Map<string, { id: string; name: string; normalizedName: string }>();

  categories.forEach((category) => {
    merged.set(category.normalizedName, {
      id: String(category._id),
      name: category.name,
      normalizedName: category.normalizedName,
    });
  });

  productCategories.forEach((rawName) => {
    const cleanedName = normalizeCategoryName(String(rawName || ""));
    if (!cleanedName) return;
    const normalizedName = toNormalizedKey(cleanedName);
    if (merged.has(normalizedName)) return;

    merged.set(normalizedName, {
      id: `product-${normalizedName}`,
      name: cleanedName,
      normalizedName,
    });
  });

  return NextResponse.json({
    categories: Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export async function POST(request: NextRequest) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cleanedName = normalizeCategoryName(parsed.data.name);
  const normalizedName = toNormalizedKey(cleanedName);

  const existing = await Category.findOne({
    storeId: auth.payload.storeId,
    normalizedName,
  }).lean();

  if (existing) {
    return NextResponse.json(
      {
        category: {
          id: String(existing._id),
          name: existing.name,
          normalizedName: existing.normalizedName,
        },
      },
      { status: 200 }
    );
  }

  try {
    const category = await Category.create({
      storeId: auth.payload.storeId,
      name: cleanedName,
      normalizedName,
    });

    return NextResponse.json(
      {
        category: {
          id: String(category._id),
          name: category.name,
          normalizedName: category.normalizedName,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const category = await Category.findOne({
        storeId: auth.payload.storeId,
        normalizedName,
      }).lean();

      if (category) {
        return NextResponse.json(
          {
            category: {
              id: String(category._id),
              name: category.name,
              normalizedName: category.normalizedName,
            },
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

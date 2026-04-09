import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

/**
 * 🚀 OPTIMIZATION: Store API with cache headers
 * - Sets proper Cache-Control headers for CDN
 * - Limits products to first 100 (prevents timeout)
 * - Uses Promise.all for parallel queries
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectToDatabase();

        const routeParams = await params;

        // ✅ Query store first
        const store = await Store.findOne({ slug: routeParams.slug }).lean();

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404, headers: { "Cache-Control": "public, max-age=300" } }
            );
        }

        if (store.status === "inactive") {
            return NextResponse.json(
                { error: "Store is inactive" },
                { status: 403, headers: { "Cache-Control": "public, max-age=60" } }
            );
        }

        // ✅ Parallel queries for products and categories (with limit)
        const [products, categories] = await Promise.all([
            Product.find({ storeId: store._id, isPublished: true })
                .sort({ createdAt: -1 })
                .limit(100) // 🚀 OPTIMIZATION: Limit to prevent timeout
                .lean(),
            Category.find({ storeId: store._id })
                .sort({ createdAt: 1 })
                .lean(),
        ]);

        const response = NextResponse.json({
            store,
            products,
            categories,
        });

        // 🚀 OPTIMIZATION: Set cache headers for CDN/browser
        // Public: Can be cached publicly
        // s-maxage=3600: Cache for 1 hour on Vercel edge
        // stale-while-revalidate: Serve stale content for 24 hours while refreshing
        response.headers.set(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400"
        );

        // 🚀 OPTIMIZATION: Set compression headers
        response.headers.set("Vary", "Accept-Encoding");

        return response;
    } catch (error) {
        console.error("Store API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

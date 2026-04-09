/**
 * 🚀 Image Optimization Utilities
 * 
 * Provides image optimization, caching, and format negotiation
 * for Google Cloud Storage images
 */

/**
 * Get optimized image URL with size and format options
 * 
 * Use this wrapper to add proper caching and CDN optimization
 * Example: getOptimizedImageUrl(originalUrl, { width: 400, quality: 80 })
 */
export function getOptimizedImageUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: "webp" | "avif" | "auto";
    } = {}
) {
    // TODO: Replace with your CDN service (Cloudflare, Imgix, etc.)
    // For now, return original URL with recommendations

    // If already optimized URL, return as-is
    if (url.includes("?")) {
        return url;
    }

    // GCS provides some built-in optimization via query params
    const { width = 800, height, quality = 80, format = "auto" } = options;

    const params = new URLSearchParams({
        w: String(width),
        ...(height && { h: String(height) }),
        q: String(quality),
    });

    // Add format negotiation when possible
    if (format !== "auto" && url.includes("storage.googleapis.com")) {
        // GCS supports -rw flag for WebP/AVIF
        return `${url}?${params.toString()}`;
    }

    return `${url}`;
}

/**
 * 🚀 Get responsive image sizes string for Next.js Image component
 * Optimizes delivery based on viewport size
 */
export function getResponsiveImageSizes(): string {
    return [
        "(max-width: 640px) 100vw",
        "(max-width: 1024px) 66vw",
        "(max-width: 1280px) 50vw",
        "33vw",
    ].join(", ");
}

/**
 * 🚀 Get priority hint for image loading
 * Use priority={true} only for above-the-fold images
 */
export function shouldPrioritizeImage(index: number): boolean {
    // Only prioritize first 2 images (hero + first product card)
    return index < 2;
}

/**
 * 🚀 Generate image srcSet for manual optimization
 * Use with Picture/img tags for more control
 */
export function getImageSrcSet(
    url: string,
    sizes: number[] = [320, 640, 1024, 1280]
): string {
    return sizes
        .map((size) => {
            const optimizedUrl = getOptimizedImageUrl(url, { width: size });
            return `${optimizedUrl} ${size}w`;
        })
        .join(", ");
}

/**
 * Next.js Image Configuration Recommendations
 * Add this to your next.config.ts:
 *
 * const nextConfig = {
 *   images: {
 *     remotePatterns: [
 *       {
 *         protocol: "https",
 *         hostname: "storage.googleapis.com",
 *         pathname: "/canada-ecommerce-assets/**",
 *       },
 *       // Add your CDN if using one:
 *       // {
 *       //   protocol: "https",
 *       //   hostname: "cdn.example.com",
 *       // }
 *     ],
 *     formats: ["image/avif", "image/webp"],
 *     // Cache optimized images for 1 year
 *     minimumCacheTTL: 31536000,
 *     // Dangerously allow SVG (only if you trust the source)
 *     dangerouslyAllowSVG: false,
 *   },
 * };
 */

/**
 * CDN Implementation Guide
 * 
 * RECOMMENDED: Use Cloudflare Image Optimization
 * 1. Enable in Cloudflare dashboard
 * 2. Use: https://yourcdn.com/cdn-cgi/image/width=400,quality=80/gcsurl
 * 3. Set Cache-Control headers for origin
 * 
 * OR use Imgix/Cloudinary:
 * 1. Upload GCS images to CDN
 * 2. Replace GCS URLs with CDN URLs
 * 3. Adds automatic WebP/AVIF, resizing, caching
 */

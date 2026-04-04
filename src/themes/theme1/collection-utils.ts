export function toCollectionSlug(category: string) {
  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "uncategorized";
}

export function fromCollectionSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function categoryMatchesCollectionSlug(category: string, slug: string) {
  return toCollectionSlug(category) === slug;
}





"use client";

export default function BlogStatusBadge({
  published,
  featured,
}: {
  published: boolean;
  featured: boolean;
}) {
  if (featured) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        ⭐ Featured
      </span>
    );
  }

  if (published) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        ✓ Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      • Draft
    </span>
  );
}
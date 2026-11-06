"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryRail } from "@/components/category-rail";
import { ListingGrid } from "@/components/listing-grid";
import { ListingSkeleton } from "@/components/listing-skeleton";
import { SiteHeader } from "@/components/site-header";
import { listings } from "@/lib/listings";

type SortOrder = "recommended" | "price-low" | "price-high";

interface CatalogViewProps {
  initialQuery: string;
}

function getSortOrder(value: string): SortOrder {
  if (value === "price-low" || value === "price-high") return value;
  return "recommended";
}

export const CatalogView = ({ initialQuery }: CatalogViewProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All stays");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings
      .filter((listing) => {
        const matchesQuery =
          !normalizedQuery ||
          `${listing.title} ${listing.subtitle} ${listing.city} ${listing.state} ${listing.country} ${listing.category}`
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory =
          selectedCategory === "All stays" ||
          listing.category === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === "price-low") return a.price - b.price;
        if (sortOrder === "price-high") return b.price - a.price;
        return 0;
      });
  }, [query, selectedCategory, sortOrder]);

  return (
    <>
      <SiteHeader
        onQueryChange={setQuery}
        query={query}
      />
      <main className="page-shell catalog-page">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">A good place to begin</p>
            <h1>Stays for your next story</h1>
            <p className="catalog-description">
              Browse soulful spaces, from quiet cabins to sunlit seaside homes.
            </p>
          </div>
          <label className="sort-control">
            <span>Sort by</span>
            <select
              onChange={(event) =>
                setSortOrder(getSortOrder(event.target.value))
              }
              value={sortOrder}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        <CategoryRail
          onSelect={setSelectedCategory}
          selected={selectedCategory}
        />
        <div className="catalog-results-heading">
          <p>
            <strong>{visibleListings.length} stays</strong>
            {query ? ` for “${query}”` : " to inspire your next escape"}
          </p>
          {query && (
            <button
              className="clear-search"
              onClick={() => setQuery("")}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
        {isLoading ? (
          <ListingSkeleton />
        ) : (
          <ListingGrid listings={visibleListings} />
        )}
      </main>
      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <span>© 2026 Stay Somewhere</span>
          <span>Made for getting away.</span>
        </div>
      </footer>
    </>
  );
};

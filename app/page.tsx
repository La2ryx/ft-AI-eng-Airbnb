"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CategoryRail } from "@/components/category-rail";
import { ListingGrid } from "@/components/listing-grid";
import { ListingSkeleton } from "@/components/listing-skeleton";
import { SiteHeader } from "@/components/site-header";
import { listings } from "@/lib/listings";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All stays");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesQuery =
        !normalizedQuery ||
        `${listing.title} ${listing.subtitle} ${listing.city} ${listing.state} ${listing.country} ${listing.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        selectedCategory === "All stays" ||
        listing.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setQuery(String(formData.get("destination") ?? ""));
  }

  return (
    <>
      <SiteHeader onQueryChange={setQuery} query={query} />
      <main>
        <section className="hero grid grid-cols-1 md:grid-cols-[1fr_0.93fr] md:min-h-[430px] lg:min-h-[490px]">
          <div className="hero-copy w-full px-[22px] py-[45px] md:w-[min(580px,calc(100%-48px))] md:px-10 md:py-[58px] md:pl-7 lg:pl-[max(44px,calc((100vw-1280px)/2))]">
            <p className="eyebrow">A little space to feel somewhere else</p>
            <h1>Find your place<br />in the world.</h1>
            <p className="hero-description">
              Extraordinary stays, thoughtfully chosen for the way you want to
              get away.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <label htmlFor="home-search">Where would you like to go?</label>
              <div className="hero-search-controls">
                <input
                  autoComplete="off"
                  id="home-search"
                  name="destination"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try “Italy” or “cabin”"
                  type="search"
                  value={query}
                />
                <button aria-label="Search stays" type="submit">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.4 4.4" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <div
            aria-label="A peaceful vacation home surrounded by nature"
            className="hero-image min-h-[245px] md:min-h-[430px] lg:min-h-[490px]"
            role="img"
          >
            <div className="hero-image-caption">
              <span>Somewhere slow</span>
              <span>— The Mediterranean</span>
            </div>
          </div>
        </section>

        <section className="stays-section page-shell">
          <div className="section-intro">
            <div>
              <p className="eyebrow">A change of scenery</p>
              <h2>Places that stay with you</h2>
            </div>
            <span className="results-note">
              {visibleListings.length} thoughtful stays
            </span>
          </div>
          <CategoryRail
            onSelect={setSelectedCategory}
            selected={selectedCategory}
          />
          {isLoading ? (
            <ListingSkeleton />
          ) : (
            <ListingGrid listings={visibleListings} />
          )}
        </section>
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

export default HomePage;

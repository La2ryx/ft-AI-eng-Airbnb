"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";

interface SiteHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const SiteHeader = ({ query, onQueryChange }: SiteHeaderProps) => {
  const router = useRouter();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    router.push(search ? `/catalog?q=${encodeURIComponent(search)}` : "/catalog");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Airbnb home">
          <svg
            aria-hidden="true"
            className="brand-mark"
            viewBox="0 0 32 32"
            fill="currentColor"
          >
            <path d="M16 3.2c-2.2 0-3.6 1.6-4.8 4.1l-6.1 13c-1.6 3.4-.7 6.4 1.8 7.6 2.4 1.2 5.2.1 8.3-3.7l.8-1 .8 1c3.1 3.8 5.9 4.9 8.3 3.7 2.5-1.2 3.4-4.2 1.8-7.6l-6.1-13C19.6 4.8 18.2 3.2 16 3.2Zm0 3c.8 0 1.7 1.1 2.6 3l2.2 4.7a9.6 9.6 0 0 0-9.6 0l2.2-4.7c.9-1.9 1.8-3 2.6-3Zm-6.1 12a6.6 6.6 0 0 1 4.5-1.8c-1.3 2.1-2.7 4.1-3.9 5.6-1.1 1.3-2.4 2.8-3.2 2.4-.7-.3-.5-1.6.1-2.8l2.5-3.4Zm12.2 0 2.5 3.4c.6 1.2.8 2.5.1 2.8-.8.4-2.1-1.1-3.2-2.4-1.2-1.5-2.6-3.5-3.9-5.6a6.6 6.6 0 0 1 4.5 1.8Z" />
          </svg>
          <span>airbnb</span>
        </Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            aria-label="Search destinations"
            name="q"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Where to?"
            value={query}
          />
          <span className="search-divider" />
          <span className="search-detail">Any week</span>
          <span className="search-divider" />
          <span className="search-detail search-guests">Add guests</span>
          <button className="search-submit" type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.4 4.4" />
            </svg>
          </button>
        </form>

        <Link className="header-menu" href="/catalog">
          <span>Explore stays</span>
          <span className="avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
        </Link>
      </div>
    </header>
  );
};

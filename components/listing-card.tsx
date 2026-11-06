"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <article className="listing-card">
      <Link
        className="listing-card-link"
        href={`/rooms/${listing.id}`}
        aria-label={`View ${listing.title} in ${listing.city}`}
      >
        <div className="listing-image relative">
          <Image
            alt={listing.title}
            className="rounded-[inherit] object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
            src={listing.image}
          />
        </div>
      </Link>
      <button
        aria-label={isSaved ? "Remove from wish list" : "Add to wish list"}
        aria-pressed={isSaved}
        className={`favorite-button${isSaved ? " is-saved" : ""}`}
        onClick={() => setIsSaved((saved) => !saved)}
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      </button>
      <div className="listing-card-copy">
        <div className="listing-card-heading">
          <h2>{listing.city}, {listing.state || listing.country}</h2>
          <span className="listing-rating">
            <span aria-hidden="true">★</span> {listing.rating.toFixed(2)}
          </span>
        </div>
        <p className="listing-title">{listing.title}</p>
        <p className="listing-subtitle">
          {listing.subtitle} · {listing.guests} guests
        </p>
        <p className="listing-price">
          <strong>${listing.price}</strong> <span>night</span>
        </p>
      </div>
    </article>
  );
};

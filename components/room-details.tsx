"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Room } from "@/types/listing";

const MIN_GUESTS = 1;
const MAX_GUESTS = 16;

interface RoomDetailsProps {
  listing: Room;
}

export const RoomDetails = ({ listing }: RoomDetailsProps) => {
  const maxGuests = Math.min(MAX_GUESTS, listing.guests);
  const [guestCount, setGuestCount] = useState(MIN_GUESTS);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [areAmenitiesExpanded, setAreAmenitiesExpanded] = useState(false);
  const [hostMessage, setHostMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const galleryDialogRef = useRef<HTMLDivElement>(null);
  const galleryCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isGalleryOpen) return;

    const previousFocus = document.activeElement;
    galleryCloseRef.current?.focus();

    function handleGalleryKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsGalleryOpen(false);
      } else if (event.key === "ArrowLeft") {
        setGalleryIndex((current) =>
          (current - 1 + listing.images.length) % listing.images.length,
        );
      } else if (event.key === "ArrowRight") {
        setGalleryIndex((current) => (current + 1) % listing.images.length);
      } else if (event.key === "Tab") {
        const focusableElements = galleryDialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleGalleryKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGalleryKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isGalleryOpen, listing.images.length]);

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const difference =
      new Date(`${checkOut}T00:00:00`).getTime() -
      new Date(`${checkIn}T00:00:00`).getTime();
    return Math.max(0, Math.round(difference / 86_400_000));
  }, [checkIn, checkOut]);

  const cleaningFee = 45;
  const serviceFee = Math.round(listing.price * Math.max(numberOfNights, 1) * 0.12);
  const total = listing.price * numberOfNights + cleaningFee + serviceFee;

  function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!numberOfNights) {
      setBookingMessage("Choose a valid check-out date to continue.");
      return;
    }
    if (guestCount > listing.guests) {
      setBookingMessage(`This stay is set up for up to ${listing.guests} guests.`);
      return;
    }
    setBookingMessage("Your dates are selected. This stay is ready to book.");
  }

  function moveGallery(direction: -1 | 1) {
    setGalleryIndex((current) =>
      (current + direction + listing.images.length) % listing.images.length,
    );
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          url: window.location.href,
        });
        setShareMessage("Stay shared.");
        return;
      }

      if (!navigator.clipboard) {
        setShareMessage("Sharing isn’t supported in this browser.");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("Unable to share this stay. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <>
        <RoomHeader />
        <main className="page-shell room-loading" aria-label="Loading stay">
          <div className="room-skeleton-title shimmer" />
          <div className="room-skeleton-gallery shimmer" />
          <div className="room-skeleton-copy shimmer" />
          <span className="sr-only">Loading stay details</span>
        </main>
      </>
    );
  }

  return (
    <>
      <RoomHeader />
      <main className="page-shell room-page">
        <Link className="back-link" href="/catalog">
          <span aria-hidden="true">←</span> Explore all stays
        </Link>
        <div className="room-title-row">
          <div>
            <p className="eyebrow">{listing.type} in {listing.city}, {listing.state}</p>
            <h1>{listing.title}</h1>
            <p className="room-subtitle">{listing.subtitle}</p>
            <div className="room-quick-stats">
              <span className="room-rating-stars">
                <span aria-hidden="true">★</span> {listing.rating.toFixed(2)}
              </span>
              <span aria-hidden="true">·</span>
              <Link className="reviews-link" href="#reviews">
                {listing.reviewCount} reviews
              </Link>
              {listing.guestFavorite && (
                <span className="guest-favorite-badge">Guest favorite</span>
              )}
            </div>
          </div>
          <div className="room-actions">
            <button
              className="text-action"
              onClick={handleShare}
              type="button"
            >
              <span aria-hidden="true">↗</span> Share
            </button>
            <button
              aria-pressed={isSaved}
              className="text-action"
              onClick={() => setIsSaved((saved) => !saved)}
              type="button"
            >
              <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>{" "}
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
        {shareMessage && (
          <p aria-live="polite" className="share-message">
            {shareMessage}
          </p>
        )}

        <div className="room-gallery">
          {listing.images.slice(0, 5).map((image, index) => (
            <button
              aria-label={`View photo ${index + 1}`}
              className={`gallery-tile gallery-tile-${index + 1} relative`}
              key={`${listing.id}-${index}`}
              onClick={() => {
                setGalleryIndex(index);
                setIsGalleryOpen(true);
              }}
              type="button"
            >
              <Image
                alt={`${listing.title}, photo ${index + 1}`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 55vw, (max-width: 900px) 50vw, 40vw"
                src={image}
              />
            </button>
          ))}
          <button
            className="show-photos-button"
            onClick={() => {
              setGalleryIndex(0);
              setIsGalleryOpen(true);
            }}
            type="button"
          >
            <span aria-hidden="true">▦</span> Show all photos
          </button>
        </div>

        <div className="room-content-grid">
          <div className="room-main-copy">
            <div className="host-summary">
              <div>
                <h2>{listing.type} hosted by {listing.host}</h2>
                <p>
                  {listing.guests} guests · {listing.bedrooms} bedrooms ·{" "}
                  {listing.beds} beds · {listing.baths} baths
                </p>
              </div>
              <div aria-label={`${listing.host}'s profile`} className="host-avatar">
                {listing.host.slice(0, 1)}
              </div>
            </div>

            {listing.superhost && (
              <div className="host-note">
                <span className="host-note-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>{listing.host} is a Superhost</strong>
                  <p>Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                </div>
              </div>
            )}

            <div className="sleeping-section">
              <h2>Where you’ll sleep</h2>
              <div className="sleeping-grid">
                {listing.sleepingArrangements.map((room) => (
                  <div
                    className="sleeping-card"
                    key={`${listing.id}-${room.label}`}
                  >
                    <span className="sleeping-icon" aria-hidden="true">▰</span>
                    <strong>{room.label}</strong>
                    {room.beds.map((bed) => (
                      <p key={`${room.label}-${bed.type}`}>
                        {bed.count} {bed.type}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <section className="room-description">
              <h2>{listing.subtitle}</h2>
              <p>{listing.description}</p>
            </section>

            <section className="amenities-section">
              <h2>What this place offers</h2>
              <ul className="amenities-list">
                {listing.amenities
                  .slice(0, areAmenitiesExpanded ? listing.amenities.length : 4)
                  .map((amenity, index) => (
                    <li key={amenity}>
                      <span aria-hidden="true" className="amenity-icon">
                        {["⌂", "◉", "◇", "⌁", "↗", "☼"][index % 6]}
                      </span>
                      {amenity}
                  </li>
                ))}
              </ul>
              {listing.amenities.length > 4 && (
                <button
                  className="show-all-amenities"
                  onClick={() => setAreAmenitiesExpanded((expanded) => !expanded)}
                  type="button"
                >
                  {areAmenitiesExpanded ? "Show fewer amenities" : `Show all ${listing.amenities.length} amenities`}
                </button>
              )}
            </section>

            <section className="location-section">
              <h2>Where you’ll be</h2>
              <p className="location-address">
                {listing.city}, {listing.state}, {listing.country}
              </p>
              <p className="location-note">
                Exact location is provided after booking.
              </p>
            </section>

            <section className="reviews-section" id="reviews">
              <h2>
                <span className="reviews-heading-rating">★ {listing.rating.toFixed(2)}</span> ·{" "}
                {listing.reviewCount} reviews
              </h2>
              <p className="reviews-note">How reviews work</p>
              {listing.reviews.map((review) => (
                <article className="review" key={`${listing.id}-${review.name}`}>
                  <div className="review-avatar" aria-hidden="true">
                    {review.name.slice(0, 1)}
                  </div>
                  <div className="review-body">
                    <strong>{review.name}</strong>
                    <p className="review-meta">{review.city} · {review.date}</p>
                    <p className="review-text">
                      <span className="review-stars" aria-hidden="true">{"★".repeat(review.rating)}</span>
                      {review.text}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <section className="host-section">
              <h2>Meet your host</h2>
              <div className="host-card">
                <div className="host-avatar host-avatar-large" aria-hidden="true">
                  {listing.host.slice(0, 1)}
                </div>
                <div>
                  <strong>{listing.host}</strong>
                  <p>
                    {listing.superhost ? "Superhost" : "Host"} · {listing.hostYears} years hosting
                  </p>
                  <p className="host-lives">
                    <span aria-hidden="true">📍</span> Lives in {listing.livesIn}
                  </p>
                  <p className="host-languages">
                    Speaks {listing.languages.join(", ")}
                  </p>
                </div>
              </div>
              <div className="host-response">
                <span aria-hidden="true">✉</span>
                <div>
                  <strong>Response rate: 100%</strong>
                  <p>Responds within an hour</p>
                </div>
              </div>
              <button
                className="message-host-button"
                onClick={() => setHostMessage("Host messaging isn’t connected in this demo.")}
                type="button"
              >
                Message host
              </button>
              {hostMessage && (
                <p aria-live="polite" className="host-message-feedback">
                  {hostMessage}
                </p>
              )}
              <p className="host-protection-note">
                To help protect your payment, always communicate and send money through this platform.
              </p>
            </section>

            <section className="things-to-know">
              <h2>Things to know</h2>
              <div className="know-grid">
                <div className="know-column">
                  <strong>House rules</strong>
                  <p>Check-in after {listing.checkInAfter}</p>
                  <p>Check-out before {listing.checkOutBefore}</p>
                  <p>{listing.houseRules}</p>
                </div>
                <div className="know-column">
                  <strong>Safety & property</strong>
                  <p>Carbon monoxide alarm</p>
                  <p>Smoke alarm</p>
                  <p>Self check-in with smart lock</p>
                </div>
                <div className="know-column">
                  <strong>Cancellation policy</strong>
                  <p>{listing.cancellationPolicy}</p>
                  <p>Review this host’s full policy for details.</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="booking-card">
            <div className="booking-price">
              <div className="booking-price-row">
                <strong>${listing.price}</strong> <span>night</span>
              </div>
              <span className="booking-rating">
                <span aria-hidden="true">★</span> {listing.rating.toFixed(2)}
              </span>
            </div>
            <form onSubmit={handleBooking}>
              <div className="booking-date-fields">
                <label>
                  <span>CHECK-IN</span>
                  <input
                    aria-label="Check-in date"
                    onChange={(event) => {
                      setCheckIn(event.target.value);
                      setBookingMessage("");
                    }}
                    required
                    type="date"
                    value={checkIn}
                  />
                </label>
                <label>
                  <span>CHECKOUT</span>
                  <input
                    aria-label="Check-out date"
                    min={checkIn || undefined}
                    onChange={(event) => {
                      setCheckOut(event.target.value);
                      setBookingMessage("");
                    }}
                    required
                    type="date"
                    value={checkOut}
                  />
                </label>
              </div>
              <div className="guest-selector">
                <div>
                  <strong>GUESTS</strong>
                  <span>
                    {guestCount} {guestCount === 1 ? "guest" : "guests"}
                  </span>
                </div>
                <div aria-label="Guest count" className="guest-counter">
                  <button
                    aria-label="Remove one guest"
                    disabled={guestCount <= MIN_GUESTS}
                    onClick={() => {
                      setGuestCount((previous) =>
                        Math.max(MIN_GUESTS, previous - 1),
                      );
                      setBookingMessage("");
                    }}
                    type="button"
                  >
                    −
                  </button>
                  <span aria-live="polite">{guestCount}</span>
                  <button
                    aria-label="Add one guest"
                    disabled={guestCount >= maxGuests}
                    onClick={() => {
                      setGuestCount((previous) =>
                        Math.min(maxGuests, previous + 1),
                      );
                      setBookingMessage("");
                    }}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
              <button className="reserve-button" type="submit">
                Reserve
              </button>
              <p className="booking-note">You won’t be charged yet</p>
              {numberOfNights > 0 && (
                <div className="price-breakdown">
                  <p>
                    <span>
                      ${listing.price} × {numberOfNights} nights
                    </span>
                    <span>${listing.price * numberOfNights}</span>
                  </p>
                  <p><span>Cleaning fee</span><span>${cleaningFee}</span></p>
                  <p><span>Service fee</span><span>${serviceFee}</span></p>
                  <p className="total-line">
                    <strong>Total before taxes</strong>
                    <strong>${total}</strong>
                  </p>
                </div>
              )}
              {bookingMessage && (
                <p aria-live="polite" className="booking-message">
                  {bookingMessage}
                </p>
              )}
            </form>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <span>© 2026 Stay Somewhere</span>
          <span>Made for getting away.</span>
        </div>
      </footer>

      {isGalleryOpen && (
        <div
          aria-label="Photo gallery"
          aria-modal="true"
          className="gallery-modal"
          ref={galleryDialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <button
            aria-label="Close photo gallery"
            className="gallery-close"
            onClick={() => setIsGalleryOpen(false)}
            ref={galleryCloseRef}
            type="button"
          >
            ×
          </button>
          <div className="gallery-modal-content">
            <button
              aria-label="Previous photo"
              className="gallery-arrow"
              onClick={() => moveGallery(-1)}
              type="button"
            >
              ‹
            </button>
            <div
              aria-label={`Photo ${galleryIndex + 1} of ${listing.images.length}`}
              className="gallery-modal-image relative"
              role="img"
            >
              <Image
                alt={`${listing.title}, photo ${galleryIndex + 1}`}
                className="object-contain"
                fill
                sizes="(max-width: 640px) 75vw, 70vw"
                src={listing.images[galleryIndex]}
              />
            </div>
            <button
              aria-label="Next photo"
              className="gallery-arrow"
              onClick={() => moveGallery(1)}
              type="button"
            >
              ›
            </button>
          </div>
          <p className="gallery-count">
            {galleryIndex + 1} / {listing.images.length}
          </p>
        </div>
      )}
    </>
  );
};

const RoomHeader = () => {
  return (
    <header className="room-header">
      <div className="page-shell room-header-inner">
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
        <Link className="room-header-link" href="/catalog">
          Explore stays <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
};

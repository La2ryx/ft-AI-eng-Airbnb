# Airbnb UI Clone Walkthrough

## Table of contents

- [Overview](#overview)
- [Running example](#running-example)
- [Logic flow](#logic-flow)
- [Key changes](#key-changes)
- [Lessons](#lessons)
- [Verification](#verification)
- [Glossary](#glossary)
- [Further reading](#further-reading)

## Overview

Stay Somewhere is a photo-led lodging discovery app built with [Next.js](../../app/catalog/page.tsx), a React framework that provides routing; [React](../../app/page.tsx), a library for building user interfaces from components, or named reusable pieces of UI; [TypeScript](../../types/listing.ts), JavaScript with checked data shapes; and [Tailwind CSS](../../app/globals.css), utility classes for styling. It uses [mock data](../../lib/listings.ts), meaning sample property records stored with the project rather than loaded from a listings service.

**Start here:** A traveler uses the site to find stays by destination and style, compare nightly prices, and inspect photos and host details before trying a booking estimate; the interface does not submit a real reservation.

## Running example

These two real entries from the local data are reused throughout the walkthrough.

| Stay | Route ID | Area and category | Nightly price | Maximum guests |
|---|---|---|---:|---:|
| Casa Mirador | `casa-mirador` | Sayulita, Beachfront | $189 | 6 |
| Beach bungalow | `beach-bungalow` | Ericeira, Beachfront | $156 | 3 |

## Logic flow

A **component** is a named piece of interface that can be reused; `ListingCard` is one example in [listing-card.tsx](../../components/listing-card.tsx). A **route** is a URL path that selects a page; the app has `/`, `/catalog`, and `/rooms/[id]`.

1. **Home starts the search.** `HomePage` is a **client component**, a component that runs in the browser so it can respond to input. Its **state** is information React remembers between renders, such as the query and selected category. Example: typing `Sayulita` updates the query and matches Casa Mirador in [page.tsx](../../app/page.tsx).
2. **The page derives visible results.** A **derived list** is a result calculated from source data and current choices instead of stored as a second copy. `useMemo` provides **memoization**, reusing that calculation until its inputs change. Example: choosing `Beachfront` matches Casa Mirador and the beach bungalow; sorting low-to-high puts $156 before $189 in [catalog-view.tsx](../../components/catalog-view.tsx).
3. **The catalog carries a submitted query.** `SiteHeader` submits a query through Next.js navigation, and `CatalogPage` reads `q` before passing it to `CatalogView`. A **prop** is a value passed from one component to another. Example: searching `Italy` opens `/catalog?q=Italy` and initializes the catalog query in [site-header.tsx](../../components/site-header.tsx) and [page.tsx](../../app/catalog/page.tsx).
4. **A listing opens its room.** A **dynamic route** is a route whose path contains a value, here the room `id` in `/rooms/[id]`. `RoomPage` looks up that ID; an **interface** is a TypeScript description of the fields an object must have, and `Room` extends the card-sized `Listing` shape with room details. Example: `casa-mirador` resolves to Casa Mirador; an unknown ID produces a **404 response**, the standard “not found” status, in [the room page](../../app/rooms/[id]/page.tsx) and [listing types](../../types/listing.ts).
5. **Room details support exploration and booking estimates.** `RoomDetails` displays the gallery, host, amenities, reviews, and booking card. A **functional update** is a state update callback that receives the previous value, so the next guest count can be calculated safely. Example: Casa Mirador's plus control stops at 6 guests, while two nights at $189 produce a $468 pre-tax estimate in [room-details.tsx](../../components/room-details.tsx).
6. **Loading timers are cleaned up.** A React **effect** runs side work such as a timer, and its cleanup cancels that work when the component leaves the page. Example: the Home skeleton is replaced after 350 milliseconds, and the timer is cleared if navigation happens first in [page.tsx](../../app/page.tsx).

An **array** is an ordered list of values; `Room[]` means a list of room records.

Search and catalog flow, using the `Room[]` array:

```text
Room[] -> filter(query, category) -> Room[] -> sort(price) -> Room[] -> ListingGrid -> ListingCard
```

Detail routing, where a lookup can return either a room or no match:

```text
params.id: string -> getListingById -> Room | undefined -> RoomDetails or notFound()
```

Booking estimate, where selected date strings lead to numeric costs:

```text
checkIn/checkOut: string -> numberOfNights: number -> fees: number -> total: number
```

## Key changes

| File and function or section | Example input -> output |
|---|---|
| [app/page.tsx](../../app/page.tsx), `HomePage` | `Sayulita` -> Casa Mirador appears in the home results. |
| [components/catalog-view.tsx](../../components/catalog-view.tsx), `CatalogView` | `Beachfront` plus low-to-high -> beach bungalow ($156), then Casa Mirador ($189). |
| [components/listing-grid.tsx](../../components/listing-grid.tsx), `ListingGrid` | Two matching rooms -> two reusable `ListingCard` components. |
| [components/listing-card.tsx](../../components/listing-card.tsx), `ListingCard` | `casa-mirador` -> a card linking to `/rooms/casa-mirador`. |
| [app/catalog/page.tsx](../../app/catalog/page.tsx), `CatalogPage` | `?q=Italy` -> `CatalogView` starts with the query `Italy`. |
| [app/rooms/[id]/page.tsx](../../app/rooms/[id]/page.tsx), `RoomPage` | `casa-mirador` -> room details; unknown ID -> not found. |
| [types/listing.ts](../../types/listing.ts), `Listing` and `Room` | Card fields -> shared fields plus host, gallery, amenities, and booking details. |
| [components/room-details.tsx](../../components/room-details.tsx), booking card | Casa Mirador, 2 nights -> $468 before taxes. |
| [app/globals.css](../../app/globals.css), responsive styles | One-column mobile layout -> wider grid layouts at larger breakpoints. |

## Lessons

### Lesson 1: Derive results from search and category state

**Concept:** Search text and category selection describe what the user wants to see. The page filters the original listing array from those values, so it does not need to keep a second, possibly stale result array.

**Code reference:** [HomePage filtering](../../app/page.tsx).

```tsx
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
```

`trim()` removes spaces at the ends; `toLowerCase()` makes the comparison case-insensitive; `filter()` keeps records whose callback returns true; both conditions must match.

**Example:** Input: query `Sayulita`, category `All stays`. Output: Casa Mirador matches because its city is Sayulita.

**Without this:**

| Separate stored results | Derived results |
|---|---|
| Query changes but a copied result array stays unchanged. | Query changes, so the filter returns the matching Casa Mirador record. |

**Takeaway:** Keep the source list and calculate the visible list from the current controls.

### Lesson 2: Reuse one listing card and adapt the grid by screen size

**Concept:** `ListingGrid` maps each result to the same `ListingCard`, so Home and Catalog show consistent cards. The Tailwind classes start with one column and add two- and three-column layouts at wider breakpoints.

**Code reference:** [ListingGrid](../../components/listing-grid.tsx).

```tsx
<div className="listing-grid grid grid-cols-1 gap-x-[22px] gap-y-[27px] md:grid-cols-2 md:gap-y-[36px] lg:grid-cols-3">
  {listings.map((listing) => (
    <ListingCard key={listing.id} listing={listing} />
  ))}
</div>
```

`grid-cols-1` is the base layout; `md:grid-cols-2` and `lg:grid-cols-3` add columns at wider breakpoints; `map()` creates one card per room; `key` gives each card a stable ID.

**Example:** Input: the two Beachfront entries. Output: two cards, showing $156 and $189 nightly prices.

**Without this:**

| Separate Home and Catalog markup | Shared card |
|---|---|
| A price-label change must be copied into both pages. | One `ListingCard` change updates both pages. |

**Takeaway:** Reuse the display component and let responsive classes add columns as space allows.

### Lesson 3: Type the data and handle unknown room IDs

**Concept:** `Listing` describes the shared information a card needs, while `Room` adds the full detail fields. The dynamic route looks up an ID and calls `notFound()` before rendering when there is no matching room.

**Code reference:** [Room lookup](../../app/rooms/[id]/page.tsx) and [room interface](../../types/listing.ts).

```tsx
const listing = getListingById(id);

if (!listing) notFound();

return <RoomDetails listing={listing} />;
```

The lookup may return a `Room` or no value; the guard handles the no-value case; the final line passes a valid room to `RoomDetails`.

```ts
export interface Room extends Listing {
  images: string[];
  host: string;
  hostTitle: string;
  hostYears: number;
  superhost: boolean;
}
```

`extends Listing` inherits the card fields; the following typed properties add room-specific information.

**Example:** Input: `casa-mirador`. Output: Casa Mirador's `Room` reaches `RoomDetails`. Input: `unknown-id`. Output: the not-found page.

**Without this:**

| No ID guard | Guard before rendering |
|---|---|
| An unknown ID can leave the page trying to display missing room data. | The unknown ID returns a 404 response; valid IDs render room details. |

**Takeaway:** Check a lookup before passing its result into a component that requires data.

### Lesson 4: Bound guest count and calculate the estimate from inputs

**Concept:** The guest counter uses the smaller of the app limit and the property's capacity. A functional update receives the previous count, so repeated clicks cannot calculate from an outdated value.

**Code reference:** [Guest cap and counter](../../components/room-details.tsx).

```tsx
const maxGuests = Math.min(MAX_GUESTS, listing.guests);

setGuestCount((previous) =>
  Math.min(maxGuests, previous + 1),
);
```

`Math.min()` chooses the smaller limit; the callback receives `previous`; the next count is capped at `maxGuests`.

The price uses the number of nights, a fixed cleaning fee, and a rounded service fee:

```tsx
const cleaningFee = 45;
const serviceFee = Math.round(listing.price * Math.max(numberOfNights, 1) * 0.12);
const total = listing.price * numberOfNights + cleaningFee + serviceFee;
```

`Math.max(numberOfNights, 1)` avoids multiplying the service fee by zero before dates are chosen; `Math.round()` rounds the service fee to a whole dollar; `total` adds nightly cost and fees.

**Example:** Input: Casa Mirador at $189/night and a stay already calculated as 2 nights. Service fee: `Math.round(189 * 2 * 0.12) = Math.round(45.36) = 45`. Total: `189 * 2 + 45 cleaning + 45 service = 468` dollars before taxes. The six-guest capacity comes from this listing's sample data.

**Without this:**

| Unbounded counter | Capacity-aware counter |
|---|---|
| Casa Mirador could be set to 7 even though it holds 6. | The plus button stops at 6, and the booking handler also checks capacity. |

**Takeaway:** Apply the property's limit when changing guest state, then validate again when submitting.

### Lesson 5: Clean up loading timers

**Concept:** The Home page shows a loading skeleton while its simulated delay runs. Returning a cleanup function cancels the timer if the user leaves before it finishes.

**Code reference:** [Home loading effect](../../app/page.tsx).

```tsx
useEffect(() => {
  const timer = window.setTimeout(() => setIsLoading(false), 350);
  return () => window.clearTimeout(timer);
}, []);
```

`setTimeout()` runs after 350 milliseconds; the returned function clears that timer; the empty dependency array makes this a mount-time effect. A millisecond is one-thousandth of a second.

**Example:** Input: Home opens with `isLoading` true. Output: after 350 milliseconds the skeleton is replaced with the Casa Mirador and other matching cards.

**Without this:**

| Timer without cleanup | Timer with cleanup |
|---|---|
| Navigation away leaves the pending timer scheduled. | Navigation away clears the timer before it can update the departed page. |

**Takeaway:** Whenever an effect starts a timer, return cleanup that cancels it.

## Verification

`npm run lint` passed, and `npm run build` compiled TypeScript and generated the Home, Catalog, and known room routes. Route smoke checks returned success for valid routes and a not-found response for an unknown room. No automated test script is configured, so these checks do not replace a unit-test suite.

## Glossary

- **404 response**: the status returned when a requested room ID has no matching data; see [RoomPage](../../app/rooms/[id]/page.tsx).
- **Array**: an ordered list of values, written as `Room[]` for room records; see [listings](../../lib/listings.ts).
- **Client component**: a React component that can run in the browser and respond to user input; see [HomePage](../../app/page.tsx).
- **Component**: a reusable piece of interface, such as a listing card; see [ListingCard](../../components/listing-card.tsx).
- **Derived list**: a list calculated from source data and current user choices; see [CatalogView](../../components/catalog-view.tsx).
- **Dynamic route**: a route that reads a value from a path segment such as `[id]`; see [RoomPage](../../app/rooms/[id]/page.tsx).
- **Effect**: React code for work outside rendering, such as a timer; see [HomePage](../../app/page.tsx).
- **Functional update**: a state update callback that uses the previous value to calculate the next value; see [RoomDetails](../../components/room-details.tsx).
- **Interface**: a TypeScript definition of the fields an object must provide; see [Room](../../types/listing.ts).
- **Memoization**: reusing a calculated result until its inputs change; see [CatalogView](../../components/catalog-view.tsx).
- **Millisecond**: one-thousandth of a second, the unit used by `setTimeout`; see [HomePage](../../app/page.tsx).
- **Mock data**: example records stored locally instead of retrieved from a live listings service; see [listings](../../lib/listings.ts).
- **Next.js**: the React framework providing the app's routing and page rendering; see [CatalogPage](../../app/catalog/page.tsx).
- **Prop**: a value passed from a parent component to a child; see the `listing` prop in [ListingCard](../../components/listing-card.tsx).
- **React**: the library used here to build the interface from components and state; see [HomePage](../../app/page.tsx).
- **Route**: a URL path connected to a page; see [the app routes](../../app/page.tsx).
- **State**: a value React remembers between renders so the interface can respond to changes; see `query` in [HomePage](../../app/page.tsx).
- **Tailwind CSS**: a styling system that provides utility classes used in markup; see [responsive layout classes](../../components/listing-grid.tsx).
- **TypeScript**: JavaScript with type checking for values and object shapes; see [listing interfaces](../../types/listing.ts).

## Further reading

- [Next.js App Router](https://nextjs.org/docs/app)
- [React: State as a Component's Memory](https://react.dev/learn/state-a-components-memory)
- [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design)

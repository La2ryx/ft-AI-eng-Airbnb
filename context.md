# Airbnb UI Clone: Vision and Page Specifications

## User intent

The user is a traveler planning a getaway who wants to discover distinctive places to stay, narrow options by destination and style, compare nightly prices, and inspect property photos and booking details before choosing a stay. The platform should make that exploration feel calm, welcoming, photo-led, and easy on both mobile and desktop.

## Pages and routes

### Home (`/`)

The home view introduces the stay collection with a destination search, category filters, and curated listing cards.

Main components: `HomePage`, `SiteHeader`, `CategoryRail`, `ListingGrid`, `ListingCard` (through the grid), and `ListingSkeleton`.

### Catalog (`/catalog`)

The catalog view shows searchable results with category filtering and recommended, ascending-price, or descending-price sorting.

Main components: `CatalogPage`, `CatalogView`, `SiteHeader`, `CategoryRail`, `ListingGrid`, `ListingCard` (through the grid), and `ListingSkeleton`.

### Room detail (`/rooms/[id]`)

The room view presents a property's photo gallery, host information, guest capacity, sleeping arrangements, amenities, reviews, and interactive booking card.

Main components: `RoomPage`, `RoomDetails`, and its `RoomHeader`.

Use Next.js `Link` for internal navigation. The listing detail route should return a not-found page for an unknown listing id.

## Interaction and state

- Keep client state limited to user interactions such as the search query, selected category, sort order, gallery selection, dates, guest count, and simulated loading.
- Derive visible and sorted listings during render rather than storing duplicate result arrays.
- Update guest count functionally and keep it between 1 and 16, also respecting the selected property's stated guest capacity.
- Use a short simulated loading state where listings/details are initialized and clear its timeout on unmount.
- Provide clear empty-search and booking feedback; booking controls are a front-end demonstration and do not submit a real reservation.

## Data and visual direction

- Use local typed mock listing data; there is no configured external listings API.
- Use screenshot references supplied by the user to refine the initial responsive Airbnb-inspired visual design.
- Use publicly hosted sample photography for this UI prototype.

## Screenshot-to-component mapping

- The listing photos, locations, categories, and nightly prices inform the typed `Listing` and `Room` data, with `ListingCard` reused in both Home and Catalog.
- The discovery and filtering hierarchy is split between `SiteHeader` for destination search, `CategoryRail` for category selection, and `ListingGrid` for responsive results.
- The property imagery and booking details map to the `RoomDetails` gallery, host and amenity sections, and booking card on `/rooms/[id]`.
- The page layouts use mobile-first styles in `app/globals.css`, with wider layouts introduced at the tablet and desktop breakpoints.

## Airbnb Listings Screenshots
- ![Airbnb Listing 1](www.airbnb.com_rooms_673793703984548059_category_tag=Tag%253A5348&search_mode=flex_destinations_search&adults=1&check_in=2026-11-15&check_out=2026-11-20&children=0&infants=0&pets=0&photo_id=1450651242&source_impressi-1.png)
- ![Airbnb Listing 2](www.airbnb.com_rooms_1151004431555565274_category_tag=Tag%253A5348&search_mode=flex_destinations_search&adults=1&check_in=2027-01-06&check_out=2027-01-11&children=0&infants=0&pets=0&photo_id=1901056939&source_impress.png)
- ![Airbnb Listing 3](www.airbnb.com_rooms_1606222111138528221_category_tag=Tag%253A5348&search_mode=flex_destinations_search&adults=1&check_in=2026-12-17&check_out=2026-12-22&children=0&infants=0&pets=0&photo_id=2491826447&source_impress.png)

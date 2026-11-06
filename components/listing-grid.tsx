import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listing-card";

interface ListingGridProps {
  listings: Listing[];
}

export const ListingGrid = ({ listings }: ListingGridProps) => {
  if (listings.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">⌕</span>
        <h2>No stays found</h2>
        <p>Try a different destination or category.</p>
      </div>
    );
  }

  return (
    <div className="listing-grid grid grid-cols-1 gap-x-[22px] gap-y-[27px] md:grid-cols-2 md:gap-y-[36px] lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};

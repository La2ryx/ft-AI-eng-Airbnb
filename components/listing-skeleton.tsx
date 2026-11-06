interface ListingSkeletonProps {
  count?: number;
}

export const ListingSkeleton = ({ count = 6 }: ListingSkeletonProps) => {
  return (
    <div
      aria-label="Loading stays"
      className="listing-grid grid grid-cols-1 gap-x-[22px] gap-y-[27px] md:grid-cols-2 md:gap-y-[36px] lg:grid-cols-3"
      role="status"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-image shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line skeleton-line-short shimmer" />
          <div className="skeleton-line skeleton-line-short shimmer" />
        </div>
      ))}
      <span className="sr-only">Loading stays</span>
    </div>
  );
};

import { notFound } from "next/navigation";
import { RoomDetails } from "@/components/room-details";
import { getListingById, listings } from "@/lib/listings";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return listings.map(({ id }) => ({ id }));
}

const RoomPage = async ({ params }: RoomPageProps) => {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) notFound();

  return <RoomDetails listing={listing} />;
};

export default RoomPage;

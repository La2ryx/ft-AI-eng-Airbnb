export interface SleepingArrangement {
  label: string;
  beds: { type: string; count: number }[];
}

export interface Review {
  name: string;
  city: string;
  date: string;
  rating: number;
  text: string;
}

export interface Listing {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  city: string;
  state: string;
  country: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  image: string;
  guests: number;
}

export interface Room extends Listing {
  images: string[];
  host: string;
  hostTitle: string;
  hostYears: number;
  superhost: boolean;
  guestFavorite: boolean;
  languages: string[];
  livesIn: string;
  bedrooms: number;
  beds: number;
  baths: number;
  description: string;
  amenities: string[];
  sleepingArrangements: SleepingArrangement[];
  checkInAfter: string;
  checkOutBefore: string;
  selfCheckIn: string;
  houseRules: string;
  cancellationPolicy: string;
  reviews: Review[];
}

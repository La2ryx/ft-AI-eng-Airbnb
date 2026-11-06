import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "airbnb | Find your place in the world",
  description: "Discover unique places to stay and unforgettable experiences.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;

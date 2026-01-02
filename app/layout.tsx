import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import SarnovaHeader from "@/components/SarnovaHeader";
import Container from "@/components/ui/Container";
import SarnovaNav from "@/components/SarnovaNav";
import { ProductProvider } from "@/context/ProductContext";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarnova Barcode Scanner",
  description:
    "Scan barcodes to get information about Sarnova products and add them to your cart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <ProductProvider>
          <SarnovaHeader />
          <Container className="flex-1 pb-24 md:pb-0">{children}</Container>
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 z-50 shadow-lg">
            <SarnovaNav />
          </div>
        </ProductProvider>
      </body>
    </html>
  );
}

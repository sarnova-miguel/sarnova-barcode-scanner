import SarnovaBarcodeScanner from "@/components/SarnovaBarcodeScanner";
import PageTitle from "@/components/ui/PageTitle";

export default function Home() {
  return (
    <section>
      <PageTitle>Sarnova Barcode Scanner</PageTitle>
      <p className="text-base md:text-lg text-gray-600">
        Use your camera to scan any barcode to get detailed product information!
      </p>
      <p className="text-base md:text-lg text-gray-600">
        Hold the barcode still and centered in the viewfinder for 2-3 seconds.
      </p>
      <p className="text-base md:text-lg text-gray-600">
        You can also upload an image containing a barcode.
      </p>
      <SarnovaBarcodeScanner />
    </section>
  );
}

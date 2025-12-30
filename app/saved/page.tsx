"use client";

import PageTitle from '@/components/ui/PageTitle'
import { useProducts } from '@/context/ProductContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

const SavedPage = () => {
  const { savedItems, removeFromSaved, addToCart } = useProducts();

  if (savedItems.length === 0) {
    return (
      <section>
        <PageTitle>Saved Products</PageTitle>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved products</h3>
          <p className="text-gray-500">Save products while scanning to view them here later</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageTitle>Saved Products ({savedItems.length})</PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedItems.map(item => (
          <div
            key={item.barcode_number}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            {/* Product Image */}
            <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                {item.product_name}
              </h3>
              {item.manufacturer && (
                <p className="text-sm text-gray-600 mb-1">
                  {item.manufacturer}
                </p>
              )}
              {item.category && (
                <p className="text-sm text-gray-500 mb-2">
                  {item.category}
                </p>
              )}
              <p className="text-xl font-bold text-cyan-500">
                ${item.price.toFixed(2)}
              </p>
              {item.barcode_number && (
                <p className="text-xs text-gray-400 mt-1">
                  Barcode: {item.barcode_number}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromSaved(item.barcode_number)}
                className="flex-1 gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToCart({
                    barcode_number: item.barcode_number,
                    product_name: item.product_name,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    manufacturer: item.manufacturer,
                    category: item.category,
                  });
                }}
                className="flex-1 gap-2 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SavedPage
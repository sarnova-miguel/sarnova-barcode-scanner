import React from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  image: string
  title: string
  price: number
  category: string
  manufacturer?: string
  barcode?: string
  description?: string
  className?: string
  onSaveClick?: () => void
  onAddToCartClick?: () => void
}

const ProductCard = ({
  image,
  title,
  price,
  category,
  manufacturer,
  barcode,
  description,
  className,
  onSaveClick,
  onAddToCartClick,
}: ProductCardProps) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm", className)}>
      {/* Product Image and Info */}
      <div className="flex gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-xl font-bold text-cyan-500 mb-1">
            ${price.toFixed(2)}
          </p>
          {manufacturer && (
            <p className="text-sm text-gray-600 font-medium">
              {manufacturer}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {category}
          </p>
          {barcode && (
            <p className="text-xs text-gray-400 mt-1">
              Barcode: {barcode}
            </p>
          )}
        </div>
      </div>

      {/* Product Description */}
      {description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={onSaveClick}
        >
          <Heart className="w-4 h-4" />
          Save
        </Button>
        <Button
          className="flex-1 gap-2 bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={onAddToCartClick}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}

export default ProductCard
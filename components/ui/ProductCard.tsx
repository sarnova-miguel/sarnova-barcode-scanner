import { useId } from 'react'
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
  isSaved?: boolean
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
  isSaved = false,
  onSaveClick,
  onAddToCartClick,
}: ProductCardProps) => {
  // Generate unique IDs for accessibility associations
  const uniqueId = useId();
  const titleId = `product-title-${uniqueId}`;
  const priceId = `product-price-${uniqueId}`;
  const descriptionId = description ? `product-desc-${uniqueId}` : undefined;

  return (
    <article
      className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm", className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Product Image and Info */}
      <div className="flex gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={`Product image: ${title}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id={titleId}
            className="text-base font-semibold text-gray-900 mb-1 line-clamp-2"
          >
            {title}
          </h3>
          <p
            id={priceId}
            className="text-xl font-bold text-cyan-500 mb-1"
            aria-label={`Price: $${price.toFixed(2)}`}
          >
            ${price.toFixed(2)}
          </p>
          {manufacturer && (
            <p className="text-sm text-gray-600 font-medium">
              <span className="sr-only">Manufacturer: </span>
              {manufacturer}
            </p>
          )}
          <p className="text-sm text-gray-500">
            <span className="sr-only">Category: </span>
            {category}
          </p>
          {barcode && (
            <p className="text-xs text-gray-400 mt-1">
              <span className="sr-only">Product barcode: </span>
              Barcode: {barcode}
            </p>
          )}
        </div>
      </div>

      {/* Product Description */}
      {description && (
        <div className="mb-4">
          <p
            id={descriptionId}
            className="text-sm text-gray-600 line-clamp-3"
          >
            {description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="flex gap-3"
        role="group"
        aria-label={`Actions for ${title}`}
      >
        <Button
          variant={isSaved ? "default" : "outline"}
          className={cn(
            "flex-1 gap-2 cursor-pointer",
            isSaved && "bg-red-500 hover:bg-red-600 text-white"
          )}
          onClick={onSaveClick}
          aria-label={isSaved ? `Remove ${title} from saved items` : `Save ${title} to your list`}
          aria-pressed={isSaved}
        >
          <Heart className={cn("w-4 h-4", isSaved && "fill-current")} aria-hidden="true" />
          {isSaved ? "Saved" : "Save"}
        </Button>
        <Button
          className="flex-1 gap-2 cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={onAddToCartClick}
          aria-label={`Add ${title} to shopping cart`}
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          Add to Cart
        </Button>
      </div>
    </article>
  )
}

export default ProductCard
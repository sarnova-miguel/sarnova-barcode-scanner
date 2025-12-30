"use client";

import PageTitle from '@/components/ui/PageTitle'
import { useProducts } from '@/context/ProductContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useProducts();

  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <section>
        <PageTitle>Cart</PageTitle>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-500">Scan a barcode to add products to your cart</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageTitle>Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</PageTitle>

      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div
            key={item.barcode_number}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4"
          >
            {/* Product Image */}
            <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                {item.product_name}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {item.manufacturer}
              </p>
              <p className="text-lg font-bold text-cyan-500">
                ${item.price.toFixed(2)}
              </p>
              {item.barcode_number && (
                <p className="text-xs text-gray-400 mt-1">
                  Barcode: {item.barcode_number}
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.barcode_number)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.barcode_number, item.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-base font-semibold w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.barcode_number, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <p className="text-sm font-semibold text-gray-700">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-700">Total:</span>
          <span className="text-2xl font-bold text-cyan-500">${total.toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearCart}
            className="flex-1"
          >
            Clear Cart
          </Button>
          <Button
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Checkout
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CartPage
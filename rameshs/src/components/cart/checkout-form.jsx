"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowLeft, CreditCard, Truck } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Textarea } from "../../components/ui/textarea"
import useCartStore from "../../store/cartStore"
import { formatPrice } from "../../lib/utils"
import { HeritageCornerDecoration } from "../../components/ui/heritage-decorations"

export default function CheckoutForm({ onBack, onComplete }) {
  const { items, totalAmount, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Calculate summary values
  const subtotal = totalAmount
  const shipping = subtotal > 500 ? 0 : 50
  const tax = Math.round(subtotal * 0.05) // 5% tax
  const total = subtotal + shipping + tax

  const onSubmit = (data) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Order submitted:", { ...data, items, total })
      setIsSubmitting(false)
      clearCart()
      onComplete?.()
    }, 2000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Checkout Form */}
      <div className="relative">
        <HeritageCornerDecoration className="absolute inset-0" variant="corners" />
        <Button variant="ghost" size="sm" className="mb-4 relative z-10" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

        <h2 className="text-2xl font-display font-semibold mb-6 text-gold-dark flex items-center">
          Checkout
          <div className="ml-3 h-0.5 w-16 bg-gradient-to-r from-gold/80 to-transparent"></div>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName", { required: "First name is required" })}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName", { required: "Last name is required" })}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                })}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping Address</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address", { required: "Address is required" })}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city", { required: "City is required" })}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  {...register("pincode", {
                    required: "PIN code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Please enter a valid 6-digit PIN code",
                    },
                  })}
                  className={errors.pincode ? "border-destructive" : ""}
                />
                {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Special instructions for delivery" {...register("notes")} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Method</h3>

            <RadioGroup defaultValue="cod">
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Cash on Delivery
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit/Debit Card
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-cream/30 rounded-lg p-6 sticky top-24 relative border border-gold/10">
        <HeritageCornerDecoration className="absolute inset-0" variant="corners" />
        <h3 className="text-lg font-medium mb-4">Order Summary</h3>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">
                {typeof item.price === "number"
                  ? formatPrice(item.price * item.quantity)
                  : `${item.price} × ${item.quantity}`}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gold/10 pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>

          <div className="border-t border-gold/10 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-gold-dark">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

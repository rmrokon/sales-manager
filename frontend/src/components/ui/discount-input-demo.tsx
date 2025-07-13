"use client"

import * as React from "react"
import { DiscountInput, DiscountValue } from "./discount-input"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function DiscountInputDemo() {
  const [discount, setDiscount] = React.useState<DiscountValue>({
    type: 'percentage',
    value: 0
  })
  
  const totalAmount = 1000 // Example total amount

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Discount Component Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Example with total amount: ${totalAmount.toFixed(2)}
        </div>
        
        <DiscountInput
          label="Apply Discount"
          value={discount}
          onChange={setDiscount}
          totalAmount={totalAmount}
          showCalculation={false}
        />
        
        <div className="text-sm">
          <strong>Current Discount:</strong> {' '}
          {discount.type === 'percentage' 
            ? `${discount.value}%` 
            : `$${discount.value}`
          }
        </div>
      </CardContent>
    </Card>
  )
}

// Usage examples:

// 1. Basic usage
export function BasicDiscountExample() {
  const [discount, setDiscount] = React.useState<DiscountValue>({
    type: 'percentage',
    value: 10
  })

  return (
    <DiscountInput
      label="Discount"
      value={discount}
      onChange={setDiscount}
      totalAmount={500}
    />
  )
}

// 2. Without calculation display
export function SimpleDiscountExample() {
  const [discount, setDiscount] = React.useState<DiscountValue>({
    type: 'amount',
    value: 50
  })

  return (
    <DiscountInput
      label="Quick Discount"
      value={discount}
      onChange={setDiscount}
      totalAmount={300}
      showCalculation={false}
      placeholder="Enter discount amount"
    />
  )
}

// 3. Disabled state
export function DisabledDiscountExample() {
  const discount: DiscountValue = {
    type: 'percentage',
    value: 15
  }

  return (
    <DiscountInput
      label="Applied Discount (Read-only)"
      value={discount}
      totalAmount={200}
      disabled={true}
      showCalculation={false}
    />
  )
}

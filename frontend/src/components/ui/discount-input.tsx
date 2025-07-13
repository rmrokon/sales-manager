"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type DiscountType = 'percentage' | 'amount'

export interface DiscountValue {
  type: DiscountType
  value: number
}

interface DiscountInputProps {
  label?: string
  value?: DiscountValue
  onChange?: (discount: DiscountValue) => void
  totalAmount?: number
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  showCalculation?: boolean
}

export function DiscountInput({
  label = "Discount",
  value = { type: 'percentage', value: 0 },
  onChange,
  totalAmount = 0,
  placeholder,
  disabled = false,
  className,
  id,
  showCalculation = true
}: DiscountInputProps) {
  const handleValueChange = (newValue: string) => {
    const numericValue = newValue === '' ? 0 : parseFloat(newValue) || 0
    onChange?.({
      type: value.type,
      value: numericValue
    })
  }

  const handleTypeChange = (newType: DiscountType) => {
    onChange?.({
      type: newType,
      value: value.value
    })
  }

  const calculateDiscountAmount = (): number => {
    if (value.type === 'percentage') {
      return (totalAmount * value.value) / 100
    }
    return value.value
  }

  const calculateFinalAmount = (): number => {
    return Math.max(0, totalAmount - calculateDiscountAmount())
  }

  const isValidDiscount = (): boolean => {
    if (value.type === 'percentage') {
      return value.value >= 0 && value.value <= 100
    }
    return value.value >= 0 && value.value <= totalAmount
  }

  const getInputPlaceholder = (): string => {
    if (placeholder) return placeholder
    return value.type === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'
  }

  const getMaxValue = (): number => {
    return value.type === 'percentage' ? 100 : totalAmount
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            id={id}
            type="number"
            min="0"
            max={getMaxValue()}
            step={value.type === 'percentage' ? '0.1' : '0.01'}
            value={value.value === 0 ? '' : value.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={getInputPlaceholder()}
            disabled={disabled}
            className={cn(
              !isValidDiscount() && value.value > 0 && "border-red-500 focus:border-red-500"
            )}
          />
        </div>

        <Select
          value={value.type}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">
              <span className="flex items-center gap-1">
                <span>%</span>
                <span>Percent</span>
              </span>
            </SelectItem>
            <SelectItem value="amount">
              <span className="flex items-center gap-1">
                <span>$</span>
                <span>Amount</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Show calculated amount for percentage */}
        {value.type === 'percentage' && value.value > 0 && isValidDiscount() && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            = ${calculateDiscountAmount().toFixed(2)}
          </div>
        )}
      </div>

      {!isValidDiscount() && value.value > 0 && (
        <p className="text-sm text-red-600">
          {value.type === 'percentage' 
            ? 'Percentage must be between 0 and 100'
            : `Amount cannot exceed $${totalAmount.toFixed(2)}`
          }
        </p>
      )}


    </div>
  )
}

// Helper function to calculate discount amount
export function calculateDiscountAmount(discount: DiscountValue, totalAmount: number): number {
  if (discount.type === 'percentage') {
    return (totalAmount * discount.value) / 100
  }
  return discount.value
}

// Helper function to apply discount to total
export function applyDiscount(discount: DiscountValue, totalAmount: number): number {
  return Math.max(0, totalAmount - calculateDiscountAmount(discount, totalAmount))
}

"use client"

import * as React from "react"
import { CalendarIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Filter types
export interface TextFilter {
  type: 'text'
  key: string
  label: string
  placeholder?: string
}

export interface DateFilter {
  type: 'date'
  key: string
  label: string
  mode: 'single' | 'range'
}

export interface DateRange {
  from?: Date | undefined
  to?: Date | undefined
}

export interface SelectFilter {
  type: 'select'
  key: string
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export type FilterConfig = TextFilter | DateFilter | SelectFilter

export interface FilterValues {
  [key: string]: any
}

export interface TableFiltersProps {
  filters: FilterConfig[]
  values: FilterValues
  onChange: (values: FilterValues) => void
  onReset: () => void
  className?: string
}

export function TableFilters({
  filters,
  values,
  onChange,
  onReset,
  className
}: TableFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value
    })
  }

  const handleRemoveFilter = (key: string) => {
    const newValues = { ...values }
    delete newValues[key]
    onChange(newValues)
  }

  const activeFiltersCount = Object.keys(values).filter(key => {
    const value = values[key]
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  const hasActiveFilters = activeFiltersCount > 0

  // Separate text filters from other filters
  const textFilters = filters.filter(f => f.type === 'text')
  const otherFilters = filters.filter(f => f.type !== 'text')
  const hasOtherFilters = otherFilters.length > 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Filters (beside other controls) */}
        {textFilters.map((filter) => (
          <div key={filter.key} className="w-64">
            <FilterField
              filter={filter}
              value={values[filter.key]}
              onChange={(value) => handleFilterChange(filter.key, value)}
              showLabel={false}
            />
          </div>
        ))}

        <div className="flex items-center gap-2">
          {hasOtherFilters && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onReset()
                          setIsOpen(false)
                        }}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {otherFilters.map((filter) => (
                    <FilterField
                      key={filter.key}
                      filter={filter}
                      value={values[filter.key]}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(values).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null
            
            const filter = filters.find(f => f.key === key)
            if (!filter) return null

            return (
              <FilterTag
                key={key}
                filter={filter}
                value={value}
                onRemove={() => handleRemoveFilter(key)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// Individual filter field component
function FilterField({
  filter,
  value,
  onChange,
  showLabel = true
}: {
  filter: FilterConfig
  value: any
  onChange: (value: any) => void
  showLabel?: boolean
}) {
  switch (filter.type) {
    case 'text':
      return (
        <div className="space-y-2">
          {showLabel && <Label htmlFor={filter.key}>{filter.label}</Label>}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={filter.key}
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )

    case 'date':
      if (filter.mode === 'range') {
        return <DateRangeFilter filter={filter} value={value} onChange={onChange} />
      } else {
        return <SingleDateFilter filter={filter} value={value} onChange={onChange} />
      }

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={filter.key}>{filter.label}</Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    default:
      return null
  }
}

// Single date filter
function SingleDateFilter({
  filter,
  value,
  onChange
}: {
  filter: DateFilter
  value: Date | undefined
  onChange: (value: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      <Label>{filter.label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? value.toLocaleDateString() : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Date range filter
function DateRangeFilter({
  filter,
  value,
  onChange
}: {
  filter: DateFilter
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      <Label>{filter.label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
              ) : (
                value.from.toLocaleDateString()
              )
            ) : (
              "Select date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Filter tag component
function FilterTag({
  filter,
  value,
  onRemove
}: {
  filter: FilterConfig
  value: any
  onRemove: () => void
}) {
  const getDisplayValue = () => {
    switch (filter.type) {
      case 'text':
        return `${filter.label}: "${value}"`
      case 'date':
        if (filter.mode === 'range' && value?.from) {
          return value.to
            ? `${filter.label}: ${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
            : `${filter.label}: ${value.from.toLocaleDateString()}`
        } else if (value instanceof Date) {
          return `${filter.label}: ${value.toLocaleDateString()}`
        }
        return `${filter.label}: ${value}`
      case 'select':
        const option = (filter as SelectFilter).options.find(opt => opt.value === value)
        return `${filter.label}: ${option?.label || value}`
      default:
        return `${filter.label}: ${value}`
    }
  }

  return (
    <Badge variant="secondary" className="gap-1">
      {getDisplayValue()}
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-muted-foreground hover:text-foreground"
        onClick={onRemove}
      >
        <XIcon className="h-3 w-3" />
      </Button>
    </Badge>
  )
}

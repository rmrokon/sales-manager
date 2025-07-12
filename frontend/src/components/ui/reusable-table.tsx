"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Eye, Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { TableFilters, FilterConfig, FilterValues } from "@/components/ui/table-filters"

// Base column definition for simple tables
export interface SimpleColumn<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
}

// Action button configuration
export interface ActionButton<T> {
  type: 'view' | 'edit' | 'delete' | 'custom'
  href?: (row: T) => string
  onClick?: (row: T) => void
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  tooltip?: string
  disabled?: (row: T) => boolean
  confirmMessage?: string // For delete actions
}

// Props for the reusable table
export interface DataTableProps<T> {
  data: T[]
  columns: SimpleColumn<T>[]
  isLoading?: boolean
  emptyMessage?: string
  actions?: ActionButton<T>[]
  customActions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string
  keyExtractor: (row: T) => string | number
  showActions?: boolean
  // Pagination props
  pagination?: boolean
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  // Filter props
  filters?: FilterConfig[]
  filterValues?: FilterValues
  onFilterChange?: (values: FilterValues) => void
  showFilters?: boolean
}

// Default action buttons
const getDefaultActionIcon = (type: ActionButton<unknown>['type']) => {
  switch (type) {
    case 'view':
      return <Eye className="h-4 w-4" />
    case 'edit':
      return <Pencil className="h-4 w-4" />
    case 'delete':
      return <Trash className="h-4 w-4" />
    default:
      return null
  }
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available",
  actions = [],
  customActions,
  onRowClick,
  rowClassName,
  keyExtractor,
  showActions = true,
  pagination = false,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  totalItems,
  filters = [],
  filterValues = {},
  onFilterChange,
  showFilters = true,
}: DataTableProps<T>) {
  const handleActionClick = async (action: ActionButton<T>, row: T, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click when clicking actions
    
    if (action.type === 'delete' && action.confirmMessage) {
      if (!confirm(action.confirmMessage)) {
        return
      }
    }
    
    if (action.onClick) {
      action.onClick(row)
    }
  }

  const renderCellContent = (column: SimpleColumn<T>, row: T) => {
    if (column.render) {
      return column.render(getValue(row, column.key), row)
    }
    
    const value = getValue(row, column.key)
    return value !== null && value !== undefined ? String(value) : ''
  }

  const getValue = (obj: T, path: keyof T | string): unknown => {
    if (typeof path === 'string' && path.includes('.')) {
      return path.split('.').reduce((current: unknown, key: string) => {
        return (current as Record<string, unknown>)?.[key]
      }, obj)
    }
    return (obj as Record<string, unknown>)[path as string]
  }

  // Pagination logic
  const [internalCurrentPage, setInternalCurrentPage] = React.useState(currentPage)

  // Determine if we're using server-side pagination
  const isServerSidePagination = onPageChange && totalItems !== undefined

  // Use external pagination if provided, otherwise use internal
  const actualCurrentPage = isServerSidePagination ? currentPage : internalCurrentPage
  const actualTotalItems = isServerSidePagination ? totalItems : data?.length
  const actualPageSize = pageSize

  // Calculate pagination values
  const totalPages = Math.ceil(actualTotalItems / actualPageSize)
  const startIndex = (actualCurrentPage - 1) * actualPageSize
  const endIndex = Math.min(startIndex + actualPageSize, actualTotalItems)

  // Get current page data (only for client-side pagination)
  const paginatedData = pagination && !isServerSidePagination
    ? data?.slice(startIndex, endIndex)
    : data

  const handlePageChange = (newPage: number) => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(newPage)
    } else {
      setInternalCurrentPage(newPage)
    }
  }

  const handleFilterReset = () => {
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    )
  }

  const hasActions = showActions && (actions.length > 0 || customActions)
  const hasFilters = showFilters && filters.length > 0

  return (
    <div className="space-y-4">
      {hasFilters && (
        <TableFilters
          filters={filters}
          values={filterValues}
          onChange={onFilterChange || (() => {})}
          onReset={handleFilterReset}
        />
      )}

      <div className="rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData?.length > 0 ? (
            paginatedData?.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
                  rowClassName ? rowClassName(row) : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {renderCellContent(column, row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {customActions && customActions(row)}
                      {actions.map((action, actionIndex) => {
                        const isDisabled = action.disabled?.(row) || false

                        if (action.href && !isDisabled) {
                          return (
                            <Link key={actionIndex} href={action.href(row)}>
                              <Button
                                variant={action.variant || 'ghost'}
                                size={action.size || 'icon'}
                                className={action.className}
                                title={action.tooltip}
                              >
                                {action.icon || getDefaultActionIcon(action.type)}
                              </Button>
                            </Link>
                          )
                        }

                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'ghost'}
                            size={action.size || 'icon'}
                            className={action.className}
                            title={action.tooltip}
                            disabled={isDisabled}
                            onClick={(e) => handleActionClick(action, row, e)}
                          >
                            {action.icon || getDefaultActionIcon(action.type)}
                          </Button>
                        )
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (hasActions ? 1 : 0)} 
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {isServerSidePagination ? (
              `Showing ${startIndex + 1} to ${endIndex} of ${actualTotalItems} entries`
            ) : (
              `Showing ${startIndex + 1} to ${Math.min(endIndex, actualTotalItems)} of ${actualTotalItems} entries`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(actualCurrentPage - 1)}
              disabled={actualCurrentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">
                Page {actualCurrentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(actualCurrentPage + 1)}
              disabled={actualCurrentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export types for external use
// export type { SimpleColumn, ActionButton, DataTableProps }

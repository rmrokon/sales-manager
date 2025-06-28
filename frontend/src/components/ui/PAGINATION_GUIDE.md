# DataTable Pagination Guide

## Overview

The DataTable component now supports both client-side and server-side pagination with a simple, flexible API.

## Pagination Props

```tsx
interface DataTableProps<T> {
  // ... other props
  pagination?: boolean              // Enable/disable pagination (default: false)
  pageSize?: number                // Items per page (default: 10)
  currentPage?: number             // Current page for server-side pagination (default: 1)
  onPageChange?: (page: number) => void  // Callback for page changes (server-side)
  totalItems?: number              // Total items for server-side pagination
}
```

## Usage Patterns

### 1. Client-Side Pagination

Best for small to medium datasets (< 1000 items) where all data is loaded at once.

```tsx
<DataTable
  data={allInvoices}
  columns={columns}
  actions={actions}
  pagination={true}
  pageSize={10}
  keyExtractor={(invoice) => invoice.id}
/>
```

**How it works:**
- All data is passed to the component
- Component automatically slices data based on current page
- Navigation is handled internally
- No additional API calls needed

**Pros:**
- Simple to implement
- Fast navigation between pages
- No loading states between pages

**Cons:**
- All data must be loaded upfront
- Not suitable for large datasets
- Higher initial load time

### 2. Server-Side Pagination

Best for large datasets where data is fetched page by page from the server.

```tsx
const [currentPage, setCurrentPage] = useState(1)
const { data, isLoading } = useGetInvoicesQuery({ 
  page: currentPage, 
  limit: 10 
})

<DataTable
  data={data?.result || []}
  columns={columns}
  actions={actions}
  pagination={true}
  pageSize={10}
  currentPage={currentPage}
  totalItems={data?.total || 0}
  onPageChange={setCurrentPage}
  keyExtractor={(invoice) => invoice.id}
/>
```

**How it works:**
- Only current page data is passed to component
- `onPageChange` callback triggers new API call
- `totalItems` used to calculate total pages
- Component shows loading state during page changes

**Pros:**
- Efficient for large datasets
- Fast initial load
- Lower memory usage

**Cons:**
- Requires server-side implementation
- Loading states between pages
- More complex setup

### 3. No Pagination

For small datasets or when you want to show all items.

```tsx
<DataTable
  data={invoices}
  columns={columns}
  actions={actions}
  pagination={false}  // or omit this prop
  keyExtractor={(invoice) => invoice.id}
/>
```

## Complete Examples

### Client-Side Pagination Example

```tsx
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"

export function ClientSideInvoicesTable() {
  const { data, isLoading } = useGetAllInvoicesQuery()
  
  const columns: SimpleColumn<IInvoice>[] = [
    { key: 'id', header: 'ID' },
    { key: 'type', header: 'Type' },
    { 
      key: 'totalAmount', 
      header: 'Total', 
      render: (value) => formatCurrency(value) 
    }
  ]

  const actions: ActionButton<IInvoice>[] = [
    { type: 'view', href: (invoice) => `/invoices/${invoice.id}` },
    { type: 'edit', href: (invoice) => `/invoices/${invoice.id}/edit` }
  ]

  return (
    <DataTable
      data={data?.result || []}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      pagination={true}
      pageSize={15}
      keyExtractor={(invoice) => invoice.id}
    />
  )
}
```

### Server-Side Pagination Example

```tsx
import { useState } from "react"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"

export function ServerSideInvoicesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  
  const { data, isLoading } = useGetInvoicesQuery({ 
    page: currentPage, 
    limit: pageSize 
  })
  
  const columns: SimpleColumn<IInvoice>[] = [
    { key: 'id', header: 'ID' },
    { key: 'type', header: 'Type' },
    { 
      key: 'totalAmount', 
      header: 'Total', 
      render: (value) => formatCurrency(value) 
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  const actions: ActionButton<IInvoice>[] = [
    { type: 'view', href: (invoice) => `/invoices/${invoice.id}` },
    { type: 'edit', href: (invoice) => `/invoices/${invoice.id}/edit` },
    { 
      type: 'delete', 
      onClick: handleDelete,
      confirmMessage: "Are you sure?"
    }
  ]

  const handleDelete = async (invoice: IInvoice) => {
    // Delete logic
  }

  return (
    <DataTable
      data={data?.result || []}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      pagination={true}
      pageSize={pageSize}
      currentPage={currentPage}
      totalItems={data?.total || 0}
      onPageChange={setCurrentPage}
      keyExtractor={(invoice) => invoice.id}
    />
  )
}
```

## Server-Side API Requirements

For server-side pagination, your API should:

1. **Accept pagination parameters:**
   ```
   GET /api/invoices?page=1&limit=10
   ```

2. **Return paginated response:**
   ```json
   {
     "result": [...],
     "total": 150,
     "page": 1,
     "limit": 10,
     "totalPages": 15
   }
   ```

3. **Handle page boundaries:**
   - Return empty array for pages beyond available data
   - Validate page and limit parameters

## Pagination Controls

The component automatically renders pagination controls when `pagination={true}`:

- **Previous/Next buttons** with disabled states
- **Page indicator** showing "Page X of Y"
- **Items count** showing "Showing X to Y of Z entries"
- **Responsive design** that works on mobile

## Customization Options

### Page Size Options

```tsx
// Small pages for mobile-friendly tables
<DataTable pagination={true} pageSize={5} />

// Medium pages for desktop
<DataTable pagination={true} pageSize={10} />

// Large pages for data-heavy views
<DataTable pagination={true} pageSize={25} />
```

### Custom Styling

The pagination controls use standard Tailwind classes and can be customized by modifying the component or using CSS overrides.

## Best Practices

1. **Choose the right pagination type:**
   - Client-side: < 1000 items
   - Server-side: > 1000 items

2. **Optimize page sizes:**
   - Mobile: 5-10 items
   - Desktop: 10-25 items
   - Data tables: 25-50 items

3. **Handle loading states:**
   - Show spinner during initial load
   - Maintain table structure during page changes

4. **Provide feedback:**
   - Clear page indicators
   - Disabled states for navigation buttons
   - Item count information

5. **Consider performance:**
   - Debounce rapid page changes
   - Cache previous pages when possible
   - Use skeleton loading for better UX

## Migration from Old Tables

### Before (Manual Pagination)
```tsx
// Complex manual pagination logic
const [page, setPage] = useState(1)
const startIndex = (page - 1) * pageSize
const endIndex = startIndex + pageSize
const paginatedData = data.slice(startIndex, endIndex)

// Manual pagination controls
<div className="pagination">
  <button onClick={() => setPage(page - 1)}>Previous</button>
  <span>Page {page}</span>
  <button onClick={() => setPage(page + 1)}>Next</button>
</div>
```

### After (DataTable)
```tsx
// Simple prop configuration
<DataTable
  data={data}
  pagination={true}
  pageSize={10}
  // All pagination logic handled automatically
/>
```

## Troubleshooting

**Issue:** Pagination not showing
- **Solution:** Ensure `pagination={true}` is set

**Issue:** Server-side pagination not working
- **Solution:** Verify `onPageChange`, `currentPage`, and `totalItems` props are provided

**Issue:** Page count incorrect
- **Solution:** Check that `totalItems` matches actual server count

**Issue:** Performance issues with large datasets
- **Solution:** Switch from client-side to server-side pagination

# DataTable Filtering Guide

## Overview

The DataTable component now supports comprehensive server-side filtering with fuzzy text search, single date, and date range filtering. All filtering is handled on the backend for optimal performance.

## Filter Types

### 1. Text Filter (Fuzzy Search)
Performs partial matching across multiple fields in the backend.

```tsx
{
  type: 'text',
  key: 'search',
  label: 'Search',
  placeholder: 'Search invoices...'
}
```

**Backend Implementation:**
- Uses `ILIKE` operator for case-insensitive partial matching
- Searches across multiple relevant fields (e.g., ID, name, description)
- Supports fuzzy matching for better user experience

### 2. Single Date Filter
Filters records for a specific date.

```tsx
{
  type: 'date',
  key: 'date',
  label: 'Created Date',
  mode: 'single'
}
```

**Backend Implementation:**
- Filters for the entire day (00:00:00 to 23:59:59)
- Uses `BETWEEN` operator for precise date matching

### 3. Date Range Filter
Filters records within a date range.

```tsx
{
  type: 'date',
  key: 'dateRange',
  label: 'Date Range',
  mode: 'range'
}
```

**Backend Implementation:**
- Supports `dateFrom` and `dateTo` parameters
- Uses `>=` and `<=` operators for range filtering
- Handles partial ranges (only from or only to)

### 4. Select Filter
Dropdown selection for predefined options.

```tsx
{
  type: 'select',
  key: 'type',
  label: 'Type',
  options: [
    { value: 'provider', label: 'Provider' },
    { value: 'zone', label: 'Zone' }
  ],
  placeholder: 'Select type'
}
```

## Complete Implementation Example

### Frontend Component

```tsx
import { useState } from "react"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"

export default function InvoicesTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterValues, setFilterValues] = useState<FilterValues>({});
    
    // Transform filter values for API
    const getApiFilters = () => {
        const apiFilters: any = {};
        
        Object.entries(filterValues).forEach(([key, value]) => {
            if (key === 'dateRange' && value?.from) {
                apiFilters.dateFrom = value.from.toISOString().split('T')[0];
                if (value.to) {
                    apiFilters.dateTo = value.to.toISOString().split('T')[0];
                }
            } else if (key === 'date' && value) {
                apiFilters.date = value.toISOString().split('T')[0];
            } else if (value !== undefined && value !== null && value !== '') {
                apiFilters[key] = value;
            }
        });
        
        return apiFilters;
    };

    const { data, isLoading } = useGetInvoicesQuery({
        page: currentPage,
        limit: pageSize,
        ...getApiFilters()
    });

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilterValues(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Filter configuration
    const filters: FilterConfig[] = [
        {
            type: 'text',
            key: 'search',
            label: 'Search',
            placeholder: 'Search invoices...'
        },
        {
            type: 'select',
            key: 'type',
            label: 'Type',
            options: [
                { value: 'provider', label: 'Provider' },
                { value: 'zone', label: 'Zone' }
            ]
        },
        {
            type: 'date',
            key: 'date',
            label: 'Created Date',
            mode: 'single'
        },
        {
            type: 'date',
            key: 'dateRange',
            label: 'Date Range',
            mode: 'range'
        }
    ];

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            keyExtractor={(invoice) => invoice.id}
            pagination={true}
            pageSize={pageSize}
            currentPage={currentPage}
            totalItems={data?.pagination?.total || 0}
            onPageChange={setCurrentPage}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            showFilters={true}
        />
    );
}
```

### Backend Service Implementation

```typescript
async findInvoicesWithPagination(query: Record<string, unknown>) {
    // Extract filter parameters
    const { search, dateFrom, dateTo, date, type, ...otherQuery } = query;
    
    // Build where conditions
    const whereConditions: any = { ...otherQuery };
    
    // Add fuzzy search for multiple fields
    if (search) {
        whereConditions[Op.or] = [
            { id: { [Op.iLike]: `%${search}%` } },
            { type: { [Op.iLike]: `%${search}%` } },
            { '$ReceiverProvider.name$': { [Op.iLike]: `%${search}%` } },
            { '$ReceiverZone.name$': { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    // Add type filter
    if (type) {
        whereConditions.type = type;
    }
    
    // Add date filtering
    if (date) {
        // Single date - filter for that specific day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        whereConditions.createdAt = {
            [Op.between]: [startOfDay, endOfDay]
        };
    } else if (dateFrom || dateTo) {
        // Date range filtering
        const dateFilter: any = {};
        if (dateFrom) {
            const startDate = new Date(dateFrom);
            startDate.setHours(0, 0, 0, 0);
            dateFilter[Op.gte] = startDate;
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            dateFilter[Op.lte] = endDate;
        }
        whereConditions.createdAt = dateFilter;
    }

    const result = await this._repo.findWithPagination(whereConditions, {
        include: [
            { model: Provider, as: 'ReceiverProvider' },
            { model: Zone, as: 'ReceiverZone' }
        ]
    });
    
    return {
        ...result,
        nodes: result.nodes.map((record) => this.convertToJson(record))
    };
}
```

## Filter UI Components

### Filter Button
- Shows active filter count as a badge
- Toggles filter panel visibility
- Clear all filters option

### Filter Panel
- Popover-based interface
- Individual filter controls
- Clear all button

### Active Filter Tags
- Visual representation of active filters
- Individual remove buttons
- Formatted display values

## API Integration

### Query Parameters
The frontend automatically transforms filter values into API parameters:

```javascript
// Frontend filter values
{
  search: "invoice",
  type: "provider",
  dateRange: { from: Date, to: Date }
}

// Transformed API parameters
{
  search: "invoice",
  type: "provider",
  dateFrom: "2024-01-01",
  dateTo: "2024-01-31",
  page: 1,
  limit: 10
}
```

### Response Format
Backend returns filtered and paginated data:

```json
{
  "success": true,
  "result": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages_count": 15
  }
}
```

## Best Practices

### Performance
1. **Server-side filtering**: All filtering happens on the backend
2. **Debounced search**: Text inputs should be debounced (handled by component)
3. **Index optimization**: Ensure database indexes on filtered fields
4. **Pagination reset**: Reset to page 1 when filters change

### User Experience
1. **Clear feedback**: Show active filters as tags
2. **Easy clearing**: Provide clear all and individual clear options
3. **Persistent state**: Consider persisting filter state in URL
4. **Loading states**: Show loading during filter operations

### Data Validation
1. **Date validation**: Ensure valid date ranges
2. **Input sanitization**: Sanitize search inputs
3. **Type checking**: Validate filter types on backend

## Customization

### Adding New Filter Types
1. Extend `FilterConfig` type
2. Add UI component in `FilterField`
3. Handle transformation in `getApiFilters`
4. Implement backend logic

### Styling
- Use Tailwind classes for consistent styling
- Customize filter panel width and positioning
- Modify badge colors and styles

## Migration Guide

### From Manual Filtering
```tsx
// Before: Manual search input
<Input 
  placeholder="Search..." 
  onChange={(e) => setSearch(e.target.value)} 
/>

// After: Integrated filtering
<DataTable
  filters={[
    { type: 'text', key: 'search', label: 'Search' }
  ]}
  filterValues={filterValues}
  onFilterChange={handleFilterChange}
/>
```

### Backend Updates Required
1. Update service methods to handle filter parameters
2. Add fuzzy search logic with `ILIKE` operators
3. Implement date range filtering
4. Update controller to pass filter parameters

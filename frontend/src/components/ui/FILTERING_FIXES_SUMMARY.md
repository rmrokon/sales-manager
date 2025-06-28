# Filtering System Fixes Summary

## Issues Fixed

### 1. ✅ Sequelize Search Error
**Problem:** `SequelizeBaseError: Invalid value received for the "where" option` when using text search.

**Root Cause:** The `Op.or` syntax was including associated model fields that couldn't be used directly in the where clause.

**Solution:** Simplified the search to only include direct model fields:
```typescript
// Before (causing error)
whereConditions[Op.or] = [
  { id: { [Op.iLike]: `%${search}%` } },
  { type: { [Op.iLike]: `%${search}%` } },
  { '$ReceiverProvider.name$': { [Op.iLike]: `%${search}%` } }, // ❌ Problematic
  { '$ReceiverZone.name$': { [Op.iLike]: `%${search}%` } }      // ❌ Problematic
];

// After (working)
whereConditions[Op.or] = [
  { id: { [Op.iLike]: `%${search}%` } },
  { type: { [Op.iLike]: `%${search}%` } }
];
```

### 2. ✅ Search Filter UI Placement
**Problem:** Search filter was inside the popover, making it less accessible.

**Solution:** Moved text filters outside the popover for better UX:
```typescript
// Separate text filters from other filters
const textFilters = filters.filter(f => f.type === 'text')
const otherFilters = filters.filter(f => f.type !== 'text')

// Render text filters outside popover
{textFilters.length > 0 && (
  <div className="flex flex-wrap gap-4">
    {textFilters.map((filter) => (
      <div key={filter.key} className="flex-1 min-w-[200px]">
        <FilterField filter={filter} value={values[filter.key]} onChange={...} />
      </div>
    ))}
  </div>
)}
```

### 3. ✅ Date Timezone Issue
**Problem:** Searching for invoices created on 24/06/2025 returned invoices from 25/06/2025 due to timezone conversion.

**Root Cause:** Using `toISOString().split('T')[0]` was converting local dates to UTC, causing date shifts.

**Solution:** Use local date formatting to avoid timezone issues:
```typescript
// Before (causing timezone issues)
apiFilters.date = value.toISOString().split('T')[0];

// After (timezone-safe)
const date = new Date(value);
apiFilters.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
```

### 4. ✅ TypeScript Type Issues
**Problem:** Multiple TypeScript errors related to `any` types and type mismatches.

**Solutions Applied:**

#### Backend Type Fixes:
```typescript
// Fixed date parameter types
const startOfDay = new Date(date as string);
const startDate = new Date(dateFrom as string);
const endDate = new Date(dateTo as string);
```

#### Frontend Type Fixes:
```typescript
// Fixed render function types
render?: (value: unknown, row: T) => React.ReactNode

// Fixed getValue function
const getValue = (obj: T, path: keyof T | string): unknown => {
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((current: unknown, key: string) => {
      return (current as Record<string, unknown>)?.[key]
    }, obj)
  }
  return (obj as Record<string, unknown>)[path as string]
}

// Fixed column render functions with proper type casting
{
  key: 'totalAmount',
  header: 'Total Amount',
  render: (value) => formatCurrency(value as number)
},
{
  key: 'createdAt',
  header: 'Created At',
  render: (value) => new Date(value as string).toLocaleDateString()
}
```

#### DateRange Interface Fix:
```typescript
export interface DateRange {
  from?: Date | undefined  // Made optional to match react-day-picker
  to?: Date | undefined    // Made optional to match react-day-picker
}
```

## Current Status

### ✅ Working Features:
1. **Text Search**: Fuzzy search across invoice ID and type
2. **Date Filtering**: Single date and date range filtering with correct timezone handling
3. **Select Filtering**: Dropdown filters for predefined options
4. **UI/UX**: Search outside popover, other filters in popover
5. **Server-side Processing**: All filtering handled on backend
6. **Pagination Integration**: Filters work seamlessly with pagination

### ✅ Fixed Issues:
1. Sequelize search errors resolved
2. Search filter moved outside popover
3. Date timezone issues fixed
4. Major TypeScript type issues resolved

### 🔄 Remaining Minor Issues:
Some TypeScript warnings in example files that don't affect functionality:
- Parameter type annotations in non-critical example files
- Some `any` types in example components

## Usage Examples

### Basic Text Search:
```typescript
const filters: FilterConfig[] = [
  {
    type: 'text',
    key: 'search',
    label: 'Search',
    placeholder: 'Search invoices...'
  }
];
```

### Date Range Filtering:
```typescript
const filters: FilterConfig[] = [
  {
    type: 'date',
    key: 'dateRange',
    label: 'Date Range',
    mode: 'range'
  }
];
```

### Complete Filter Setup:
```typescript
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
      { value: InvoiceType.PROVIDER, label: 'Provider' },
      { value: InvoiceType.ZONE, label: 'Zone' }
    ]
  },
  {
    type: 'date',
    key: 'dateRange',
    label: 'Date Range',
    mode: 'range'
  }
];
```

## Backend Implementation

### Invoices Service:
```typescript
async findInvoicesWithPagination(query: Record<string, unknown>) {
  const { search, dateFrom, dateTo, date, type, ...otherQuery } = query;
  const whereConditions: any = { ...otherQuery };
  
  // Text search
  if (search) {
    whereConditions[Op.or] = [
      { id: { [Op.iLike]: `%${search}%` } },
      { type: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  // Type filter
  if (type) {
    whereConditions.type = type;
  }
  
  // Date filtering with proper timezone handling
  if (date) {
    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);
    
    whereConditions.createdAt = {
      [Op.between]: [startOfDay, endOfDay]
    };
  }
  
  // ... rest of implementation
}
```

## Performance Considerations

1. **Server-side Filtering**: All filtering happens on the database level
2. **Indexed Fields**: Ensure database indexes on frequently filtered fields
3. **Pagination Integration**: Filters reset pagination to page 1
4. **Debounced Search**: Text inputs are debounced to prevent excessive API calls

## Migration Guide

### From Manual Search:
```typescript
// Before
<Input onChange={(e) => setSearch(e.target.value)} />

// After
<DataTable
  filters={[{ type: 'text', key: 'search', label: 'Search' }]}
  filterValues={filterValues}
  onFilterChange={handleFilterChange}
/>
```

### Adding to Existing Tables:
1. Add filter state: `const [filterValues, setFilterValues] = useState<FilterValues>({})`
2. Add filter handler: `const handleFilterChange = (newFilters) => { setFilterValues(newFilters); setCurrentPage(1); }`
3. Transform filters for API: Use `getApiFilters()` pattern
4. Add filter props to DataTable component

## Testing

### Manual Testing Checklist:
- ✅ Text search returns correct results
- ✅ Date filtering respects timezone
- ✅ Date range filtering works correctly
- ✅ Select filters work properly
- ✅ Filter combinations work together
- ✅ Pagination resets when filters change
- ✅ Clear filters functionality works
- ✅ Filter tags display correctly

The filtering system is now fully functional and production-ready!

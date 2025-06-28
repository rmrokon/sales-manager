# Reusable Table Components Guide

This guide explains how to use the reusable table components in the application.

## Available Components

### 1. DataTable - Simple Table Component

A lightweight, easy-to-use table component for basic data display with actions.

**Best for:**
- Simple data tables
- Quick prototyping
- Tables that don't need advanced features like sorting/filtering
- Consistent styling across the app

**Features:**
- Built-in loading states
- Customizable columns with render functions
- Action buttons (view, edit, delete, custom)
- Row click handlers
- Empty state messages
- Responsive design

### 2. DataTable - Advanced Table Component

A powerful table component built on TanStack Table with advanced features.

**Best for:**
- Large datasets
- Tables requiring sorting, filtering, pagination
- Complex data manipulation
- Advanced user interactions

**Features:**
- Sorting and filtering
- Pagination
- Search functionality
- Column customization
- Row selection (can be extended)

## Usage Examples

### Basic DataTable Usage

```tsx
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"

// Define columns
const columns: SimpleColumn<YourDataType>[] = [
  {
    key: 'id',
    header: 'ID',
    className: 'font-medium'
  },
  {
    key: 'name',
    header: 'Name'
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (value) => formatCurrency(value)
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (value) => new Date(value).toLocaleDateString()
  }
]

// Define actions
const actions: ActionButton<YourDataType>[] = [
  {
    type: 'view',
    href: (row) => `/items/${row.id}`,
    tooltip: 'View details'
  },
  {
    type: 'edit',
    href: (row) => `/items/${row.id}/edit`,
    tooltip: 'Edit item'
  },
  {
    type: 'delete',
    onClick: handleDelete,
    confirmMessage: "Are you sure you want to delete this item?",
    tooltip: 'Delete item'
  }
]

// Use the component
<DataTable
  data={yourData}
  columns={columns}
  actions={actions}
  isLoading={isLoading}
  keyExtractor={(item) => item.id}
  emptyMessage="No items found"
/>
```

### Advanced DataTable Usage

```tsx
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  // ... more columns
]

<DataTable
  columns={columns}
  data={yourData}
  isLoading={isLoading}
  searchKey="name"
  searchPlaceholder="Search items..."
  pagination={true}
/>
```

## Column Configuration

### SimpleColumn Properties

```tsx
interface SimpleColumn<T> {
  key: keyof T | string          // Data key or custom identifier
  header: string                 // Column header text
  className?: string             // CSS classes for the column
  render?: (value: any, row: T) => React.ReactNode  // Custom render function
  sortable?: boolean             // Enable sorting (future feature)
}
```

### Custom Render Functions

```tsx
{
  key: 'status',
  header: 'Status',
  render: (value, row) => (
    <Badge variant={value === 'active' ? 'success' : 'secondary'}>
      {value}
    </Badge>
  )
}
```

## Action Configuration

### ActionButton Properties

```tsx
interface ActionButton<T> {
  type: 'view' | 'edit' | 'delete' | 'custom'
  href?: (row: T) => string      // For navigation actions
  onClick?: (row: T) => void     // For click handlers
  icon?: React.ReactNode         // Custom icon
  variant?: ButtonVariant        // Button style variant
  size?: ButtonSize              // Button size
  className?: string             // Additional CSS classes
  tooltip?: string               // Tooltip text
  disabled?: (row: T) => boolean // Conditional disable
  confirmMessage?: string        // Confirmation dialog for destructive actions
}
```

### Custom Actions

```tsx
{
  type: 'custom',
  icon: <Download className="h-4 w-4" />,
  onClick: (row) => downloadFile(row.id),
  tooltip: 'Download file',
  variant: 'outline'
}
```

## Migration from Existing Tables

### Before (Old Table)
```tsx
// Old manual table implementation
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Button onClick={() => handleEdit(item)}>Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### After (DataTable)
```tsx
<DataTable
  data={data}
  columns={[
    { key: 'name', header: 'Name' }
  ]}
  actions={[
    { type: 'edit', onClick: handleEdit }
  ]}
  keyExtractor={(item) => item.id}
/>
```

## Best Practices

1. **Choose the right component:**
   - Use `DataTable` for simple tables
   - Use `DataTable` for complex tables with sorting/filtering

2. **Performance:**
   - Use `keyExtractor` for efficient re-rendering
   - Memoize expensive render functions

3. **Accessibility:**
   - Provide meaningful tooltips for actions
   - Use semantic HTML structure

4. **Consistency:**
   - Use the same action patterns across tables
   - Follow the established column naming conventions

## Common Patterns

### Loading States
```tsx
<DataTable
  data={data || []}
  columns={columns}
  isLoading={isLoading}
  // ... other props
/>
```

### Conditional Actions
```tsx
const actions: ActionButton<Item>[] = [
  {
    type: 'edit',
    href: (item) => `/items/${item.id}/edit`,
    disabled: (item) => !item.canEdit
  }
]
```

### Row Click Navigation
```tsx
<DataTable
  // ... other props
  onRowClick={(item) => router.push(`/items/${item.id}`)}
  rowClassName={(item) => item.isHighlighted ? 'bg-yellow-50' : ''}
/>
```

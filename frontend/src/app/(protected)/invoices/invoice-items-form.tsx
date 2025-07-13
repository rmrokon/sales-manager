"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { useGetProductsQuery } from "@/store/services/product"
import { Plus, Trash } from "lucide-react"
import { useState } from "react"

interface InvoiceItem {
  id?: string
  productId: string
  quantity: number
  unitPrice: number
  discountPercent: number
}

interface InvoiceItemsFormProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
  invoiceId?: string
}

export default function InvoiceItemsForm({ items, onChange, invoiceId }: InvoiceItemsFormProps) {
  const { data: productsData, isLoading } = useGetProductsQuery({})
  const [newItem, setNewItem] = useState<InvoiceItem>({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    discountPercent: 0
  })

  const handleAddItem = () => {
    if (!newItem.productId) return

    // Find the product to get its price
    const product = productsData?.result.find(p => p.id === newItem.productId)
    if (product) {
      // Use the product's price as the unit price if not specified
      const itemToAdd = {
        ...newItem,
        quantity: newItem.quantity || 1, // Default to 1 if 0
        unitPrice: newItem.unitPrice || product.price
      }

      onChange([...items, itemToAdd])
      
      // Reset the form
      setNewItem({
        productId: '',
        quantity: 0,
        unitPrice: 0,
        discountPercent: 0
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const handleProductChange = (productId: string) => {
    const product = productsData?.result.find(p => p.id === productId)
    setNewItem({
      ...newItem,
      productId,
      unitPrice: product?.price || 0
    })
  }

  const calculateItemTotal = (item: InvoiceItem) => {
    return item.quantity * item.unitPrice * (1 - (item.discountPercent / 100))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const product = productsData?.result.find(p => p.id === item.productId)
                  return (
                    <TableRow key={index}>
                      <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{item.discountPercent}%</TableCell>
                      <TableCell>{formatCurrency(calculateItemTotal(item))}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-4">
              <Label htmlFor="productId">Product</Label>
              <Select 
                value={newItem.productId} 
                onValueChange={handleProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {productsData?.result.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                defaultValue={0}
                // value={newItem.quantity === 0 ? '' : newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={newItem.unitPrice === 0 ? '' : newItem.unitPrice}
                onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="discountPercent">Discount %</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={newItem.discountPercent === 0 ? '' : newItem.discountPercent}
                onChange={(e) => setNewItem({...newItem, discountPercent: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="col-span-2">
              <Button 
                type="button" 
                onClick={handleAddItem} 
                disabled={!newItem.productId || newItem.quantity < 1}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
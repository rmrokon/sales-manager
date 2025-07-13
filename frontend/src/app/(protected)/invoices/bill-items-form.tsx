import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { IBill } from "@/utils/types/bill";

interface BillItem {
  title: string;
  description?: string;
  amount: number;
}

interface BillItemsFormProps {
  items: BillItem[];
  onChange: (items: BillItem[]) => void;
}

export default function BillItemsForm({ items, onChange }: BillItemsFormProps) {
  const handleAddItem = () => {
    onChange([...items, { title: "", description: "", amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bill Items
          <Button type="button" onClick={handleAddItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Bill Item
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        placeholder="Enter title"
                        value={item.title || ""}
                        onChange={(e) => handleItemChange(index, "title", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Enter description (optional)"
                        value={item.description || ""}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.amount === 0 ? '' : item.amount || ''}
                        onChange={(e) => handleItemChange(index, "amount", e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="text-right"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="text-lg font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No bill items added yet. Click "Add Bill Item" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

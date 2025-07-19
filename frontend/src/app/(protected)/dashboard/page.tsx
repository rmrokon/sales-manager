'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  useGetInventoryQuery,
  useGetInventoryTransactionsQuery,
  useGetInventoryStatsQuery,
  useGetLowStockItemsQuery
} from '@/store/services/inventory-api';
import { DataTable } from '@/components/ui/reusable-table';
import { SimpleColumn } from '@/components/ui/reusable-table';
import { InventoryItem, InventoryTransaction, LowStockItem } from '@/store/services/inventory-api';
import { PageLoayout } from '@/components';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // API queries
  const { data, isLoading: statsLoading, refetch: refetchStats } = useGetInventoryStatsQuery();
  const inventoryStats = data?.result;
  const { data: inventoryData, isLoading: inventoryLoading, refetch: refetchInventory } = useGetInventoryQuery({
    search: searchTerm,
  });
  const inventory = inventoryData?.result;
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetInventoryTransactionsQuery({
    limit: 50,
  }); 
  const transactions = transactionsData?.result;
  const { data: lowStockItemsData, isLoading: lowStockLoading, refetch: refetchLowStock } = useGetLowStockItemsQuery({
    threshold: 10,
  });
  const lowStockItems = lowStockItemsData?.result;
console.log("inventoryStats in component", {inventoryStats});
  const handleRefresh = () => {
    refetchStats();
    refetchInventory();
    refetchTransactions();
    refetchLowStock();
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Products',
      value: inventoryStats?.totalProducts || 0,
      icon: Package,
      description: 'Products in inventory',
      color: 'text-blue-600',
    },
    {
      title: 'Total Value',
      value: `$${(inventoryStats?.totalValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      description: 'Current inventory value',
      color: 'text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: inventoryStats?.lowStockItems || 0,
      icon: AlertTriangle,
      description: 'Items below threshold',
      color: 'text-red-600',
    },
    {
      title: 'Recent Transactions',
      value: inventoryStats?.recentTransactions || 0,
      icon: Activity,
      description: 'Last 30 days',
      color: 'text-purple-600',
    },
  ];

  // Inventory table columns
  const inventoryColumns: SimpleColumn<InventoryItem>[] = [
    {
      key: 'Product.name',
      header: 'Product',
      render: (_, item) => (
        <div>
          <div className="font-medium">{item.product?.name}</div>
          <div className="text-sm text-muted-foreground">{item.product?.description}</div>
        </div>
      ),
    },
    {
      key: 'Provider.name',
      header: 'Provider',
      render: (_, item) => item.provider?.name || 'N/A',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (_, item) => (
        <Badge variant={item.quantity < 10 ? 'destructive' : 'secondary'}>
          {item.quantity}
        </Badge>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (_, item) => `$${item.unitPrice.toFixed(2)}`,
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (_, item) => `$${item.totalValue.toFixed(2)}`,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (_, item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  // Transactions table columns
  const transactionColumns: SimpleColumn<InventoryTransaction>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (_, transaction) => new Date(transaction.createdAt).toLocaleDateString(),
    },
    {
      key: 'type',
      header: 'Type',
      render: (_, transaction) => (
        <Badge
          variant={
            transaction.type === 'PURCHASE' ? 'default' :
            transaction.type === 'DISTRIBUTION' ? 'secondary' : 'outline'
          }
        >
          {transaction.type}
        </Badge>
      ),
    },
    {
      key: 'Product.name',
      header: 'Product',
      render: (_, transaction) => transaction.product?.name || 'N/A',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (_, transaction) => (
        <span className={transaction.type === 'DISTRIBUTION' ? 'text-red-600' : 'text-green-600'}>
          {transaction.type === 'DISTRIBUTION' ? '-' : '+'}{transaction.quantity}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (_, transaction) => `$${Number(transaction.unitPrice).toFixed(2)}`,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (_, transaction) => `$${Number(transaction.totalAmount).toFixed(2)}`,
    },
  ];
console.log({lowStockItems});
  // Low stock table columns
  const lowStockColumns: SimpleColumn<LowStockItem>[] = [
    {
      key: 'productName',
      header: 'Product',
      render: (_, item) => item.productName,
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (_, item) => (
        <Badge variant="destructive">
          {item.currentStock}
        </Badge>
      ),
    },
    {
      key: 'minimumStock',
      header: 'Minimum Stock',
      render: (_, item) => item.minimumStock,
    },
    {
      key: 'providers',
      header: 'Providers',
      render: (_, item) => (
        <div className="space-y-1">
          {item.providers.map((provider, index) => (
            <div key={index} className="text-sm">
              {provider.providerName}: {provider.quantity} @ ${provider.unitPrice}
            </div>
          ))}
        </div>
      ),
    },
  ];
console.log({transactions});
  return (
    <PageLoayout
      title="Inventory Dashboard"
      subTitle="Monitor your inventory levels, transactions, and stock alerts"
      buttons={[
        <Button key="refresh" variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>,
        <Button key="export" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat?.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat?.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat?.value}</div>
                <p className="text-xs text-muted-foreground">{stat?.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest inventory movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={transactions?.slice(0, 5) || []}
                    columns={transactionColumns}
                    isLoading={transactionsLoading}
                    pagination={false}
                    keyExtractor={(row) => row.id.toString()}
                  />
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={lowStockItems?.slice(0, 5) || []}
                    columns={lowStockColumns}
                    isLoading={lowStockLoading}
                    pagination={false}
                    keyExtractor={(row) => row.productId.toString()}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>All products currently in stock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                <DataTable
                  data={inventory || []}
                  columns={inventoryColumns}
                  isLoading={inventoryLoading}
                  pagination={true}
                  keyExtractor={(row) => row.id.toString()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Complete history of inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={transactions || []}
                  columns={transactionColumns}
                  isLoading={transactionsLoading}
                  pagination={true}
                  keyExtractor={(row) => row.id.toString()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={lowStockItems || []}
                  columns={lowStockColumns}
                  isLoading={lowStockLoading}
                  pagination={true}
                  keyExtractor={(row) => row.productId.toString()}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLoayout>
  );
}

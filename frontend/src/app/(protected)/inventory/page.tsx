"use client"
import { PageLoayout } from "@/components"
import InventoryTable from "./inventory-table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from "lucide-react"
import { useGetInventoryStatsQuery } from "@/store/services/inventory-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Package, TrendingUp, AlertTriangle, Activity } from "lucide-react"

export default function Inventory() {
  const { data: statsData, refetch: refetchStats } = useGetInventoryStatsQuery();

  const handleRefresh = () => {
    refetchStats();
    // The table will also refresh due to cache invalidation
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export inventory data");
  };

  const stats = statsData?.result;

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      description: 'Products in inventory',
      color: 'text-blue-600',
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats?.totalValue || 0),
      icon: TrendingUp,
      description: 'Current inventory value',
      color: 'text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      description: 'Items below threshold',
      color: 'text-red-600',
    },
    {
      title: 'Recent Transactions',
      value: stats?.recentTransactions || 0,
      icon: Activity,
      description: 'Last 30 days',
      color: 'text-purple-600',
    },
  ];

  return (
    <PageLoayout 
      title="Inventory Management" 
      buttons={[
        <Button key="refresh" variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>,
        <Button key="export" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Table */}
      <InventoryTable />
    </PageLoayout>
  )
}

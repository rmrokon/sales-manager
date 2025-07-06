'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ReturnsTable } from './returns-table';
import { CreateReturnDialog } from './create-return-dialog';
import { PageLoayout } from '@/components';

export default function ReturnsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <PageLoayout
      title="Product Returns"
      subTitle="Manage product returns from zones and track inventory adjustments"
      buttons={[
        <Button key="create" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Return
        </Button>
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Returns Overview</CardTitle>
          <CardDescription>
            View and manage all product returns from zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReturnsTable />
        </CardContent>
      </Card>

      <CreateReturnDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </PageLoayout>
  );
}

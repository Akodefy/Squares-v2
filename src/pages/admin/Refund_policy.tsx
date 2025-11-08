import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Refund_policy = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Refund Policy</h1>
          <p className="text-muted-foreground mt-1">
            Edit refund policy
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refund Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is automatically generated. Add your custom content here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Refund_policy;

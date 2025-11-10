import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="dashboard-header-responsive">
        <div>
          <h1 className="dashboard-title-responsive">Privacy Policy</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Edit privacy policy
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm md:text-base">
            This page is automatically generated. Add your custom content here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;

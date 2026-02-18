import React from 'react';
import { useBranchAuth } from '../../hooks/useBranchAuth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export function BranchSessionControl() {
  const { branchUser, logout } = useBranchAuth();

  if (!branchUser) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        Branch: <span className="font-medium text-foreground">{branchUser}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

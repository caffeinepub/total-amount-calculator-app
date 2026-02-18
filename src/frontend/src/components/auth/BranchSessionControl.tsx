import { useBranchAuth } from '../../hooks/useBranchAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function BranchSessionControl() {
  const { branchUser, logout, isAuthenticated } = useBranchAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    // Logout will trigger state change and return user to auth gate
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/20 border">
      <span className="text-sm font-medium">Branch: {branchUser}</span>
      <Button
        onClick={handleLogout}
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </Button>
    </div>
  );
}

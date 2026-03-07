import { Info, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useCopyCurrentUrl } from '../hooks/useCopyCurrentUrl';

export function GuidanceNoticeBar() {
  const { copyUrl, status, isSuccess, isError } = useCopyCurrentUrl();

  return (
    <div className="no-print border-b bg-accent/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Info className="h-5 w-5 text-accent-foreground flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              <span className="font-medium">Note:</span> Draft links may expire. For permanent access, use the production/live deployment link.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrl}
              disabled={isSuccess}
              className="gap-2 whitespace-nowrap"
            >
              {isSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : isError ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Failed
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </Button>
            
            {isError && (
              <span className="text-xs text-destructive">
                Unable to copy. Please copy manually.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

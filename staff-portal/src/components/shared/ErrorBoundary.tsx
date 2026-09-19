import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold">
          {is404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {is404
            ? "The page you're looking for doesn't exist or has moved."
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <Link to="/dashboard">
            <Button>
                <Home className="h-4 w-4" />
                Back to Dashboard
            </Button>
        </Link>
      </div>
    </div>
  );
}
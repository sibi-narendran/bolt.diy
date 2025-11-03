import { Link } from '@remix-run/react';
import { useAuth } from '~/lib/hooks/useAuth';
import { Button } from '~/components/ui/Button';
import { Dropdown, DropdownItem, DropdownSeparator } from '~/components/ui/Dropdown';

export function HeaderAuth() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <nav className="flex items-center gap-2">
        <div className="h-8 w-20 bg-appza-elements-background-depth-2 animate-pulse rounded-md" />
      </nav>
    );
  }

  if (isAuthenticated && user) {
    return (
      <nav className="flex items-center gap-2">
        <Dropdown
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-appza-elements-textPrimary bg-appza-elements-background-depth-2 hover:bg-appza-elements-background-depth-2"
              aria-label="User menu"
            >
              <div className="i-ph:user-circle text-lg" aria-hidden="true" />
            </Button>
          }
        >
          <DropdownSeparator />
          <DropdownItem onSelect={logout}>
            <div className="i-ph:sign-out text-lg" />
            <span>Sign Out</span>
          </DropdownItem>
        </Dropdown>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2">
      <Link to="/login">
        <Button variant="primary" size="sm" className="gap-2">
          <div className="i-ph:sign-in text-lg" aria-hidden="true" />
          <span>User Login</span>
        </Button>
      </Link>
      <Link to="/signup">
        <Button variant="primary" size="sm" className="gap-2">
          <div className="i-ph:rocket-launch text-lg" aria-hidden="true" />
          <span>Get Started</span>
        </Button>
      </Link>
    </nav>
  );
}

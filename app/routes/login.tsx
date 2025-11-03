import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useSearchParams, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Header } from '~/components/header/Header';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/Card';
import { authStore, initializeAuth } from '~/lib/stores/auth';
import { useNavigate } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{ title: 'Login - Appzap' }, { name: 'description', content: 'Login to your Appzap account' }];
};

export const loader = () => json({});

export default function LoginPage() {
  const actionData = useActionData<{ error?: string; success?: boolean; message?: string }>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const auth = useStore(authStore);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeAuth();

    if (auth.isAuthenticated && auth.user) {
      navigate('/');
    }

    const errorParam = searchParams.get('error');

    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [auth.isAuthenticated, auth.user, navigate, searchParams]);

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
      setIsLoading(false);
    } else if (actionData?.success && actionData?.message) {
      setSuccessMessage(actionData.message);
      setIsLoading(false);
    }
  }, [actionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      type LoginResponse = { success?: boolean; message?: string; error?: string };

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Failed to send magic link');
        return;
      }

      if (data.success) {
        setSuccessMessage(data.message ?? 'Check your email for the magic link');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = navigation.state === 'submitting' || isLoading;

  return (
    <div className="flex flex-col h-screen w-full bg-appzap-elements-background-depth-1">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your email to receive a magic link</CardDescription>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">
                  {successMessage}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {!isSubmitting && <div className="i-ph:arrow-right text-lg" aria-hidden="true" />}
                {isSubmitting ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-appzap-elements-textSecondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

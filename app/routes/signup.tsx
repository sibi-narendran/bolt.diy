import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Header } from '~/components/header/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/Card';
import { authStore, initializeAuth } from '~/lib/stores/auth';
import { useNavigate } from '@remix-run/react';
import { SignupForm } from '~/components/auth/SignupForm';

export const meta: MetaFunction = () => {
  return [{ title: 'Sign Up - Appzap' }, { name: 'description', content: 'Create a new Appzap account' }];
};

export const loader = () => json({});

export default function SignupPage() {
  const navigate = useNavigate();
  const auth = useStore(authStore);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      navigate('/');
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-appza-elements-background-depth-1">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Enter your email to receive a magic link</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm autoFocus className="pt-1" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-appza-elements-textSecondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

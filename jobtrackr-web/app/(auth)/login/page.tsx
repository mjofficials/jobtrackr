import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { ROUTES } from '@/lib/constants';

export const metadata = { title: 'Log in · JobTrackr' };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Log in</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Pick up where your job search left off.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{' '}
        <Link href={ROUTES.register} className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

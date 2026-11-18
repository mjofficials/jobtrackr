import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { ROUTES } from '@/lib/constants';

export const metadata = { title: 'Create account · JobTrackr' };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Keep every application, interview and offer in one place.</p>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

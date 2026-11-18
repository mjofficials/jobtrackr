'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { setToken } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/form-utils';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password is at least 8 characters'),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  const login = useMutation({
    mutationFn: (v: Values) => api.post<{ access_token: string }>('/auth/login', v).then((r) => r.data),
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      // Only follow same-site paths, never an absolute URL from the query string.
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : ROUTES.dashboard);
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4" noValidate>
      <FormField label="Email" error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <FormField label="Password" error={formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register('password')} />
      </FormField>
      {login.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(login.error)}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
        {login.isPending && <Loader2 className="animate-spin" aria-hidden />}
        {login.isPending ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}

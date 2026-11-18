'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { setToken } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/form-utils';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Loader2 } from 'lucide-react';

// Mirrors the API's RegisterDto rules.
const schema = z.object({
  name: z.string().trim().min(3, 'Name is at least 3 characters'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  // Register, then log straight in so the user lands on their dashboard.
  const signup = useMutation({
    mutationFn: async (v: Values) => {
      await api.post('/auth/register', v);
      const { data } = await api.post<{ access_token: string }>('/auth/login', {
        email: v.email,
        password: v.password,
      });
      return data;
    },
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      router.replace(ROUTES.dashboard);
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => signup.mutate(v))} className="space-y-4" noValidate>
      <FormField label="Name" error={formState.errors.name?.message}>
        <Input autoComplete="name" {...register('name')} />
      </FormField>
      <FormField label="Email" error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <FormField label="Password" hint="At least 8 characters" error={formState.errors.password?.message}>
        <PasswordInput autoComplete="new-password" {...register('password')} />
      </FormField>
      {signup.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(signup.error)}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={signup.isPending}>
        {signup.isPending && <Loader2 className="animate-spin" aria-hidden />}
        {signup.isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

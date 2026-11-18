import { isAxiosError } from 'axios';

/** Turns an API error into one sentence the user can act on. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Can’t reach the server. Check that the API is running.';
    const msg = error.response.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

/** '' → undefined, '120000' → 120000. For optional numeric inputs. */
export const toOptionalInt = (v?: string) => (v && v.trim() ? parseInt(v, 10) : undefined);

/** '' → undefined, '2026-11-18' → ISO string. For optional date inputs. */
export const toOptionalDate = (v?: string) => (v ? new Date(v).toISOString() : undefined);

/** ISO string → 'YYYY-MM-DD' for <input type="date">. */
export const toDateInput = (v?: string | null) => (v ? v.slice(0, 10) : '');

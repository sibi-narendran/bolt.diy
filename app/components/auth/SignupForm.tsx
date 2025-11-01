import { useId, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { classNames } from '~/utils/classNames';

interface SignupFormProps {
  className?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function SignupForm({
  className,
  submitLabel = 'Send Magic Link',
  autoFocus = false,
  onSuccess,
  onError,
}: SignupFormProps) {
  const emailFieldId = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        details?: Array<{ field?: string; message?: string }>;
      };

      if (!response.ok) {
        const detailMessage = Array.isArray(data?.details)
          ? data.details.find((detail: { field?: string }) => detail.field === 'email')?.message
          : undefined;

        const errorMessage = detailMessage || data?.error || 'Registration failed';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsSubmitting(false);

        return;
      }

      const message = data?.message || 'Check your email for the magic link';
      setSuccessMessage(message);
      onSuccess?.(message);
      setEmail('');
    } catch {
      const fallbackMessage = 'An unexpected error occurred. Please try again.';
      setError(fallbackMessage);
      onError?.(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={classNames('space-y-5 transition-theme', className)}>
      {error && (
        <div
          className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/15 px-3 py-2.5 text-sm leading-snug text-red-600 shadow-[0_14px_40px_-28px_rgba(244,63,94,0.9)] dark:border-red-400/30 dark:bg-red-400/15 dark:text-red-200"
          role="alert"
        >
          <span className="i-ph:warning-circle-duotone text-lg text-red-500 dark:text-red-300" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/15 px-3 py-2.5 text-sm leading-snug text-emerald-600 shadow-[0_14px_40px_-28px_rgba(16,185,129,0.85)] dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-200"
          role="status"
        >
          <span
            className="i-ph:check-circle-duotone text-lg text-emerald-500 dark:text-emerald-300"
            aria-hidden="true"
          />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={emailFieldId}>Email</Label>
        <Input
          id={emailFieldId}
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);

            if (error) {
              setError(null);
            }
          }}
          disabled={isSubmitting}
          autoFocus={autoFocus}
          autoComplete="email"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full gap-2 shadow-[0_18px_48px_-24px_rgba(247,144,9,0.65)] transition-all"
        disabled={isSubmitting}
      >
        {!isSubmitting && <div className="i-ph:arrow-right text-lg" aria-hidden="true" />}
        {isSubmitting ? 'Sending...' : submitLabel}
      </Button>
    </form>
  );
}

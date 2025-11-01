import { Link } from '@remix-run/react';
import { Dialog, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { SignupForm } from '~/components/auth/SignupForm';

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupDialog({ isOpen, onClose }: SignupDialogProps) {
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      {isOpen && (
        <Dialog
          className="w-full max-w-md overflow-hidden border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-2xl transition-theme"
          onBackdrop={onClose}
          onClose={onClose}
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-500/70 via-accent-500/30 to-transparent" />
            <div className="p-6 pt-8 space-y-6">
              <div className="space-y-3">
                <DialogTitle className="text-xl font-semibold">Create Account</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-bolt-elements-textSecondary">
                  Enter your email to receive a magic link.
                </DialogDescription>
              </div>
              <SignupForm autoFocus submitLabel="Send Magic Link" />
              <div className="text-sm text-center text-bolt-elements-textSecondary">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </DialogRoot>
  );
}

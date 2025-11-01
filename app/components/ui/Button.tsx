import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { classNames } from '~/utils/classNames';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-theme focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bolt-elements-borderColor disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover',
        primary:
          'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text shadow-sm hover:bg-bolt-elements-button-primary-backgroundHover focus-visible:ring-accent-500',
        destructive:
          'bg-bolt-elements-button-danger-background text-bolt-elements-button-danger-text hover:bg-bolt-elements-button-danger-backgroundHover focus-visible:ring-red-500',
        outline:
          'border border-bolt-elements-borderColor bg-transparent text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary dark:border-bolt-elements-borderColorActive',
        secondary:
          'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text hover:bg-bolt-elements-button-secondary-backgroundHover',
        ghost:
          'text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-1 hover:text-bolt-elements-textPrimary',
        link: 'text-bolt-elements-textPrimary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  _asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, _asChild = false, ...props }, ref) => {
    return <button className={classNames(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { classNames } from '~/utils/classNames';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-theme focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-appzap-elements-borderColor disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-appzap-elements-button-primary-background text-appzap-elements-button-primary-text hover:bg-appzap-elements-button-primary-backgroundHover',
        primary:
          'bg-appzap-elements-button-primary-background text-appzap-elements-button-primary-text shadow-sm hover:bg-appzap-elements-button-primary-backgroundHover focus-visible:ring-accent-500',
        destructive:
          'bg-appzap-elements-button-danger-background text-appzap-elements-button-danger-text hover:bg-appzap-elements-button-danger-backgroundHover focus-visible:ring-red-500',
        outline:
          'border border-appzap-elements-borderColor bg-transparent text-appzap-elements-textPrimary hover:bg-appzap-elements-background-depth-2 hover:text-appzap-elements-textPrimary dark:border-appzap-elements-borderColorActive',
        secondary:
          'bg-appzap-elements-button-secondary-background text-appzap-elements-button-secondary-text hover:bg-appzap-elements-button-secondary-backgroundHover',
        ghost:
          'text-appzap-elements-textPrimary hover:bg-appzap-elements-background-depth-1 hover:text-appzap-elements-textPrimary',
        link: 'text-appzap-elements-textPrimary underline-offset-4 hover:underline',
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

import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { buttonVariants } from '~/components/ui/Button';
import { classNames } from '~/utils/classNames';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export const SendButton = ({ show, isStreaming, disabled, onClick }: SendButtonProps) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className={classNames(
            buttonVariants({ variant: 'primary', size: 'icon' }),
            'absolute top-3 right-3 sm:top-4 sm:right-4',
          )}
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();

            if (!disabled) {
              onClick?.(event);
            }
          }}
        >
          {!isStreaming ? (
            <div className="i-ph:arrow-right-bold text-xl" />
          ) : (
            <div className="i-ph:stop-circle-bold text-xl" />
          )}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};

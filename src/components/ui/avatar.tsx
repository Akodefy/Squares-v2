import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, onError, ...props }, ref) => {
  const [errored, setErrored] = React.useState(false);
  const src = (props as any).src;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setErrored(true);
    if (typeof onError === 'function') onError(e as any);
  };

  // Reset errored flag when src changes
  React.useEffect(() => {
    if (src) {
      setErrored(false);
    }
  }, [src]);

  // Do not render an <img> with empty src — let AvatarFallback show instead
  if (!src) return null;

  return (
    <AvatarPrimitive.Image
      ref={ref}
      // hide image when it fails so AvatarFallback is shown
      className={cn(
        "aspect-square h-full w-full",
        className,
        errored ? 'hidden' : ''
      )}
      onError={handleError}
      {...props}
    />
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

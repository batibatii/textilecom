import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "font-serif text-3xl font-bold antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H1.displayName = "H1";

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "font-serif text-2xl font-bold antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H2.displayName = "H2";

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "font-serif text-xl font-semibold antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H3.displayName = "H3";

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn(
          "font-serif text-lg font-semibold antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H4.displayName = "H4";

const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn(
          "font-serif text-base font-medium antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H5.displayName = "H5";

const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h6
        ref={ref}
        className={cn(
          "font-serif text-sm font-medium antialiased",
          className
        )}
        {...props}
      />
    );
  }
);
H6.displayName = "H6";

export { H1, H2, H3, H4, H5, H6 };

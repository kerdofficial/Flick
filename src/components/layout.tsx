import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const stackVariants = cva("flex", {
  variants: {
    alignment: {
      leading: "items-start",
      center: "items-center",
      trailing: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    distribution: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      equalSpacing: "justify-between",
      equalCentering: "justify-evenly",
      spaceAround: "justify-around",
    },
    spacing: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      sm2: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      xxl: "gap-12",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      wrapReverse: "flex-wrap-reverse",
    },
  },
  defaultVariants: {
    alignment: "leading",
    distribution: "start",
    spacing: "sm",
    wrap: "wrap",
  },
});

const connectVariants = cva("gap-0", {
  variants: {
    orientation: {
      horizontal: "flex flex-row",
      vertical: "flex flex-col",
    },
    spacing: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      sm2: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      xxl: "gap-12",
    },
  },
  defaultVariants: {
    spacing: "sm",
  },
});

interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  children: React.ReactNode;
  disabled?: boolean;
  noSelect?: boolean;
  noOverflow?: boolean;
  useMotion?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  screenWidth?: boolean;
  screenHeight?: boolean;
  motionProps?: React.ComponentProps<typeof motion.div>;
}

interface MainStackProps extends StackProps {
  as?: "main" | "div";
  stack?: "VStack" | "HStack" | "V" | "H" | "v" | "h";
  stackClasses?: string;
  footer?: React.ReactNode;
}

interface ConnectProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation: "horizontal" | "vertical";
  spacing: "none" | "xs" | "sm" | "sm2" | "md" | "lg" | "xl" | "xxl";
  children: React.ReactNode;
}

const HStack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      alignment,
      distribution,
      spacing,
      wrap,
      disabled,
      noSelect,
      noOverflow,
      useMotion,
      fullWidth,
      fullHeight,
      screenWidth,
      screenHeight,
      motionProps,
      ...props
    },
    ref
  ) => {
    if (useMotion) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            stackVariants({ alignment, distribution, spacing, wrap }),
            "flex-row",
            disabled && "opacity-50 cursor-not-allowed select-none",
            noSelect && "select-none",
            noOverflow && "overflow-hidden",
            useMotion && "motion-safe",
            fullWidth && "w-full",
            fullHeight && "h-full",
            screenWidth && "w-screen",
            screenHeight && "h-screen",
            className
          )}
          {...(props as React.ComponentProps<typeof motion.div>)}
          {...motionProps}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          stackVariants({ alignment, distribution, spacing, wrap }),
          "flex-row",
          disabled && "opacity-50 cursor-not-allowed select-none",
          noSelect && "select-none",
          noOverflow && "overflow-hidden",
          fullWidth && "w-full",
          fullHeight && "h-full",
          screenWidth && "w-screen",
          screenHeight && "h-screen",
          className
        )}
        {...props}
      />
    );
  }
);

HStack.displayName = "HStack";

const VStack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      alignment,
      distribution,
      spacing,
      wrap,
      disabled,
      noSelect,
      noOverflow,
      useMotion,
      fullWidth,
      fullHeight,
      screenWidth,
      screenHeight,
      motionProps,
      ...props
    },
    ref
  ) => {
    if (useMotion) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            stackVariants({ alignment, distribution, spacing, wrap }),
            "flex-col",
            disabled && "opacity-50 cursor-not-allowed select-none",
            noSelect && "select-none",
            noOverflow && "overflow-hidden",
            useMotion && "motion-safe",
            fullWidth && "w-full",
            fullHeight && "h-full",
            screenWidth && "w-screen",
            screenHeight && "h-screen",
            className
          )}
          {...(props as React.ComponentProps<typeof motion.div>)}
          {...motionProps}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          stackVariants({ alignment, distribution, spacing, wrap }),
          "flex-col",
          disabled && "opacity-50 cursor-not-allowed select-none",
          noSelect && "select-none",
          noOverflow && "overflow-hidden",
          fullWidth && "w-full",
          fullHeight && "h-full",
          screenWidth && "w-screen",
          screenHeight && "h-screen",
          className
        )}
        {...props}
      />
    );
  }
);
VStack.displayName = "VStack";

const Main = React.forwardRef<HTMLDivElement, MainStackProps>(
  (
    {
      className,
      as,
      stack,
      children,
      noOverflow,
      stackClasses,
      footer,
      ...props
    },
    ref
  ) => {
    const Component = as || "main";
    return (
      <Component
        ref={ref}
        className={cn(
          className,
          "min-h-screen min-w-screen w-screen h-screen",
          noOverflow && "overflow-hidden"
        )}
      >
        {(stack === "VStack" || stack?.toLowerCase() === "v") && (
          <VStack {...props} className={cn(stackClasses)}>
            {children}
            {footer && (
              <footer className="fixed bottom-0 left-0 right-0 w-full">
                {footer}
              </footer>
            )}
          </VStack>
        )}
        {(stack === "HStack" || stack?.toLowerCase() === "h") && (
          <HStack {...props} className={cn(stackClasses)}>
            {children}
            {footer && (
              <footer className="fixed bottom-0 left-0 right-0 w-full">
                {footer}
              </footer>
            )}
          </HStack>
        )}
        {!stack && children}
      </Component>
    );
  }
);
Main.displayName = "Main";

const Connect = React.forwardRef<HTMLDivElement, ConnectProps>(
  ({ orientation, spacing, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(connectVariants({ orientation, spacing }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Connect.displayName = "Connect";

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  length?: number;
  axis?: "horizontal" | "vertical";
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ length = 16, axis = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(axis === "horizontal" ? `w-${length}` : `h-${length}`)}
        {...props}
      />
    );
  }
);

Spacer.displayName = "Spacer";

export { HStack, VStack, Main, Connect, Spacer };

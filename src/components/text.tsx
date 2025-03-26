import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("text-body font-normal text-foreground", {
  variants: {
    variant: {
      extraLargeTitle2: "text-6xl font-black",
      extraLargeTitle: "text-5xl font-black",
      largeTitle: "text-4xl font-extrabold",
      title: "text-3xl font-bold",
      title2: "text-2xl font-bold",
      title3: "text-xl font-semibold",
      headline: "text-lg font-medium",
      subheadline: "text-base font-medium",
      body: "text-base font-normal",
      body2: "text-sm font-normal",
      callout: "text-sm font-bold",
      caption: "text-xs font-normal opacity-80",
      caption2: "text-xs font-light opacity-70",
      footnote: "text-xs font-light opacity-60",
      link: "text-primary hover:underline text-nowrap",
    },
    weight: {
      black: "font-black",
      heavy: "font-extrabold",
      bold: "font-bold",
      semibold: "font-semibold",
      medium: "font-medium",
      regular: "font-regular",
      light: "font-light",
      extraLight: "font-extraLight",
      thin: "font-thin",
    },
    position: {
      start: "text-start",
      center: "text-center",
      end: "text-end",
    },
    textStyles: {
      italic: "italic",
      monospaced: "font-mono",
      lowercase: "lowercase",
      uppercase: "uppercase",
      capitalize: "capitalize",
      underline: "underline",
      lineThrough: "line-through",
      noUnderline: "no-underline",
    },
    defaultVariants: {
      variant: "body",
      weight: "regular",
      position: "start",
    },
  },
});

type AllowedTextStyle =
  | "italic"
  | "monospaced"
  | "lowercase"
  | "uppercase"
  | "capitalize"
  | "underline"
  | "lineThrough"
  | "noUnderline";

type HTMLElementTypes =
  | HTMLHeadingElement
  | HTMLParagraphElement
  | HTMLSpanElement;

type TextElementProps = React.PropsWithRef<
  Omit<React.HTMLAttributes<HTMLElementTypes>, "textStyles">
>;

interface TextProps
  extends Omit<TextElementProps, "textStyles">,
    Omit<VariantProps<typeof textVariants>, "textStyles"> {
  textStyles?: AllowedTextStyle[];
  href?: string;
  withIndicator?: boolean;
  wrap?: boolean | "wrapReverse";
  color?: string;
  disabled?: boolean;
  noSelect?: boolean;
}

const Text = React.forwardRef<HTMLElementTypes, TextProps>(
  (
    {
      className,
      variant = "body",
      weight,
      textStyles,
      position,
      href,
      wrap = true,
      withIndicator = false,
      color,
      disabled = false,
      noSelect = false,
      ...props
    },
    ref
  ) => {
    const textStylesMapping: Record<AllowedTextStyle, string> = {
      italic: "italic",
      monospaced: "font-mono",
      lowercase: "lowercase",
      uppercase: "uppercase",
      capitalize: "capitalize",
      underline: "underline",
      lineThrough: "line-through",
      noUnderline: "no-underline hover:no-underline",
    };

    const additionalTextStyles = textStyles
      ? textStyles.map((style) => textStylesMapping[style]).join(" ")
      : "";

    const variantMapping: Record<
      NonNullable<TextProps["variant"]>,
      keyof React.JSX.IntrinsicElements
    > = {
      extraLargeTitle2: "h1",
      extraLargeTitle: "h1",
      largeTitle: "h1",
      title: "h1",
      title2: "h2",
      title3: "h3",
      headline: "h4",
      subheadline: "h5",
      body: "p",
      body2: "p",
      callout: "p",
      caption: "span",
      caption2: "span",
      footnote: "span",
      link: "a",
    };

    const safeVariant = variant ?? "body";
    const ComponentTag = variantMapping[safeVariant] || "p";

    return React.createElement(ComponentTag, {
      className: cn(
        textVariants({ variant, weight, position }),
        additionalTextStyles,
        href && withIndicator && "after:content-['_↗']",
        wrap && "text-wrap",
        wrap === "wrapReverse" && "text-wrap-reverse",
        !wrap && "text-nowrap",
        color && color.includes("text-") ? color : color && `text-${color}`,
        disabled && "opacity-50 cursor-not-allowed select-none",
        noSelect && "select-none",
        className
      ),
      ref,
      ...props,
      href,
      ...(href && { target: "_blank", rel: "noopener noreferrer" }),
    });
  }
);

Text.displayName = "Text";

export { Text };

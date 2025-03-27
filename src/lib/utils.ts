import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectCodeLanguage(code: string): string | null {
  if (!code || code.trim().length < 10) return null;

  try {
    // Simple client-side language detection based on patterns
    const trimmedCode = code.trim();

    // Detecting JSON
    if (
      /^[\{\[][\s\S]*[\}\]]$/.test(trimmedCode) &&
      (trimmedCode.includes('"') || trimmedCode.includes(":"))
    ) {
      try {
        JSON.parse(trimmedCode);
        return "json";
      } catch (e) {
        // Not valid JSON
      }
    }

    // Detecting JavaScript
    if (
      /\bfunction\b|\bconst\b|\blet\b|\bvar\b|\breturn\b|\bif\b|\belse\b|\bconsole\.log\b/.test(
        trimmedCode
      ) &&
      !/^\s*</.test(trimmedCode) && // Not starting with HTML tag
      (trimmedCode.includes(";") || trimmedCode.includes("{"))
    ) {
      // Check for TypeScript specific syntax
      if (
        /:\s*[A-Za-z]+(\[\])?(\s*\|[\s\w\[\]]+)*\s*[=;),.{<]/.test(
          trimmedCode
        ) ||
        /interface\s+\w+\s*\{/.test(trimmedCode) ||
        /<[A-Za-z]+(\[\])?(\s*\|[\s\w\[\]]+)*>/.test(trimmedCode)
      ) {
        return "typescript";
      }
      return "javascript";
    }

    // Detecting HTML
    if (
      /^\s*<!DOCTYPE\s+html>|<html>|<head>|<body>|<div>|<span>|<a\s|<img\s/.test(
        trimmedCode
      )
    ) {
      return "html";
    }

    // Detecting CSS
    if (
      /[\w-]+\s*:\s*[\w-]+[\s\S]*;/.test(trimmedCode) &&
      /\{[\s\S]*\}/.test(trimmedCode)
    ) {
      return "css";
    }

    // Detecting Python
    if (
      /\bdef\s+\w+\s*\(|import\s+[\w\s,]+\b|\bclass\s+\w+\s*(\([\w\s,]+\))?:/.test(
        trimmedCode
      )
    ) {
      return "python";
    }

    // Detecting Markdown
    if (
      /^#\s+|^\*\s+|^-\s+|^\d+\.\s+|^>\s+/.test(trimmedCode) ||
      /\[.+\]\(.+\)/.test(trimmedCode)
    ) {
      return "markdown";
    }

    // Default to generic code if no specific type detected
    return "code";
  } catch (error) {
    console.error("Language detection error:", error);
  }
  return null;
}

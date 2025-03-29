import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectCodeLanguage(code: string): string | null {
  if (!code || code.trim().length < 10) return null;

  try {
    const trimmedCode = code.trim();

    if (
      /^[\{\[][\s\S]*[\}\]]$/.test(trimmedCode) &&
      (trimmedCode.includes('"') || trimmedCode.includes(":"))
    ) {
      try {
        JSON.parse(trimmedCode);
        return "json";
      } catch (e) {}
    }

    if (
      /\bfunction\b|\bconst\b|\blet\b|\bvar\b|\breturn\b|\bif\b|\belse\b|\bconsole\.log\b/.test(
        trimmedCode
      ) &&
      !/^\s*</.test(trimmedCode) &&
      (trimmedCode.includes(";") || trimmedCode.includes("{"))
    ) {
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

    if (
      /^\s*<!DOCTYPE\s+html>|<html>|<head>|<body>|<div>|<span>|<a\s|<img\s/.test(
        trimmedCode
      )
    ) {
      return "html";
    }

    if (
      /[\w-]+\s*:\s*[\w-]+[\s\S]*;/.test(trimmedCode) &&
      /\{[\s\S]*\}/.test(trimmedCode)
    ) {
      return "css";
    }

    if (
      /\bdef\s+\w+\s*\(|import\s+[\w\s,]+\b|\bclass\s+\w+\s*(\([\w\s,]+\))?:/.test(
        trimmedCode
      )
    ) {
      return "python";
    }

    if (
      /^#\s+|^\*\s+|^-\s+|^\d+\.\s+|^>\s+/.test(trimmedCode) ||
      /\[.+\]\(.+\)/.test(trimmedCode)
    ) {
      return "markdown";
    }

    return "code";
  } catch (error) {
    console.error("Language detection error:", error);
  }
  return null;
}

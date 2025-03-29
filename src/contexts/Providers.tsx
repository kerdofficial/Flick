import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "./SettingsContext";
import { FlickProvider } from "./FlickContext";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <FlickProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </FlickProvider>
    </ThemeProvider>
  );
};

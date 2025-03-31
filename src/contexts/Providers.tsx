import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "./SettingsContext";
import { FlickProvider } from "./FlickContext";
import { TabsProvider } from "./TabsContext";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <TabsProvider>
        <FlickProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </FlickProvider>
      </TabsProvider>
    </ThemeProvider>
  );
};

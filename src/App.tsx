import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Main, VStack } from "./components/layout";
import { Titlebar } from "./components/Titlebar";
import { CodeEditor } from "./components/codeEditor";
import { Toaster } from "@/components/shadcn/sonner";
import {
  register,
  unregister,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "./contexts/SettingsContext";
import { ACTIVATION_KEY_COMMANDS } from "./contexts/SettingsContext";

function App() {
  const { settings } = useSettings();
  const [isShortcutRegistered, setIsShortcutRegistered] = useState(false);
  const currentShortcutRef = useRef<string | null>(null);

  useEffect(() => {
    const initialCleanup = async () => {
      const cleanupPromises = ACTIVATION_KEY_COMMANDS.map(async (shortcut) => {
        try {
          if (await isRegistered(shortcut)) {
            await unregister(shortcut);
            console.log(`Cleaned up shortcut: ${shortcut}`);
          }
        } catch (error) {
          console.error(`Error cleaning up shortcut ${shortcut}:`, error);
        }
      });

      await Promise.all(cleanupPromises);
      console.log("Initial shortcut cleanup completed");
    };

    initialCleanup();

    return () => {
      const finalCleanup = async () => {
        try {
          for (const shortcut of ACTIVATION_KEY_COMMANDS) {
            if (await isRegistered(shortcut)) {
              await unregister(shortcut);
              console.log(`Final cleanup: unregistered ${shortcut}`);
            }
          }
        } catch (error) {
          console.error("Final cleanup error:", error);
        }
      };

      finalCleanup();
    };
  }, []);

  useEffect(() => {
    if (!settings?.activationKeyCommand) return;

    const setupShortcut = async () => {
      for (const shortcut of ACTIVATION_KEY_COMMANDS) {
        try {
          if (await isRegistered(shortcut)) {
            await unregister(shortcut);
            console.log(`Unregistered previous shortcut: ${shortcut}`);
          }
        } catch (error) {
          console.error(`Error unregistering ${shortcut}:`, error);
        }
      }

      try {
        await register(settings.activationKeyCommand, () => {
          console.log(`Shortcut triggered: ${settings.activationKeyCommand}`);
        });

        currentShortcutRef.current = settings.activationKeyCommand;
        setIsShortcutRegistered(true);
        console.log(
          `Successfully registered shortcut: ${settings.activationKeyCommand}`
        );
      } catch (error) {
        console.error(
          `Failed to register ${settings.activationKeyCommand}:`,
          error
        );
        setIsShortcutRegistered(false);
      }
    };

    setupShortcut();

    return () => {};
  }, [settings?.activationKeyCommand]);

  return (
    <ThemeProvider>
      <Main
        stack="VStack"
        fullWidth
        fullHeight
        spacing="none"
        alignment="leading"
        wrap="nowrap"
        distribution="start"
        className="bg-card pt-8"
        noOverflow
      >
        <Titlebar />
        <VStack
          fullHeight
          fullWidth
          spacing="md"
          alignment="leading"
          distribution="start"
          wrap="nowrap"
        >
          <CodeEditor height="100%" />
        </VStack>
      </Main>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

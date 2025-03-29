import "./App.css";
import { Main, VStack } from "./components/layout";
import { Titlebar } from "./components/Titlebar";
import { CodeEditor } from "./components/codeEditor";
import {
  register,
  unregister,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSettings } from "./contexts/SettingsContext";
import { ACTIVATION_KEY_COMMANDS } from "./contexts/SettingsContext";
import { useFlick } from "./contexts/FlickContext";
import { v4 as uuidv4 } from "uuid";
import { Window } from "@tauri-apps/api/window";

function App() {
  const { settings } = useSettings();
  const { flick, setFlick } = useFlick();
  const [_isShortcutRegistered, setIsShortcutRegistered] = useState(false);
  const currentShortcutRef = useRef<string | null>(null);
  const isMountedRef = useRef(false);
  const appWindow = Window.getCurrent();

  const activeFlick = flick.length > 0 ? flick[flick.length - 1] : null;

  const handleNewFlick = () => {
    setFlick([
      ...flick,
      {
        id: uuidv4(),
        name: "New Flick",
        content: "",
        updatedAt: new Date(),
        isEdited: false,
      },
    ]);
  };

  useLayoutEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;

    const cleanupShortcuts = async () => {
      try {
        await Promise.all(
          ACTIVATION_KEY_COMMANDS.map(async (shortcut) => {
            if (await isRegistered(shortcut)) {
              await unregister(shortcut);
            }
          })
        );
      } catch (error) {
        console.error("Error during initial cleanup:", error);
      }
    };

    cleanupShortcuts();

    return () => {
      const finalCleanup = async () => {
        try {
          await Promise.all(
            ACTIVATION_KEY_COMMANDS.map(async (shortcut) => {
              if (await isRegistered(shortcut)) {
                await unregister(shortcut);
              }
            })
          );
        } catch (error) {
          console.error("Final cleanup error:", error);
        }
      };

      finalCleanup();
    };
  }, []);

  useEffect(() => {
    if (!settings?.activationKeyCommand) return;

    if (currentShortcutRef.current === settings.activationKeyCommand) return;

    const setupShortcut = async () => {
      try {
        await Promise.all(
          ACTIVATION_KEY_COMMANDS.map(async (shortcut) => {
            if (await isRegistered(shortcut)) {
              await unregister(shortcut);
            }
          })
        );

        await register(settings.activationKeyCommand, async () => {
          handleNewFlick();

          try {
            const isVisible = await appWindow.isVisible();
            if (!isVisible) {
              await appWindow.show();
              await appWindow.setFocus();
              const isMinimized = await appWindow.isMinimized();
              if (isMinimized) {
                await appWindow.unminimize();
              }
            }
          } catch (error) {
            console.error("Error showing window:", error);
          }
        });

        currentShortcutRef.current = settings.activationKeyCommand;
        setIsShortcutRegistered(true);
      } catch (error) {
        console.error(
          `Failed to register ${settings.activationKeyCommand}:`,
          error
        );
        setIsShortcutRegistered(false);
      }
    };

    setupShortcut();
  }, [settings?.activationKeyCommand]);

  return (
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
        <CodeEditor
          height="100%"
          language={settings.defaultLanguage}
          flickId={activeFlick?.id}
          key={activeFlick?.id}
        />
      </VStack>
    </Main>
  );
}

export default App;

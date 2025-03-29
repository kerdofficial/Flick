import React, { createContext, useContext, useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

type Settings = {
  autoLaunch: boolean;
  closeBehavior: "quit" | "tray" | "dock";
  activationKeyCommand: string;
  defaultLanguage: "plaintext" | "code";
  fontSize: number;
  fontFamily: {
    plaintext: string;
    code: string;
  };
};

const defaultSettings: Settings = {
  autoLaunch: false,
  closeBehavior: "tray",
  activationKeyCommand: "ctrl+alt+n",
  defaultLanguage: "plaintext",
  fontSize: 14,
  fontFamily: {
    plaintext: "Inter",
    code: "JetBrains Mono",
  },
};

export const ACTIVATION_KEY_COMMANDS = [
  "ctrl+alt+n",
  "ctrl+shift+n",
  "ctrl+alt+space",
];

export const CLOSE_BEHAVIOR_OPTIONS = [
  { label: "Minimize to the system tray", value: "tray" },
  { label: "Minimize to the dock", value: "dock" },
  { label: "Quit the application", value: "quit" },
];

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const defaultContextValue: SettingsContextType = {
  settings: defaultSettings,
  updateSettings: () => {
    console.warn("SettingsProvider not found. Settings cannot be updated.");
  },
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        setIsLoading(true);
        const store = await load("settings.json");

        const storedSettings = await Promise.all([
          store.get<boolean>("autoLaunch"),
          store.get<"quit" | "tray" | "dock">("closeBehavior"),
          store.get<string>("activationKeyCommand"),
          store.get<string>("defaultLanguage"),
          store.get<number>("fontSize"),
          store.get<string>("fontFamily"),
        ]);

        const mergedSettings = {
          ...defaultSettings,
          autoLaunch:
            storedSettings[0] !== undefined
              ? storedSettings[0]
              : defaultSettings.autoLaunch,
          closeBehavior:
            storedSettings[1] !== undefined
              ? storedSettings[1]
              : defaultSettings.closeBehavior,
          activationKeyCommand:
            storedSettings[2] !== undefined
              ? storedSettings[2]
              : defaultSettings.activationKeyCommand,
          defaultLanguage:
            storedSettings[3] !== undefined
              ? storedSettings[3]
              : defaultSettings.defaultLanguage,
          fontSize:
            storedSettings[4] !== undefined
              ? storedSettings[4]
              : defaultSettings.fontSize,
          fontFamily:
            storedSettings[5] !== undefined
              ? storedSettings[5]
              : defaultSettings.fontFamily,
        };

        setSettings(mergedSettings as Settings);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStore();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const saveSettings = async () => {
      try {
        const store = await load("settings.json");
        await Promise.all([
          store.set("autoLaunch", settings.autoLaunch),
          store.set("closeBehavior", settings.closeBehavior),
          store.set("activationKeyCommand", settings.activationKeyCommand),
          store.set("defaultLanguage", settings.defaultLanguage),
          store.set("fontSize", settings.fontSize),
          store.set("fontFamily", settings.fontFamily),
        ]);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    };

    saveSettings();
  }, [settings, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const syncAutoLaunch = async () => {
      try {
        const isCurrentlyEnabled = await isEnabled();
        if (settings.autoLaunch && !isCurrentlyEnabled) {
          await enable();
        } else if (!settings.autoLaunch && isCurrentlyEnabled) {
          await disable();
        }
      } catch (error) {
        console.error("Failed to sync autolaunch setting:", error);
      }
    };

    syncAutoLaunch();
  }, [settings.autoLaunch, isLoading]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings: (newSettings: Partial<Settings>) => {
          setSettings((prevSettings) => ({
            ...prevSettings,
            ...newSettings,
          }));
        },
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingsContext);
};

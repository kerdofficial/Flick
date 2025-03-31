import React, { createContext, useContext, useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

type Settings = {
  autoLaunch: boolean;
  closeBehavior: "quit" | "tray" | "dock";
  activationKeyCommand: string;
  defaultLanguage: "plaintext" | "code";
  fontSize: {
    plaintext: number;
    code: number;
  };
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
  fontSize: {
    plaintext: 16,
    code: 16,
  },
  fontFamily: {
    plaintext: "Inter",
    code: "Roboto Mono",
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

        const getSafeSetting = async <T,>(
          key: string,
          defaultValue: T,
          validator?: (value: any) => boolean
        ): Promise<T> => {
          try {
            const value = await store.get<T>(key);

            if (value === undefined || (validator && !validator(value))) {
              return defaultValue;
            }

            return value;
          } catch (error) {
            console.warn(`Error loading setting "${key}":`, error);
            return defaultValue;
          }
        };

        let fontSizeValue: typeof defaultSettings.fontSize;
        try {
          const rawFontSize = await store.get("fontSize");

          if (typeof rawFontSize === "number") {
            fontSizeValue = {
              plaintext: rawFontSize,
              code: rawFontSize,
            };
            await store.set("fontSize", fontSizeValue);
            console.log("Migrated fontSize from number to object format");
          } else if (!rawFontSize || typeof rawFontSize !== "object") {
            fontSizeValue = defaultSettings.fontSize;
          } else {
            const fontSizeObj = rawFontSize as Partial<
              typeof defaultSettings.fontSize
            >;
            fontSizeValue = {
              plaintext:
                typeof fontSizeObj.plaintext === "number"
                  ? fontSizeObj.plaintext
                  : defaultSettings.fontSize.plaintext,
              code:
                typeof fontSizeObj.code === "number"
                  ? fontSizeObj.code
                  : defaultSettings.fontSize.code,
            };
          }
        } catch (error) {
          console.warn("Error handling fontSize setting:", error);
          fontSizeValue = defaultSettings.fontSize;
        }

        let fontFamilyValue: typeof defaultSettings.fontFamily;
        try {
          const rawFontFamily = await store.get("fontFamily");

          if (!rawFontFamily || typeof rawFontFamily !== "object") {
            fontFamilyValue = defaultSettings.fontFamily;
          } else {
            const fontFamilyObj = rawFontFamily as Partial<
              typeof defaultSettings.fontFamily
            >;
            fontFamilyValue = {
              plaintext:
                typeof fontFamilyObj.plaintext === "string"
                  ? fontFamilyObj.plaintext
                  : defaultSettings.fontFamily.plaintext,
              code:
                typeof fontFamilyObj.code === "string"
                  ? fontFamilyObj.code
                  : defaultSettings.fontFamily.code,
            };
          }
        } catch (error) {
          console.warn("Error handling fontFamily setting:", error);
          fontFamilyValue = defaultSettings.fontFamily;
        }

        const autoLaunch = await getSafeSetting<boolean>(
          "autoLaunch",
          defaultSettings.autoLaunch,
          (val) => typeof val === "boolean"
        );

        const closeBehavior = await getSafeSetting<"quit" | "tray" | "dock">(
          "closeBehavior",
          defaultSettings.closeBehavior,
          (val) =>
            typeof val === "string" && ["quit", "tray", "dock"].includes(val)
        );

        const activationKeyCommand = await getSafeSetting<string>(
          "activationKeyCommand",
          defaultSettings.activationKeyCommand,
          (val) =>
            typeof val === "string" && ACTIVATION_KEY_COMMANDS.includes(val)
        );

        const defaultLanguage = await getSafeSetting<"plaintext" | "code">(
          "defaultLanguage",
          defaultSettings.defaultLanguage,
          (val) =>
            typeof val === "string" && ["plaintext", "code"].includes(val)
        );

        const mergedSettings = {
          autoLaunch,
          closeBehavior,
          activationKeyCommand,
          defaultLanguage,
          fontSize: fontSizeValue,
          fontFamily: fontFamilyValue,
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
          setSettings((prevSettings) => {
            const updatedSettings = JSON.parse(
              JSON.stringify(prevSettings)
            ) as Settings;

            if (newSettings.fontSize) {
              const fontSizeUpdate = newSettings.fontSize as Partial<
                typeof defaultSettings.fontSize
              >;

              if (typeof fontSizeUpdate.plaintext === "number") {
                updatedSettings.fontSize.plaintext = fontSizeUpdate.plaintext;
              }

              if (typeof fontSizeUpdate.code === "number") {
                updatedSettings.fontSize.code = fontSizeUpdate.code;
              }
            }

            if (newSettings.fontFamily) {
              const fontFamilyUpdate = newSettings.fontFamily as Partial<
                typeof defaultSettings.fontFamily
              >;

              if (typeof fontFamilyUpdate.plaintext === "string") {
                updatedSettings.fontFamily.plaintext =
                  fontFamilyUpdate.plaintext;
              }

              if (typeof fontFamilyUpdate.code === "string") {
                updatedSettings.fontFamily.code = fontFamilyUpdate.code;
              }
            }

            if (typeof newSettings.autoLaunch === "boolean") {
              updatedSettings.autoLaunch = newSettings.autoLaunch;
            }

            if (
              typeof newSettings.closeBehavior === "string" &&
              ["quit", "tray", "dock"].includes(newSettings.closeBehavior)
            ) {
              updatedSettings.closeBehavior = newSettings.closeBehavior;
            }

            if (
              typeof newSettings.activationKeyCommand === "string" &&
              ACTIVATION_KEY_COMMANDS.includes(newSettings.activationKeyCommand)
            ) {
              updatedSettings.activationKeyCommand =
                newSettings.activationKeyCommand;
            }

            if (
              typeof newSettings.defaultLanguage === "string" &&
              ["plaintext", "code"].includes(newSettings.defaultLanguage)
            ) {
              updatedSettings.defaultLanguage = newSettings.defaultLanguage;
            }

            return updatedSettings;
          });
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

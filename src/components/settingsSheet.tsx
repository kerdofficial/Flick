import { Separator } from "./shadcn/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./shadcn/select";
import { HStack, VStack } from "./layout";
import { Text } from "./text";
import { Checkbox } from "./shadcn/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import {
  useSettings,
  ACTIVATION_KEY_COMMANDS,
  CLOSE_BEHAVIOR_OPTIONS,
} from "@/contexts/SettingsContext";
import { Label } from "./shadcn/label";

export const SettingsSheet = ({
  trigger,
  isOpen,
  toggle,
}: {
  trigger: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}) => {
  const { settings, updateSettings } = useSettings();
  const os =
    navigator.userAgent.toLowerCase().includes("mac") ||
    navigator.userAgent.toLowerCase().includes("macintosh") ||
    navigator.userAgent.toLowerCase().includes("darwin")
      ? "mac"
      : "windows";

  return (
    <Sheet open={isOpen} onOpenChange={toggle}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="gap-0 min-w-[500px] outline-none select-none overflow-y-auto overflow-x-hidden scrollbar-hide bg-card">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-lg font-semibold">Settings</SheetTitle>
          <SheetDescription className="text-xs text-pretty max-w-sm">
            Customize your experience with Flick through a variety of settings
            and preferences.
          </SheetDescription>
          <Separator className="my-2 w-10/12 mx-auto" />
        </SheetHeader>

        <Tabs defaultValue="general" className="px-4">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-foreground/10 dark:bg-muted">
            <TabsTrigger
              value="general"
              className="text-xs h-full data-[state=active]:bg-card cursor-pointer"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="text-xs h-full data-[state=active]:bg-card cursor-pointer"
            >
              Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <VStack spacing="lg" className="py-4 pt-2">
              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Auto Launch</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Start Flick automatically when you turn on your computer.
                  </Text>
                </VStack>
                <HStack fullWidth alignment="center" distribution="start">
                  <Checkbox
                    className="data-[state=checked]:bg-foreground/80 data-[state=checked]:border-none outline-none ring-0"
                    checked={settings.autoLaunch}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoLaunch: checked === true })
                    }
                    id="autoLaunch"
                  />
                  <Label
                    htmlFor="autoLaunch"
                    className="text-xs font-normal opacity-80"
                  >
                    Launch Flick with your computer
                  </Label>
                </HStack>
              </VStack>

              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Close Behavior</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Choose what happens when you close Flick.
                  </Text>
                </VStack>
                <Select
                  value={settings.closeBehavior}
                  onValueChange={(value) =>
                    updateSettings({
                      closeBehavior: value as "quit" | "tray",
                    })
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue>
                      {CLOSE_BEHAVIOR_OPTIONS.find(
                        (option) => option.value === settings.closeBehavior
                      )?.label || settings.closeBehavior}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CLOSE_BEHAVIOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {option.label}
                        </Text>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </VStack>

              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Activation Key Command</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Set the key combination to activate the app and create a new
                    Flick.
                  </Text>
                </VStack>
                <Select
                  value={settings.activationKeyCommand}
                  onValueChange={(value) =>
                    updateSettings({ activationKeyCommand: value })
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue>
                      {settings.activationKeyCommand
                        .split("+")
                        .map((part) => part[0].toUpperCase() + part.slice(1))
                        .join("+")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVATION_KEY_COMMANDS.map((command) => (
                      <SelectItem key={command} value={command}>
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {command
                            .split("+")
                            .map(
                              (part) => part[0].toUpperCase() + part.slice(1)
                            )
                            .join("+")
                            .replace("Ctrl", os === "mac" ? "⌘" : "Ctrl")
                            .replace("Alt", os === "mac" ? "⌥" : "Alt")}
                        </Text>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </VStack>
            </VStack>
          </TabsContent>

          <TabsContent value="editor">
            <VStack spacing="lg" className="py-4 pt-2">
              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Default Language</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    This will change the default language for all new Flicks
                    upon creation.
                  </Text>
                </VStack>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) =>
                    updateSettings({
                      defaultLanguage: value as "plaintext" | "code",
                    })
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue>
                      {settings.defaultLanguage.charAt(0).toUpperCase() +
                        settings.defaultLanguage.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {["plaintext", "code"].map((language) => (
                      <SelectItem key={language} value={language}>
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {language === "plaintext"
                            ? "Plain Text"
                            : language.charAt(0).toUpperCase() +
                              language.slice(1)}
                        </Text>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </VStack>

              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Font Size</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Change the font size of the text or code in the editor
                    across all Flicks.
                  </Text>
                </VStack>
                <Select
                  value={String(settings.fontSize)}
                  onValueChange={(value) =>
                    updateSettings({ fontSize: Number(value) })
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue>{settings.fontSize}px</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 14, 16, 18, 20, 22, 24].map((size) => (
                      <SelectItem key={String(size)} value={String(size)}>
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {size === 16 ? `${size}px (Default)` : `${size}px`}
                        </Text>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </VStack>

              <VStack
                wrap="nowrap"
                fullWidth
                alignment="leading"
                distribution="start"
                spacing="sm2"
              >
                <VStack spacing="xs">
                  <Text variant="body2">Font Family</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Change the font family of the text or code in the editor
                    across all Flicks.
                  </Text>
                </VStack>
                <div className="grid grid-cols-2 gap-2 w-full items-center">
                  <Text variant="caption">Plain Text</Text>
                  <Select
                    value={settings.fontFamily.plaintext}
                    onValueChange={(value) =>
                      updateSettings({
                        fontFamily: {
                          plaintext: value,
                          code: settings.fontFamily.code,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                      <SelectValue>
                        {settings.fontFamily.plaintext.charAt(0).toUpperCase() +
                          settings.fontFamily.plaintext.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const fonts = ["Inter", "Roboto"];
                        const availableFonts = fonts.filter((font) => {
                          try {
                            return document.fonts.check(`12px "${font}"`);
                          } catch (e) {
                            return false;
                          }
                        });

                        const platform = navigator.platform.toLowerCase();
                        const systemFonts = [];

                        if (platform.includes("mac")) {
                          systemFonts.push(
                            "-apple-system",
                            "BlinkMacSystemFont",
                            "Helvetica Neue"
                          );
                        } else if (platform.includes("win")) {
                          systemFonts.push(
                            "Segoe UI",
                            "Tahoma",
                            "Arial",
                            "Times New Roman"
                          );
                        } else if (platform.includes("linux")) {
                          systemFonts.push(
                            "Ubuntu",
                            "Cantarell",
                            "DejaVu Sans"
                          );
                        }

                        const availableSystemFonts = systemFonts.filter(
                          (font) => {
                            try {
                              return document.fonts.check(`12px "${font}"`);
                            } catch (e) {
                              return false;
                            }
                          }
                        );

                        return [...availableFonts, ...availableSystemFonts];
                      })().map((family) => (
                        <SelectItem key={family} value={family}>
                          <Text
                            variant="caption"
                            color="muted-foreground"
                            noSelect
                            weight="medium"
                          >
                            {family === "Inter"
                              ? `${family} (Default)`
                              : family}
                          </Text>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full items-center">
                  <Text variant="caption">Code</Text>
                  <Select
                    value={settings.fontFamily.code}
                    onValueChange={(value) =>
                      updateSettings({
                        fontFamily: {
                          plaintext: settings.fontFamily.plaintext,
                          code: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                      <SelectValue>
                        {settings.fontFamily.code.charAt(0).toUpperCase() +
                          settings.fontFamily.code.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        let fonts = [
                          "Roboto Mono",
                          "Courier New",
                          "Lucida Console",
                          "Consolas",
                        ];
                        const platform = navigator.platform.toLowerCase();
                        if (platform.includes("mac")) {
                          fonts.push("Menlo", "Monaco", "SF Mono");
                        } else if (platform.includes("linux")) {
                          fonts.push(
                            "Ubuntu Mono",
                            "DejaVu Sans Mono",
                            "Liberation Mono"
                          );
                        }
                        return fonts;
                      })().map((family) => (
                        <SelectItem key={family} value={family}>
                          <Text
                            variant="caption"
                            color="muted-foreground"
                            noSelect
                            weight="medium"
                          >
                            {family === "Roboto Mono"
                              ? `${family} (Default)`
                              : family}
                          </Text>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </VStack>
            </VStack>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

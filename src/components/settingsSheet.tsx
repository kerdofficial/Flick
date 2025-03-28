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
import { useState } from "react";
import { Checkbox } from "./shadcn/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";

const ACTIVATION_KEY_COMMANDS = [
  {
    labels: {
      windows: "CTRL + ALT + N (Default)",
      mac: "CMD + ALT + N (Default)",
    },
    values: {
      windows: "ctrl+alt+n",
      mac: "cmd+alt+n",
    },
  },
  {
    labels: {
      windows: "CTRL + Shift + N",
      mac: "CMD + Shift + N",
    },
    values: {
      windows: "ctrl+shift+n",
      mac: "cmd+shift+n",
    },
  },
  {
    labels: {
      windows: "CTRL + ALT + Space",
      mac: "CMD + ALT + Space",
    },
    values: {
      windows: "ctrl+alt+space",
      mac: "cmd+alt+space",
    },
  },
  {
    labels: {
      windows: "CTRL + Shift + Tilde (~)",
      mac: "CMD + Shift + Tilde (~)",
    },
    values: {
      windows: "ctrl+shift+~",
      mac: "cmd+shift+~",
    },
  },
];

const CLOSE_BEHAVIOR_OPTIONS = [
  {
    label: "Minimize to the system tray",
    value: "tray",
  },
  {
    label: "Keep on the taskbar",
    value: "taskbar",
  },
  {
    label: "Close Flick™",
    value: "close",
  },
];

export const SettingsSheet = ({
  trigger,
  isOpen,
  toggle,
}: {
  trigger: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}) => {
  const [activationKeyCommand, setActivationKeyCommand] = useState(
    ACTIVATION_KEY_COMMANDS[0]
  );
  const [defaultLanguage, setDefaultLanguage] = useState("plaintext");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState({
    plaintext: "Inter",
    code: "Roboto Mono",
  });
  const [closeBehavior, setCloseBehavior] = useState(CLOSE_BEHAVIOR_OPTIONS[0]);
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoLaunch, setAutoLaunch] = useState(true);

  const operatingSystem =
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
            Customize your experience with Flick™ through a variety of settings
            and preferences.
          </SheetDescription>
          <Separator className="my-2 w-10/12 mx-auto" />
        </SheetHeader>

        <Tabs defaultValue="general" className="px-4">
          <TabsList className="grid w-full grid-cols-3 gap-2">
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
            <TabsTrigger
              value="appearance"
              className="text-xs h-full data-[state=active]:bg-card cursor-pointer"
            >
              Appearance
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
                    Start Flick™ automatically when you turn on your computer.
                  </Text>
                </VStack>
                <HStack fullWidth alignment="center" distribution="start">
                  <Checkbox
                    className="data-[state=checked]:bg-foreground/80 data-[state=checked]:border-none outline-none ring-0"
                    checked={autoLaunch}
                    onCheckedChange={(checked) =>
                      setAutoLaunch(checked === true)
                    }
                  />
                  <Text variant="caption">
                    Launch Flick™ with your computer
                  </Text>
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
                    Choose what happens when you close Flick™.
                  </Text>
                </VStack>
                <Select
                  value={closeBehavior.value}
                  onValueChange={(value) =>
                    setCloseBehavior(
                      CLOSE_BEHAVIOR_OPTIONS.find(
                        (option) => option.value === value
                      ) || CLOSE_BEHAVIOR_OPTIONS[1]
                    )
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue placeholder={closeBehavior.label} />
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
                  value={activationKeyCommand.values[operatingSystem]}
                  onValueChange={(value) =>
                    setActivationKeyCommand(
                      ACTIVATION_KEY_COMMANDS.find(
                        (command) => command.values[operatingSystem] === value
                      ) || ACTIVATION_KEY_COMMANDS[0]
                    )
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue
                      placeholder={activationKeyCommand.labels[operatingSystem]}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVATION_KEY_COMMANDS.map((command) => (
                      <SelectItem
                        key={command.values[operatingSystem]}
                        value={command.values[operatingSystem]}
                      >
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {command.labels[operatingSystem]}
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
                  value={defaultLanguage}
                  onValueChange={setDefaultLanguage}
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue placeholder={defaultLanguage} />
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
                          {language.charAt(0).toUpperCase() + language.slice(1)}
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
                  value={activationKeyCommand.values[operatingSystem]}
                  onValueChange={(value) =>
                    setActivationKeyCommand(
                      ACTIVATION_KEY_COMMANDS.find(
                        (command) => command.values[operatingSystem] === value
                      ) || ACTIVATION_KEY_COMMANDS[0]
                    )
                  }
                >
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue
                      placeholder={activationKeyCommand.labels[operatingSystem]}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVATION_KEY_COMMANDS.map((command) => (
                      <SelectItem
                        key={command.values[operatingSystem]}
                        value={command.values[operatingSystem]}
                      >
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {command.labels[operatingSystem]}
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
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                    <SelectValue placeholder={fontSize} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "12px",
                      "14px",
                      "16px",
                      "18px",
                      "20px",
                      "22px",
                      "24px",
                    ].map((size) => (
                      <SelectItem key={size} value={size}>
                        <Text
                          variant="caption"
                          color="muted-foreground"
                          noSelect
                          weight="medium"
                        >
                          {size === "16px" ? `${size} (Default)` : size}
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
                <HStack
                  fullWidth
                  alignment="center"
                  distribution="start"
                  spacing="md"
                >
                  <Text variant="caption">Plaintext</Text>
                  <Select
                    value={fontFamily.plaintext}
                    onValueChange={(value) =>
                      setFontFamily({ ...fontFamily, plaintext: value })
                    }
                  >
                    <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                      <SelectValue placeholder={fontFamily.plaintext} />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Inter",
                        "Roboto",
                        "Arial",
                        "Helvetica",
                        "Times New Roman",
                        "Georgia",
                        "Garamond",
                      ].map((family) => (
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
                </HStack>
                <HStack
                  fullWidth
                  alignment="center"
                  distribution="start"
                  spacing="md"
                >
                  <Text variant="caption">Code</Text>
                  <Select
                    value={fontFamily.code}
                    onValueChange={(value) =>
                      setFontFamily({ ...fontFamily, code: value })
                    }
                  >
                    <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                      <SelectValue placeholder={fontFamily.code} />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Roboto Mono",
                        "Monaco",
                        "Consolas",
                        "Courier New",
                        "Courier",
                        "Lucida Console",
                        "Monospace",
                        "Inconsolata",
                        "Fira Mono",
                        "Source Code Pro",
                        "Anonymous Pro",
                        "Hack",
                      ].map((family) => (
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
                  <Text variant="body2">Auto Format (Beta)</Text>
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    className="text-[11px]"
                  >
                    Automatically format your code when you paste it into a
                    Flick.
                  </Text>
                </VStack>
                <HStack fullWidth alignment="center" distribution="start">
                  <Checkbox
                    className="data-[state=checked]:bg-foreground/80 data-[state=checked]:border-none outline-none ring-0"
                    checked={autoFormat}
                    onCheckedChange={(checked) =>
                      setAutoFormat(checked === true)
                    }
                  />
                  <Text variant="caption">Format code automatically</Text>
                </HStack>
              </VStack>
            </VStack>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

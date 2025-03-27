import { Separator } from "./shadcn/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { Cog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./shadcn/select";
import { HStack, VStack } from "./layout";
import { Text } from "./text";
import { useState, useEffect } from "react";

export const SettingsSheet = () => {
  const activationKeyCommands = [
    {
      labels: {
        windows: "CTRL + ALT + N",
        mac: "CMD + ALT + N",
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

  const [defaultLanguage, setDefaultLanguage] = useState("plaintext");
  const [activationKeyCommand, setActivationKeyCommand] = useState(
    activationKeyCommands[0]
  );
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState({
    plaintext: "Inter",
    code: "Roboto Mono",
  });

  const operatingSystem =
    navigator.userAgent.toLowerCase().includes("mac") ||
    navigator.userAgent.toLowerCase().includes("macintosh") ||
    navigator.userAgent.toLowerCase().includes("darwin")
      ? "mac"
      : "windows";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center justify-center w-8 h-6 rounded-sm cursor-pointer bg-transparent no-drag hover:bg-foreground/10 transition-all duration-300">
          <Cog className="w-4 h-4 text-foreground" />
        </div>
      </SheetTrigger>
      <SheetContent className="gap-0 min-w-[500px] outline-none">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-lg font-semibold">Settings</SheetTitle>
          <SheetDescription className="text-xs text-pretty max-w-sm">
            Customize your experience with Flick. Set your default language,
            custom fonts and more.
          </SheetDescription>
          <Separator className="my-2 w-10/12 mx-auto" />
        </SheetHeader>

        <VStack spacing="lg" className="p-4 pt-2">
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
                This will change the default language for all new Flicks upon
                creation.
              </Text>
            </VStack>
            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
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
                  activationKeyCommands.find(
                    (command) => command.values[operatingSystem] === value
                  ) || activationKeyCommands[0]
                )
              }
            >
              <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                <SelectValue
                  placeholder={activationKeyCommand.labels[operatingSystem]}
                />
              </SelectTrigger>
              <SelectContent>
                {activationKeyCommands.map((command) => (
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
                Change the font size of the text or code in the editor across
                all Flicks.
              </Text>
            </VStack>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="min-w-1/3 w-auto px-2 h-8 outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xs transition-colors">
                <SelectValue placeholder={fontSize} />
              </SelectTrigger>
              <SelectContent>
                {["12px", "14px", "16px", "18px", "20px", "22px", "24px"].map(
                  (size) => (
                    <SelectItem key={size} value={size}>
                      <Text
                        variant="caption"
                        color="muted-foreground"
                        noSelect
                        weight="medium"
                      >
                        {size}
                      </Text>
                    </SelectItem>
                  )
                )}
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
                Change the font family of the text or code in the editor across
                all Flicks.
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
                        {family}
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
                        {family}
                      </Text>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </HStack>
          </VStack>
        </VStack>
      </SheetContent>
    </Sheet>
  );
};

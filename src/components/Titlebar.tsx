import { Window } from "@tauri-apps/api/window";
import { Text } from "./text";
import { Minus, X, PictureInPicture2, Menu, Cog } from "lucide-react";
import { Separator } from "./shadcn/separator";
import { SettingsSheet } from "./settingsSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { useDisclosure } from "@/hooks/useDisclosure";
import { AnimatePresence } from "framer-motion";
import { AboutDialog } from "./aboutDialog";
import { UpdateDialog } from "./updateDialog";
import { useSettings } from "@/contexts/SettingsContext";
import { TrayIcon } from "@tauri-apps/api/tray";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu as TauriMenu } from "@tauri-apps/api/menu";

export function Titlebar() {
  const appWindow = Window.getCurrent();

  const { settings } = useSettings();

  const handleMinimize = async () => await appWindow.minimize();
  const handleMaximize = async () => await appWindow.toggleMaximize();
  const handleClose = async () => {
    if (settings.closeBehavior === "quit") {
      await appWindow.destroy();
    } else if (settings.closeBehavior === "tray") {
      const menu = await TauriMenu.new({
        items: [
          {
            id: "new-flick",
            text: "New Flick",
            action: () => {
              console.log("new flick");
            },
          },
          {
            id: "open",
            text: "Open Flick™",
            action: () => {
              appWindow.show();
            },
          },
          {
            id: "settings",
            text: "Settings",
            action: () => {
              console.log("settings");
            },
          },
          {
            id: "quit",
            text: "Quit Flick™",
            action: () => {
              appWindow.destroy();
            },
          },
        ],
      });

      const options = {
        icon: await defaultWindowIcon(),
        tooltip: "Flick",
        menu,
        showMenuOnLeftClick: true,
      };

      await TrayIcon.new(options as any);

      await appWindow.hide();
    } else if (settings.closeBehavior === "dock") {
      await appWindow.minimize();
    }
  };

  const settingsOpen = useDisclosure(false);
  const aboutOpen = useDisclosure(false);
  const checkForUpdatesOpen = useDisclosure(false);

  return (
    <div
      data-tauri-drag-region
      className="h-8 w-full flex items-center justify-between border-b border-border/30 px-0.5 absolute top-0 left-0 right-0"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-center w-8 h-6 rounded-sm cursor-pointer bg-transparent no-drag hover:bg-foreground/10 transition-all duration-300 ml-0.5">
            <Menu className="w-4 h-4 text-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card ml-2">
          <DropdownMenuItem>
            <Text variant="caption">New Flick</Text>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Text variant="caption">Save Current</Text>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Text variant="caption">Open</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="w-11/12 mx-auto" />
          <DropdownMenuItem onClick={settingsOpen.toggle}>
            <Text variant="caption">Settings</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="w-11/12 mx-auto" />
          <DropdownMenuItem onClick={aboutOpen.toggle}>
            <Text variant="caption">About Flick™</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={checkForUpdatesOpen.toggle}>
            <Text variant="caption">Check for Updates</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClose}>
            <Text variant="caption">Quit</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Text
        variant="body2"
        color="muted-foreground"
        weight="semibold"
        noSelect
        data-tauri-drag-region
        className="absolute left-1/2 -translate-x-1/2"
      >
        Flick™
      </Text>

      <div className="flex items-center gap-1">
        <SettingsSheet
          trigger={
            <div className="flex items-center justify-center w-8 h-6 rounded-sm cursor-pointer bg-transparent no-drag hover:bg-foreground/10 transition-all duration-300">
              <Cog className="w-4 h-4 text-foreground" />
            </div>
          }
          isOpen={settingsOpen.isOpen}
          toggle={settingsOpen.toggle}
        />
        <Separator
          orientation="vertical"
          className="bg-foreground/10 data-[orientation=vertical]:h-4 mx-1"
        />
        <div
          onClick={handleMinimize}
          className="flex items-center justify-center w-8 h-6 rounded-sm cursor-pointer bg-transparent no-drag hover:bg-yellow-500/80 transition-all duration-300"
        >
          <Minus className="w-4 h-4 text-foreground" />
        </div>
        <div
          onClick={handleMaximize}
          className="flex items-center justify-center w-8 h-6 rounded-sm cursor-pointer bg-transparent no-drag hover:bg-green-500/80 transition-all duration-300"
        >
          <PictureInPicture2 className="w-4 h-4 text-foreground" />
        </div>
        <div
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-6 bg-transparent rounded-sm cursor-pointer no-drag hover:bg-red-500/80 transition-all duration-300"
        >
          <X className="w-4 h-4 text-foreground" />
        </div>
      </div>
      <div className="absolute right-0">
        <AnimatePresence>
          <AboutDialog
            key="about-dialog"
            isOpen={aboutOpen.isOpen}
            toggle={aboutOpen.toggle}
          />
          <UpdateDialog
            key="update-dialog"
            isOpen={checkForUpdatesOpen.isOpen}
            toggle={checkForUpdatesOpen.toggle}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

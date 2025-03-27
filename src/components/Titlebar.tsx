import { Window } from "@tauri-apps/api/window";
import { Text } from "./text";
import { Minus, X, PictureInPicture2 } from "lucide-react";
import { Separator } from "./shadcn/separator";
import { Spacer } from "./layout";
import { SettingsSheet } from "./settingsSheet";

export function Titlebar() {
  const appWindow = Window.getCurrent();

  const handleMinimize = async () => await appWindow.minimize();
  const handleMaximize = async () => await appWindow.toggleMaximize();
  const handleClose = async () => await appWindow.close();

  return (
    <div
      data-tauri-drag-region
      className="h-8 w-full flex items-center justify-between border-b border-border/30 px-0.5 absolute top-0 left-0 right-0"
    >
      <Spacer />
      <Text
        variant="body2"
        color="muted-foreground"
        weight="semibold"
        noSelect
        data-tauri-drag-region
        className="absolute left-1/2 -translate-x-1/2"
      >
        Flick
      </Text>

      <div className="flex items-center gap-1">
        <SettingsSheet />
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
    </div>
  );
}

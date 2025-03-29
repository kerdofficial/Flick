import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/dialog";
import { Text } from "./text";
import { open } from "@tauri-apps/plugin-shell";

export const AboutDialog = ({
  trigger,
  isOpen,
  toggle,
}: {
  trigger?: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}) => {
  const OpenGitHub = async () => {
    await open("https://github.com/kerdofficial");
  };
  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>{trigger || null}</DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">
          <Text variant="body2" className="leading-relaxed">
            Introducing Flick — a beautifully simple way to capture your
            thoughts and code. Create instant notes that save automatically,
            letting you focus on what matters most.
          </Text>

          <Text variant="headline" className="pt-2">
            Thoughtfully designed
          </Text>
          <Text variant="body2" className="leading-relaxed">
            With two carefully crafted modes — Plain Text for quick thoughts and
            Code for your programming needs — Flick adapts to your workflow
            seamlessly. The elegant, focused interface ensures your notes are
            always there when inspiration strikes.
          </Text>

          <Text variant="headline" className="pt-2">
            Powerful yet simple
          </Text>
          <Text variant="body2" className="leading-relaxed">
            The Code mode features intelligent language detection and
            experimental formatting capabilities, making your code snippets
            clean and organized. Whether you're jotting down ideas or preserving
            snippets of code, Flick stays out of your way.
          </Text>

          <Text variant="headline" className="pt-2">
            Built for desktop
          </Text>
          <Text variant="body2" className="leading-relaxed">
            Flick is a native desktop application built with Tauri, providing
            exceptional performance with a small footprint. Available for
            Windows, with support for macOS and Linux coming soon.
          </Text>

          <Text variant="caption" className="pt-2">
            Version 0.5.3 • Made by{" "}
            <Text
              variant="link"
              onClick={OpenGitHub}
              className="text-primary hover:underline cursor-pointer"
            >
              KerD
            </Text>
          </Text>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

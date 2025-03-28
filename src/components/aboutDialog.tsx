import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/dialog";

export const AboutDialog = ({
  trigger,
  isOpen,
  toggle,
}: {
  trigger?: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>{trigger || null}</DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>
            Flick is a simple, yet powerful text editor that allows you to write
            code in any language.
          </p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/dialog";

export const UpdateDialog = ({
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
          <DialogTitle>Check for Updates</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>Checking for updates...</p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

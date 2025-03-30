import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./shadcn/dialog";
import { Button } from "./shadcn/button";
import { Check, Download, RefreshCw, RotateCw } from "lucide-react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Progress } from "./shadcn/progress";

type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "not_available"
  | "downloading"
  | "installing"
  | "finished"
  | "error";

type DownloadEvent = {
  event: "Started" | "Progress" | "Finished";
  data: {
    contentLength?: number;
    chunkLength?: number;
  };
};

export const UpdateDialog = ({
  trigger,
  isOpen,
  toggle,
}: {
  trigger?: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}) => {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloaded, setDownloaded] = useState<number>(0);
  const [contentLength, setContentLength] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  const downloadedRef = useRef<number>(0);

  const checkForUpdates = async () => {
    try {
      setStatus("checking");
      setErrorMessage("");

      const update = await check();

      if (update) {
        setUpdateInfo(update);
        setStatus("available");
      } else {
        setStatus("not_available");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(String(error));
      console.error("Update check error:", error);
    }
  };

  const handleDownloadAndInstall = async () => {
    if (!updateInfo) return;

    try {
      setStatus("downloading");
      setDownloaded(0);
      setContentLength(0);
      setProgressPercentage(0);
      downloadedRef.current = 0;

      await updateInfo.downloadAndInstall((event: DownloadEvent) => {
        switch (event.event) {
          case "Started":
            if (event.data.contentLength) {
              setContentLength(event.data.contentLength);
              console.log(
                `Started downloading ${event.data.contentLength} bytes`
              );
            }
            break;
          case "Progress":
            if (event.data.chunkLength) {
              downloadedRef.current += event.data.chunkLength;

              setDownloaded(downloadedRef.current);

              if (contentLength > 0) {
                const percentage = Math.min(
                  Math.round((downloadedRef.current / contentLength) * 100),
                  100
                );
                setProgressPercentage(percentage);
              }

              console.log(
                `Downloaded ${downloadedRef.current} from ${contentLength}`
              );
            }
            break;
          case "Finished":
            setStatus("installing");
            console.log("Download finished");
            break;
        }
      });

      setStatus("finished");
      console.log("Update installed");

      setTimeout(async () => {
        try {
          await relaunch();
        } catch (error) {
          console.error("Failed to relaunch:", error);
        }
      }, 3000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(String(error));
      console.error("Update installation error:", error);
    }
  };

  useEffect(() => {
    if (isOpen && status === "idle") {
      checkForUpdates();
    }
  }, [isOpen, status]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>{trigger || null}</DialogTrigger>
      <DialogContent className="z-50 max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === "checking" && "Checking for Updates"}
            {status === "available" && "Update Available"}
            {status === "not_available" && "No Updates Available"}
            {status === "downloading" && "Downloading Update"}
            {status === "installing" && "Installing Update"}
            {status === "finished" && "Update Complete"}
            {status === "error" && "Update Error"}
            {status === "idle" && "Check for Updates"}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="space-y-4 pt-4">
          {status === "checking" && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <p>Checking for updates...</p>
            </div>
          )}

          {status === "available" && updateInfo && (
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <p className="font-medium">
                  Version {updateInfo.version} is available
                </p>
                {updateInfo.date && (
                  <p className="text-xs text-muted-foreground">
                    Released on {new Date(updateInfo.date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {updateInfo.body && (
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-sm">Release Notes:</p>
                  <div className="rounded-md bg-muted p-3 text-xs">
                    {updateInfo.body}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "not_available" && (
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <p>You're using the latest version.</p>
            </div>
          )}

          {status === "downloading" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 animate-pulse text-primary" />
                <p>Downloading update...</p>
              </div>

              <Progress value={progressPercentage} className="h-2 w-full" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatBytes(downloaded)} of {formatBytes(contentLength)}
                </span>
                <span>{progressPercentage}%</span>
              </div>
            </div>
          )}

          {status === "installing" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RotateCw className="h-5 w-5 animate-spin text-primary" />
                <p>Installing update...</p>
              </div>

              <Progress value={100} className="h-2 w-full" />

              <p className="text-xs text-center text-muted-foreground">
                Please wait while the update is being installed
              </p>
            </div>
          )}

          {status === "finished" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <p>Update successfully installed</p>
              </div>

              <p className="text-sm text-muted-foreground">
                The application will restart momentarily to apply the update.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <p className="text-red-500 font-medium">Failed to update</p>
              {errorMessage && (
                <div className="mt-1 text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap break-words rounded-md bg-muted p-3">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </DialogDescription>

        <DialogFooter className="flex flex-row justify-between pt-4 w-full ">
          {(status === "available" ||
            status === "not_available" ||
            status === "error") && (
            <Button
              variant="outline"
              onClick={() => toggle()}
              className="ml-2 h-full w-24 text-foreground"
            >
              Close
            </Button>
          )}

          {(status === "idle" || status === "checking") && (
            <Button disabled className="text-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </Button>
          )}

          {status === "not_available" && (
            <Button onClick={checkForUpdates} className="text-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          )}

          {status === "available" && (
            <Button
              onClick={handleDownloadAndInstall}
              className="text-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Download & Install
            </Button>
          )}

          {(status === "downloading" || status === "installing") && (
            <Button disabled className="text-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {status === "downloading" ? "Downloading..." : "Installing..."}
            </Button>
          )}

          {status === "finished" && (
            <Button disabled className="text-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Restarting...
            </Button>
          )}

          {status === "error" && (
            <Button onClick={checkForUpdates} className="text-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

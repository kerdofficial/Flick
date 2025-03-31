import React from "react";
import { Check, CircleSlash, Loader2, Circle } from "lucide-react";
import { Text } from "../text";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../shadcn/tooltip";

type SaveState = "empty" | "editing" | "waiting" | "saving" | "saved";

interface EditorStatusIndicatorProps {
  saveState: SaveState;
  lastEdited: string;
}

export const EditorStatusIndicator: React.FC<EditorStatusIndicatorProps> = ({
  saveState,
  lastEdited,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {saveState === "empty" && (
                <CircleSlash className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              {saveState === "editing" && (
                <Circle className="w-3 h-3 text-foreground/80 fill-foreground/80" />
              )}
              {saveState === "waiting" && (
                <Circle className="w-3 h-3 text-foreground/80 fill-foreground/80" />
              )}
              {saveState === "saving" && (
                <Loader2 className="w-3.5 h-3.5 text-foreground/80 animate-spin" />
              )}
              {saveState === "saved" && (
                <Check className="w-3.5 h-3.5 text-foreground/80" />
              )}
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="border border-border shadow-lg"
            >
              {saveState === "empty" && "Flick is empty"}
              {saveState === "editing" && "Flick is being edited"}
              {saveState === "waiting" && "Flick is waiting for saving"}
              {saveState === "saving" && "Saving Flick..."}
              {saveState === "saved" && "Flick saved"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Text variant="caption" color="muted-foreground" noSelect weight="medium">
        {lastEdited}
      </Text>
    </div>
  );
};

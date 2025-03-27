import React, { useState } from "react";
import { Text } from "../text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import { SUPPORTED_LANGUAGES } from "@/lib/codeFormatter";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../shadcn/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { cn } from "@/lib/utils";

interface EditorLanguageSelectorProps {
  currentLanguage: string;
  setCurrentLanguage: (value: string) => void;
  detectedLanguage: string | null;
  onFormatClick: () => void;
  value: string;
  isFirstPaste: boolean;
  formatError?: boolean;
  formatSuccess?: boolean;
  setFormatSuccess?: (value: boolean) => void;
}

export const EditorLanguageSelector: React.FC<EditorLanguageSelectorProps> = ({
  currentLanguage,
  setCurrentLanguage,
  detectedLanguage,
  onFormatClick,
  value,
  isFirstPaste,
  formatError = false,
  formatSuccess = false,
  setFormatSuccess,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
        <SelectTrigger className="w-auto px-2 h-6 border-none outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium transition-colors">
          <SelectValue placeholder={currentLanguage} />
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

      {currentLanguage === "code" && (
        <Text
          variant="caption2"
          color="muted-foreground"
          weight="medium"
          className="px-2 py-0.5 bg-foreground/10 rounded-full transition-colors flex items-center justify-center"
          noSelect
        >
          {SUPPORTED_LANGUAGES.find((lang) => lang.value === detectedLanguage)
            ?.label ||
            (detectedLanguage === "code" && "No syntax detected") ||
            "No language detected"}
        </Text>
      )}

      {currentLanguage === "code" && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={onFormatClick}
                  className={cn(
                    "px-2 py-0.5 hover:bg-foreground/10 rounded-sm transition-colors flex items-center justify-center cursor-pointer gap-2",
                    formatError && "cursor-not-allowed"
                  )}
                >
                  <Text
                    variant="caption"
                    color="muted-foreground"
                    weight="medium"
                    disabled={
                      !detectedLanguage ||
                      detectedLanguage === null ||
                      detectedLanguage === "code" ||
                      (value.trim() === "" && !isFirstPaste)
                    }
                    onClick={onFormatClick}
                    noSelect
                  >
                    Format (Beta)
                  </Text>
                  {formatError && (
                    <AlertCircle
                      className={cn(
                        "h-3.5 w-3.5 text-destructive dark:text-destructive"
                      )}
                    />
                  )}
                  {formatSuccess && (
                    <CheckCircle
                      className={cn(
                        "h-3.5 w-3.5 text-sys-green dark:text-sys-green"
                      )}
                    />
                  )}
                </div>
              </TooltipTrigger>
              {formatError && (
                <TooltipContent
                  side="bottom"
                  className="border border-border shadow-lg"
                >
                  <p className="text-xs font-medium text-rose-500 dark:text-rose-400">
                    Format error occurred
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For more information, click{" "}
                    <button
                      onClick={() => setOpen(true)}
                      className="text-primary underline cursor-pointer"
                    >
                      here
                    </button>
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {open && (
            <AlertDialog open={open}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Format errors</AlertDialogTitle>
                  <AlertDialogDescription className="flex flex-col space-y-4 text-sm leading-relaxed">
                    <p>Formatting couldn't be completed. This may be due to:</p>
                    <ul className="list-disc list-inside indent-2">
                      <li>Code complexity or length</li>
                      <li>Unsupported language</li>
                      <li>Syntax errors in your code</li>
                    </ul>

                    <p>
                      We're continuously refining Flick's formatting
                      capabilities and expanding language support.
                    </p>

                    <div>
                      <p className="mb-2">Currently supported languages:</p>
                      <ul className="list-disc list-inside indent-2">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <li key={lang.value}>{lang.label}</li>
                        ))}
                      </ul>
                    </div>

                    <p>
                      If your language is listed above, please review your code
                      for syntax errors and try formatting again.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    className="text-foreground cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    I understand
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
};

import { RefObject } from "react";
import { formatCode } from "@/lib/codeFormatter";
import { detectCodeLanguage } from "@/lib/utils";

export interface EditorHandlersProps {
  value: string;
  setValue: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  gutterRef: RefObject<HTMLDivElement>;
  setCursorPosition: (position: number | null) => void;
  onChange?: (value: string) => void;
  setLastEdited: (value: string) => void;
  setSaveState: (
    state: "empty" | "editing" | "waiting" | "saving" | "saved"
  ) => void;
  saveTimeoutRef: { current: NodeJS.Timeout | null };
  setDetectedLanguage: (language: string | null) => void;
  currentLanguage: string;
  detectionTimeoutRef: { current: NodeJS.Timeout | null };
  setIsFirstPaste: (value: boolean) => void;
  isFirstPaste: boolean;
  setHasDetectedOnce: (value: boolean) => void;
  detectedLanguage: string | null;
  autoDetectLanguage?: boolean;
  autoFormat?: boolean;
  onFormatError?: (error: string) => void;
  setFormatErrorMessage?: (message: string | null) => void;
  setFormatSuccess?: (success: boolean) => void;
  formatSuccess?: boolean;
}

export const createEditorHandlers = ({
  value,
  setValue,
  textareaRef,
  gutterRef,
  setCursorPosition,
  onChange,
  setLastEdited,
  setSaveState,
  saveTimeoutRef,
  setDetectedLanguage,
  currentLanguage,
  detectionTimeoutRef,
  setIsFirstPaste,
  isFirstPaste,
  setHasDetectedOnce,
  detectedLanguage,
  autoDetectLanguage = true,
  autoFormat = true,
  onFormatError,
  setFormatErrorMessage,
  setFormatSuccess,
  formatSuccess,
}: EditorHandlersProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = value.substring(0, start) + "  " + value.substring(end);

      setValue(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
        setCursorPosition(start + 2);
      }, 0);

      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (setFormatErrorMessage) {
      setFormatErrorMessage(null);
    }

    if (setFormatSuccess && formatSuccess) {
      setFormatSuccess(false);
    }

    if (newValue === "") {
      setSaveState("empty");
      setDetectedLanguage(null);
    } else {
      setSaveState("editing");

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setSaveState("waiting");
        const detected = detectCodeLanguage(newValue);
        if (detected) {
          setDetectedLanguage(detected);
        }

        setTimeout(() => {
          setSaveState("saving");

          setTimeout(() => {
            setSaveState("saved");
          }, 800);
        }, 200);
      }, 1500);
    }

    setLastEdited(
      new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );

    setTimeout(() => {
      if (textareaRef.current && gutterRef.current) {
        gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }, 0);

    if (onChange) {
      onChange(newValue);
    }

    if (
      autoDetectLanguage &&
      currentLanguage === "code" &&
      newValue.length > 50
    ) {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }

      detectionTimeoutRef.current = setTimeout(() => {
        const detected = detectCodeLanguage(newValue);
        if (detected) {
          setDetectedLanguage(detected);
        }
      }, 500);
    }
  };

  const handleClick = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleSelect = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const isFirstPasteEvent = isFirstPaste;

    if (isFirstPasteEvent) {
      setIsFirstPaste(false);
    }

    if (autoDetectLanguage && currentLanguage === "code") {
      const detected = detectCodeLanguage(pastedText);
      if (detected) {
        setDetectedLanguage(detected);
        setHasDetectedOnce(false);
      }
    }

    if (autoFormat && currentLanguage === "code") {
      setTimeout(async () => {
        const langToUse = detectedLanguage || "code";
        const result = await formatCode(
          textareaRef.current?.value || "",
          langToUse
        );

        if (result.success) {
          setValue(result.code);
          if (onChange) {
            onChange(result.code);
          }
          if (setFormatErrorMessage) {
            setFormatErrorMessage(null);
          }
          if (setFormatSuccess) {
            setFormatSuccess(true);
          }
        } else {
          if (setFormatErrorMessage) {
            setFormatErrorMessage(result.error || "Failed to format code");
          }
          if (onFormatError && result.error) {
            onFormatError(result.error);
          }
        }
      }, 0);
    }
  };

  const handleFormatClick = async () => {
    if (currentLanguage === "code" && value) {
      const langToUse = detectedLanguage || "code";

      try {
        if (setFormatErrorMessage) {
          setFormatErrorMessage(null);
        }

        if (setFormatSuccess) {
          setFormatSuccess(false);
        }

        const result = await formatCode(value, langToUse);

        if (result.success) {
          if (setFormatSuccess) {
            setFormatSuccess(true);
          }
          setValue(result.code);
          if (onChange) {
            onChange(result.code);
          }
        } else {
          if (setFormatErrorMessage) {
            setFormatErrorMessage(result.error || "Failed to format code");
          }
          if (onFormatError && result.error) {
            onFormatError(result.error);
          }
        }
      } catch (error) {
        console.error("Error in format handler:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error during formatting";

        if (setFormatErrorMessage) {
          setFormatErrorMessage(errorMessage);
        }
        if (onFormatError) {
          onFormatError(errorMessage);
        }
      }
    }
  };

  return {
    handleKeyDown,
    handleChange,
    handleClick,
    handleSelect,
    handlePaste,
    handleFormatClick,
  };
};

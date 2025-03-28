import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { loadPrettier, formatCode } from "@/lib/codeFormatter";
import { detectCodeLanguage } from "@/lib/utils";
import { scrollbarStyles } from "@/lib/editorStyles";
import { EditorStatusIndicator } from "./editor/EditorStatusIndicator";
import { EditorLanguageSelector } from "./editor/EditorLanguageSelector";
import { createEditorHandlers } from "./editor/EditorHandlers";

export interface CodeEditorProps {
  initialValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
  autoDetectLanguage?: boolean;
  autoFormat?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = "",
  language = "plaintext",
  onChange,
  placeholder = "Type here...",
  readOnly = false,
  className = "",
  height = "300px",
  autoDetectLanguage = true,
  autoFormat = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [lines, setLines] = useState<string[]>(initialValue.split("\n"));
  const [lastEdited, setLastEdited] = useState(
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholder);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [selectedFormatLanguage, setSelectedFormatLanguage] = useState("auto");
  const [isFirstPaste, setIsFirstPaste] = useState(true);
  const [hasDetectedOnce, setHasDetectedOnce] = useState(false);
  const [formatErrorMessage, setFormatErrorMessage] = useState<string | null>(
    null
  );
  const [formatSuccess, setFormatSuccess] = useState<boolean>(false);
  const formatSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [saveState, setSaveState] = useState<
    "empty" | "editing" | "waiting" | "saving" | "saved"
  >(initialValue === "" ? "empty" : "saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    setCurrentPlaceholder(
      currentLanguage === "plaintext"
        ? "Type text here..."
        : "Type code here..."
    );
  }, [currentLanguage]);

  useEffect(() => {
    const newLines = value.split("\n");
    setLines(newLines);

    if (formatErrorMessage && (value !== initialValue || value === "")) {
      setFormatErrorMessage(null);
    }
  }, [value, formatErrorMessage, initialValue]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;

    if (!wrapper || !textarea || !gutter) return;

    const handleScroll = () => {
      const scrollTop = textarea.scrollTop;
      gutter.scrollTop = scrollTop;
    };

    textarea.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      textarea.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      const textarea = textareaRef.current;

      const measureEl = document.createElement("div");
      measureEl.style.position = "absolute";
      measureEl.style.visibility = "hidden";
      measureEl.style.whiteSpace = "pre";
      measureEl.style.fontFamily = textarea.style.fontFamily;
      measureEl.style.fontSize = textarea.style.fontSize;
      document.body.appendChild(measureEl);

      let cursorLine = 0;
      let charPos = 0;
      let offset = 0;

      for (let i = 0; i < cursorPosition; i++) {
        if (value[i] === "\n") {
          cursorLine++;
          charPos = 0;
        } else {
          charPos++;
        }
        offset++;
      }

      const currentLineStart = value.lastIndexOf("\n", cursorPosition - 1) + 1;
      const textUpToCursor = value.substring(currentLineStart, cursorPosition);

      measureEl.textContent = textUpToCursor;
      const textWidth = measureEl.getBoundingClientRect().width;

      document.body.removeChild(measureEl);

      const visibleWidth = textarea.clientWidth;
      const scrollLeft = textarea.scrollLeft;
      const paddingLeft = 0 * 4;

      const cursorX = textWidth - paddingLeft * 4;

      if (cursorX < scrollLeft + paddingLeft) {
        textarea.scrollLeft = Math.max(0, cursorX - paddingLeft - 10);
      } else if (cursorX > scrollLeft + visibleWidth - 20) {
        textarea.scrollLeft = cursorX - visibleWidth + 40;
      }
    }
  }, [cursorPosition, value]);

  useEffect(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [lines.length]);

  useEffect(() => {
    if (
      saveState === "saved" &&
      selectedFormatLanguage === "auto" &&
      currentLanguage === "code" &&
      value.length > 50
    ) {
      const detected = detectCodeLanguage(value);
      if (detected) {
        setDetectedLanguage(detected);
      }
    }
  }, [saveState, value, currentLanguage, selectedFormatLanguage]);

  useEffect(() => {
    const performInitialFormat = async () => {
      if (
        detectedLanguage &&
        hasDetectedOnce === false &&
        currentLanguage === "code" &&
        autoFormat
      ) {
        setHasDetectedOnce(true);
        const result = await formatCode(value, detectedLanguage);

        if (result.success) {
          if (result.code !== value) {
            setValue(result.code);
            if (onChange) {
              onChange(result.code);
            }
            setFormatSuccess(true);
          }
        } else if (result.error) {
          setFormatErrorMessage(result.error);
        }
      }
    };

    performInitialFormat();
  }, [
    detectedLanguage,
    hasDetectedOnce,
    currentLanguage,
    autoFormat,
    value,
    onChange,
  ]);

  useEffect(() => {
    loadPrettier().catch(console.error);
  }, []);

  useEffect(() => {
    if (formatSuccess) {
      if (formatSuccessTimeoutRef.current) {
        clearTimeout(formatSuccessTimeoutRef.current);
      }

      formatSuccessTimeoutRef.current = setTimeout(() => {
        setFormatSuccess(false);
      }, 2000);
    }

    return () => {
      if (formatSuccessTimeoutRef.current) {
        clearTimeout(formatSuccessTimeoutRef.current);
      }
    };
  }, [formatSuccess]);

  const handleFormatError = (error: string) => {
    setFormatErrorMessage(error);
  };

  const handlers = createEditorHandlers({
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
    autoDetectLanguage,
    autoFormat,
    onFormatError: handleFormatError,
    setFormatErrorMessage,
    setFormatSuccess,
    formatSuccess,
  });

  return (
    <div
      className={`bg-card overflow-hidden flex flex-col ${className} w-full relative`}
      style={{ height }}
    >
      <div className="flex justify-between items-center px-3 py-1 border-b border-border/50 bg-card/40 absolute top-0 w-full h-10 z-50 backdrop-blur-xl">
        <EditorLanguageSelector
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          detectedLanguage={detectedLanguage}
          onFormatClick={handlers.handleFormatClick}
          value={value}
          isFirstPaste={isFirstPaste}
          formatError={formatErrorMessage !== null}
          formatSuccess={formatSuccess}
          setFormatSuccess={setFormatSuccess}
        />

        <EditorStatusIndicator saveState={saveState} lastEdited={lastEdited} />
      </div>

      <div
        ref={wrapperRef}
        className="flex flex-1 overflow-hidden relative w-full"
      >
        <div className="w-full h-full relative flex-grow textarea-scrollbar pt-11">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handlers.handleChange}
            onKeyDown={handlers.handleKeyDown}
            onClick={handlers.handleClick}
            onSelect={handlers.handleSelect}
            onPaste={handlers.handlePaste}
            placeholder={currentPlaceholder}
            readOnly={readOnly}
            className={cn(
              "px-4 pb-4 bg-transparent w-full h-full outline-none resize-none overflow-auto scrollbar-textarea selection:bg-foreground/75 selection:text-accent font-medium"
            )}
            style={{
              fontFamily:
                currentLanguage === "code"
                  ? "Roboto Mono, monospace"
                  : "Inter, sans-serif",
              fontSize: "1rem",
              whiteSpace: "pre",
              scrollbarColor: "rgba(140, 140, 140, 0.3) transparent",
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

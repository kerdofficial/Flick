import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { loadPrettier, formatCode } from "@/lib/codeFormatter";
import { detectCodeLanguage } from "@/lib/utils";
import { scrollbarStyles } from "@/lib/editorStyles";
import { EditorStatusIndicator } from "./editor/EditorStatusIndicator";
import { EditorLanguageSelector } from "./editor/EditorLanguageSelector";
import { createEditorHandlers } from "./editor/EditorHandlers";
import { useSettings } from "@/contexts/SettingsContext";
import { useFlick } from "@/contexts/FlickContext";

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
  flickId?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = "",
  language,
  onChange,
  placeholder,
  readOnly = false,
  className = "",
  height = "300px",
  autoDetectLanguage,
  autoFormat,
  flickId,
}) => {
  const { settings } = useSettings();
  const { flick, setFlick } = useFlick();

  const effectiveLanguage = language || settings.defaultLanguage;
  const effectiveAutoDetect = autoDetectLanguage ?? true;
  const effectiveAutoFormat = autoFormat ?? true;

  const currentFlick = flickId
    ? flick.find((f) => f.id === flickId)
    : flick.length > 0
      ? flick[0]
      : null;

  const [localContent, setLocalContent] = useState(
    currentFlick?.content || initialValue
  );
  const [lines, setLines] = useState<string[]>(
    (currentFlick?.content || initialValue).split("\n")
  );
  const [lastEdited, setLastEdited] = useState(
    currentFlick?.updatedAt
      ? new Date(currentFlick.updatedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : new Date().toLocaleString("en-US", {
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
  const [currentLanguage, setCurrentLanguage] = useState<
    "plaintext" | "code" | "error"
  >(
    effectiveLanguage === "plaintext" || effectiveLanguage === "code"
      ? effectiveLanguage
      : "error"
  );
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholder || "Type here..."
  );
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [selectedFormatLanguage, _setSelectedFormatLanguage] = useState("auto");
  const [isFirstPaste, setIsFirstPaste] = useState(true);
  const [hasDetectedOnce, setHasDetectedOnce] = useState(false);
  const [formatErrorMessage, setFormatErrorMessage] = useState<string | null>(
    null
  );
  const [formatSuccess, setFormatSuccess] = useState<boolean>(false);
  const formatSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [saveState, setSaveState] = useState<
    "empty" | "editing" | "waiting" | "saving" | "saved"
  >((currentFlick?.content || initialValue) === "" ? "empty" : "saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentFlick) {
      setLocalContent(currentFlick.content || "");
      setLines((currentFlick.content || "").split("\n"));
      setLastEdited(
        new Date(currentFlick.updatedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setSaveState(currentFlick.content === "" ? "empty" : "saved");

      setDetectedLanguage(null);
      setIsFirstPaste(true);
      setHasDetectedOnce(false);
      setFormatErrorMessage(null);
      setFormatSuccess(false);
    } else {
      setLocalContent(initialValue);
      setLines(initialValue.split("\n"));
      setSaveState(initialValue === "" ? "empty" : "saved");
    }
  }, [currentFlick, initialValue, flickId]);

  useEffect(() => {
    if (saveState === "saving" && currentFlick) {
      const updatedFlicks = [...flick];
      const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

      if (index !== -1) {
        const updatedFlick = {
          ...updatedFlicks[index],
          content: localContent,
          updatedAt: new Date(),
        };

        updatedFlicks[index] = updatedFlick;
        setFlick(updatedFlicks);

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

        setSaveState("saved");
      }
    }
  }, [saveState, localContent, flick, setFlick, currentFlick]);

  useEffect(() => {
    if (effectiveLanguage === "plaintext" || effectiveLanguage === "code") {
      setCurrentLanguage(effectiveLanguage);
    }
  }, [effectiveLanguage]);

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
    const newLines = localContent.split("\n");
    setLines(newLines);

    if (
      formatErrorMessage &&
      (localContent !== (currentFlick?.content || initialValue) ||
        localContent === "")
    ) {
      setFormatErrorMessage(null);
    }
  }, [localContent, formatErrorMessage, currentFlick, initialValue]);

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
        if (localContent[i] === "\n") {
          cursorLine++;
          charPos = 0;
        } else {
          charPos++;
        }
        offset++;
      }

      const currentLineStart =
        localContent.lastIndexOf("\n", cursorPosition - 1) + 1;
      const textUpToCursor = localContent.substring(
        currentLineStart,
        cursorPosition
      );

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
  }, [cursorPosition, localContent]);

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
      localContent.length > 50
    ) {
      const detected = detectCodeLanguage(localContent);
      if (detected) {
        setDetectedLanguage(detected);
      }
    }
  }, [saveState, localContent, currentLanguage, selectedFormatLanguage]);

  useEffect(() => {
    const performInitialFormat = async () => {
      if (
        detectedLanguage &&
        hasDetectedOnce === false &&
        currentLanguage === "code" &&
        effectiveAutoFormat
      ) {
        setHasDetectedOnce(true);
        const result = await formatCode(localContent, detectedLanguage);

        if (result.success) {
          if (result.code !== localContent) {
            setLocalContent(result.code);
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
    effectiveAutoFormat,
    localContent,
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

  const handleEditorChange = (newValue: string) => {
    setLocalContent(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handlers = createEditorHandlers({
    value: localContent,
    setValue: handleEditorChange,
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
    autoDetectLanguage: effectiveAutoDetect,
    autoFormat: effectiveAutoFormat,
    onFormatError: (error) => setFormatErrorMessage(error),
    setFormatErrorMessage,
    setFormatSuccess,
    formatSuccess,
    updateFlickContent: (content: string) => {
      if (currentFlick) {
        const updatedFlicks = [...flick];
        const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

        if (index !== -1) {
          updatedFlicks[index] = {
            ...updatedFlicks[index],
            content,
            updatedAt: new Date(),
            isEdited: true,
          };

          setFlick(updatedFlicks);
        }
      }
    },
  });

  return (
    <div
      className={`bg-card overflow-hidden flex flex-col ${className} w-full relative`}
      style={{ height }}
    >
      <div className="flex justify-between items-center px-3 py-1 border-b border-border/50 bg-card/40 absolute top-0 w-full h-10 z-50 backdrop-blur-xl">
        <EditorLanguageSelector
          currentLanguage={currentLanguage as "plaintext" | "code"}
          setCurrentLanguage={setCurrentLanguage}
          detectedLanguage={detectedLanguage}
          onFormatClick={handlers.handleFormatClick}
          value={localContent}
          isFirstPaste={isFirstPaste}
          formatError={formatErrorMessage !== null}
          formatSuccess={formatSuccess}
          setFormatSuccess={setFormatSuccess}
        />

        <EditorStatusIndicator saveState={saveState} lastEdited={lastEdited} />
      </div>

      <div ref={wrapperRef} className="flex flex-1 relative w-full">
        <div className="w-full h-full relative flex-grow textarea-scrollbar pt-10">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handlers.handleChange}
            onKeyDown={handlers.handleKeyDown}
            onClick={handlers.handleClick}
            onSelect={handlers.handleSelect}
            onPaste={handlers.handlePaste}
            placeholder={currentPlaceholder}
            readOnly={readOnly}
            spellCheck={false}
            className={cn(
              "px-4 pb-4 w-full h-full outline-none resize-none overflow-auto scrollbar-textarea selection:bg-foreground/75 selection:text-accent font-medium bg-transparent"
            )}
            style={{
              fontFamily: `${
                currentLanguage === "plaintext"
                  ? `"${settings.fontFamily.plaintext}", sans-serif`
                  : `"${settings.fontFamily.code}", monospace`
              }`,

              fontSize: `${settings.fontSize}px`,
              whiteSpace: "pre",
              scrollbarColor: "rgba(140, 140, 140, 0.3) transparent",
            }}
          />
        </div>
      </div>
    </div>
  );
};

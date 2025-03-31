import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { loadPrettier, formatCode } from "@/lib/codeFormatter";
import { detectCodeLanguage } from "@/lib/utils";
import { scrollbarStyles } from "@/lib/editorStyles";
import { EditorStatusIndicator } from "./editor/EditorStatusIndicator";
import { EditorLanguageSelector } from "./editor/EditorLanguageSelector";
import { createEditorHandlers } from "./editor/EditorHandlers";
import { useSettings } from "@/contexts/SettingsContext";
import { useFlick } from "@/contexts/FlickContext";
import { Text } from "@/components/text";
import { HStack } from "./layout";
import {
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
  TooltipContent,
} from "@/components/shadcn/tooltip";

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

  const [currentLanguage, setCurrentLanguage] = useState<
    "plaintext" | "code" | "error"
  >(
    effectiveLanguage === "plaintext" || effectiveLanguage === "code"
      ? effectiveLanguage
      : "error"
  );

  const getFlickContent = useCallback(() => {
    if (!currentFlick) return initialValue;

    if (currentLanguage === "plaintext") {
      return currentFlick.content.plaintext;
    } else {
      return currentFlick.content.code;
    }
  }, [currentFlick, initialValue, currentLanguage]);

  const getFlickTabContent = useCallback(() => {
    if (!currentFlick) return initialValue;

    if (currentLanguage === "plaintext") {
      return currentFlick.content.code;
    } else {
      return currentFlick.content.plaintext;
    }
  }, [currentFlick, initialValue, currentLanguage]);

  const [localContent, setLocalContent] = useState(getFlickContent());
  const [localTabContent, setLocalTabContent] = useState(getFlickTabContent());
  const [lines, setLines] = useState<string[]>(getFlickContent().split("\n"));
  const [tabLines, setTabLines] = useState<string[]>(
    getFlickTabContent().split("\n")
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
  const textTabareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
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
  const [tabMode, setTabMode] = useState(false);

  const [saveState, setSaveState] = useState<
    "empty" | "editing" | "waiting" | "saving" | "saved"
  >(getFlickContent() === "" ? "empty" : "saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentFlick) {
      const content = getFlickContent();
      const tabContent = getFlickTabContent();

      setLocalContent(content);
      setLocalTabContent(tabContent);
      setLines(content.split("\n"));
      setTabLines(tabContent.split("\n"));
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
      setSaveState(content === "" ? "empty" : "saved");

      setDetectedLanguage(null);
      setIsFirstPaste(true);
      setHasDetectedOnce(false);
      setFormatErrorMessage(null);
    } else {
      setLocalContent(initialValue);
      setLocalTabContent(initialValue);
      setLines(initialValue.split("\n"));
      setTabLines(initialValue.split("\n"));
      setSaveState(initialValue === "" ? "empty" : "saved");
    }
  }, [
    currentFlick,
    initialValue,
    flickId,
    currentLanguage,
    getFlickContent,
    getFlickTabContent,
  ]);

  useEffect(() => {
    if (saveState === "saving" && currentFlick) {
      const updatedFlicks = [...flick];
      const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

      if (index !== -1) {
        const updatedContent = {
          ...currentFlick.content,
        };

        if (currentLanguage === "plaintext") {
          updatedContent.plaintext = localContent;
        } else {
          updatedContent.code = localContent;
        }

        const updatedFlick = {
          ...updatedFlicks[index],
          content: updatedContent,
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
  }, [saveState, localContent, flick, setFlick, currentFlick, currentLanguage]);

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
      (localContent !== getFlickContent() || localContent === "")
    ) {
      setFormatErrorMessage(null);
    }
  }, [
    localContent,
    formatErrorMessage,
    currentFlick,
    initialValue,
    effectiveLanguage,
  ]);

  useEffect(() => {
    const newTabLines = localTabContent.split("\n");
    setTabLines(newTabLines);
  }, [localTabContent]);

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
      }, 5000);
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

  const handleTabContentChange = (newValue: string) => {
    setLocalTabContent(newValue);
  };

  const handleLanguageChange = (newLanguage: "plaintext" | "code") => {
    setCurrentLanguage(newLanguage);

    if (currentFlick && tabMode) {
      const mainContent = localContent;
      const secondaryContent = localTabContent;

      setLocalContent(secondaryContent);
      setLocalTabContent(mainContent);

      setLines(secondaryContent.split("\n"));
      setTabLines(mainContent.split("\n"));

      const updatedFlicks = [...flick];
      const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

      if (index !== -1) {
        const updatedContent = { ...updatedFlicks[index].content };

        if (newLanguage === "plaintext") {
          updatedContent.plaintext = secondaryContent;
          updatedContent.code = mainContent;
        } else {
          updatedContent.plaintext = mainContent;
          updatedContent.code = secondaryContent;
        }

        updatedFlicks[index] = {
          ...updatedFlicks[index],
          content: updatedContent,
          updatedAt: new Date(),
        };

        setFlick(updatedFlicks);
      }
    } else if (currentFlick) {
      setLocalContent(getFlickContent());
      setLocalTabContent(getFlickTabContent());
      setLines(getFlickContent().split("\n"));
      setTabLines(getFlickTabContent().split("\n"));
    }
  };

  const handlers = createEditorHandlers({
    value: localContent,
    setValue: handleEditorChange,
    textareaRef,
    textTabareaRef,
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
    setLocalTabContent: handleTabContentChange,
    updateFlickTabContent: (content: string) => {
      if (currentFlick) {
        const updatedFlicks = [...flick];
        const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

        if (index !== -1) {
          const updatedContent = { ...updatedFlicks[index].content };

          if (currentLanguage === "plaintext") {
            updatedContent.code = content;
          } else {
            updatedContent.plaintext = content;
          }

          updatedFlicks[index] = {
            ...updatedFlicks[index],
            content: updatedContent,
            updatedAt: new Date(),
            isEdited: true,
          };

          setFlick(updatedFlicks);
        }
      }
    },
    updateFlickContent: (content: string) => {
      if (currentFlick) {
        const updatedFlicks = [...flick];
        const index = updatedFlicks.findIndex((f) => f.id === currentFlick.id);

        if (index !== -1) {
          const updatedContent = { ...updatedFlicks[index].content };

          if (currentLanguage === "plaintext") {
            updatedContent.plaintext = content;
          } else {
            updatedContent.code = content;
          }

          updatedFlicks[index] = {
            ...updatedFlicks[index],
            content: updatedContent,
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
      <div className="flex justify-between items-center px-3 py-1 border-b border-border/30 bg-card/40 absolute top-0 w-full h-10 z-50 backdrop-blur-xl">
        <EditorLanguageSelector
          currentLanguage={currentLanguage as "plaintext" | "code"}
          setCurrentLanguage={handleLanguageChange}
          detectedLanguage={detectedLanguage}
          onFormatClick={handlers.handleFormatClick}
          value={localContent}
          isFirstPaste={isFirstPaste}
          formatError={formatErrorMessage !== null}
          formatSuccess={formatSuccess}
          setFormatSuccess={setFormatSuccess}
          tabMode={tabMode}
          setTabMode={setTabMode}
        />

        <EditorStatusIndicator saveState={saveState} lastEdited={lastEdited} />
      </div>

      {tabMode && (
        <div className="grid grid-cols-2 justify-between items-center border-b border-border/30 bg-border/50 w-full h-8 backdrop-blur-xl mt-10">
          <HStack distribution="equalSpacing" spacing="none" className="px-4">
            <Text
              className="h-full flex items-center uppercase"
              variant="caption2"
              weight="medium"
              noSelect
            >
              {currentLanguage === "plaintext" ? "Plain text" : "Code"}
            </Text>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Text
                    className="h-full flex items-center uppercase"
                    variant="caption2"
                    weight="medium"
                    noSelect
                  >
                    {localContent.length > 1000
                      ? `~${(localContent.length / 1000).toFixed(1)}K characters`
                      : `${localContent.length} Characters`}
                    , {lines.length} Lines
                  </Text>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={-5}
                  className="border border-border shadow-lg"
                >
                  <p>Characters: {localContent.length}</p>
                  {currentLanguage === "plaintext" && (
                    <>
                      <p>Words: {localContent.split(/\s+/).length}</p>
                    </>
                  )}
                  <p>Lines: {lines.length}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </HStack>
          <HStack
            distribution="equalSpacing"
            spacing="none"
            className="px-4 border-l border-foreground/10 h-full"
          >
            <Text
              className="h-full flex items-center uppercase"
              variant="caption2"
              weight="medium"
              noSelect
            >
              {currentLanguage === "plaintext" ? "Code" : "Plain text"}
            </Text>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Text
                    className="h-full flex items-center uppercase"
                    variant="caption2"
                    weight="medium"
                    noSelect
                  >
                    {localTabContent.length > 1000
                      ? `~${(localTabContent.length / 1000).toFixed(1)}K characters`
                      : `${localTabContent.length} Characters`}
                    , {tabLines.length} Lines
                  </Text>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={-5}
                  className="border border-border shadow-lg"
                >
                  <p>Characters: {localTabContent.length}</p>
                  {currentLanguage === "code" && (
                    <>
                      <p>Words: {localTabContent.split(/\s+/).length}</p>
                    </>
                  )}
                  <p>Lines: {tabLines.length}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </HStack>
        </div>
      )}

      <div ref={wrapperRef} className="flex flex-1 relative w-full max-w-full">
        <div
          className={cn(
            "w-full h-full relative flex-grow textarea-scrollbar max-w-full flex",
            !tabMode && "pt-10"
          )}
        >
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
            wrap="hard"
            cols={10}
            className={cn(
              "px-4 pb-4 pt-1 w-full h-full outline-none resize-none overflow-y-auto scrollbar-textarea selection:bg-foreground/75 selection:text-accent font-medium bg-transparent text-wrap max-w-full break-words whitespace-pre-wrap",
              currentLanguage === "plaintext"
                ? (settings.fontSize.plaintext <= 14 && "leading-4.5") ||
                    (settings.fontSize.plaintext === 16 && "leading-5.5") ||
                    (settings.fontSize.plaintext >= 18 &&
                      settings.fontSize.plaintext < 22 &&
                      "leading-6") ||
                    (settings.fontSize.plaintext >= 22 && "leading-7")
                : (settings.fontSize.code <= 14 && "leading-4.5") ||
                    (settings.fontSize.code === 16 && "leading-5.5") ||
                    (settings.fontSize.code >= 18 &&
                      settings.fontSize.code < 22 &&
                      "leading-6") ||
                    (settings.fontSize.code >= 22 && "leading-7")
            )}
            style={{
              fontFamily: `${
                currentLanguage === "plaintext"
                  ? `"${settings.fontFamily.plaintext}", sans-serif`
                  : `"${settings.fontFamily.code}", monospace`
              }`,
              fontSize: `${
                currentLanguage === "plaintext"
                  ? settings.fontSize.plaintext
                  : settings.fontSize.code
              }px`,
              scrollbarColor: "rgba(140, 140, 140, 0.3) transparent",
            }}
          />
          {tabMode && (
            <textarea
              ref={textTabareaRef}
              value={localTabContent}
              onChange={handlers.handleTabChange}
              onKeyDown={handlers.handleKeyDown}
              onClick={handlers.handleClick}
              onSelect={handlers.handleSelect}
              onPaste={handlers.handlePaste}
              placeholder={currentPlaceholder}
              readOnly={readOnly}
              spellCheck={false}
              wrap="hard"
              cols={10}
              className={cn(
                "px-4 pb-4 pt-1 w-full h-full outline-none resize-none overflow-y-auto scrollbar-textarea selection:bg-foreground/75 selection:text-accent font-medium bg-transparent text-wrap max-w-full break-words whitespace-pre-wrap border-l border-foreground/10",
                currentLanguage === "plaintext"
                  ? (settings.fontSize.code <= 14 && "leading-4.5") ||
                      (settings.fontSize.code === 16 && "leading-5.5") ||
                      (settings.fontSize.code >= 18 &&
                        settings.fontSize.code < 22 &&
                        "leading-6") ||
                      (settings.fontSize.code >= 22 && "leading-7")
                  : (settings.fontSize.plaintext <= 14 && "leading-4.5") ||
                      (settings.fontSize.plaintext === 16 && "leading-5.5") ||
                      (settings.fontSize.plaintext >= 18 &&
                        settings.fontSize.plaintext < 22 &&
                        "leading-6") ||
                      (settings.fontSize.plaintext >= 22 && "leading-7")
              )}
              style={{
                fontFamily: `${
                  currentLanguage === "plaintext"
                    ? `"${settings.fontFamily.code}", monospace`
                    : `"${settings.fontFamily.plaintext}", sans-serif`
                }`,
                fontSize: `${
                  currentLanguage === "plaintext"
                    ? settings.fontSize.code
                    : settings.fontSize.plaintext
                }px`,
                scrollbarColor: "rgba(140, 140, 140, 0.3) transparent",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

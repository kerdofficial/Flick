import React, { useState, useRef, useEffect } from "react";
import { Text } from "./text";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Check, CircleSlash, Loader2, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./shadcn/tooltip";

const scrollbarStyles = `
  /* style scrollbar for macOS */
  .textarea-scrollbar::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  .textarea-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(140, 140, 140, 0.3);
    border-radius: 10px;
    background-clip: padding-box;
    border: 16px solid transparent;
    background-clip: padding-box;
    border-radius: 9999px;
  }
  
  .textarea-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(140, 140, 140, 0.5);
  }
  
  .textarea-scrollbar::-webkit-scrollbar-thumb:active {
    width: 12px;
    background-color: rgba(140, 140, 140, 0.6);
  }
  
  .textarea-scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
  }
  
  /* For Firefox */
  .textarea-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(140, 140, 140, 0.3) transparent;
  }
  
  .textarea-scrollbar:active {
    scrollbar-width: auto;
  }
  
  /* style scrollbar for textarea */
  .scrollbar-textarea::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb {
    background-color: rgba(140, 140, 140, 0.3);
    border-radius: 10px;
    background-clip: padding-box;
    border: 2px solid transparent;
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb:hover {
    background-color: rgba(140, 140, 140, 0.5);
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb:active {
    width: 12px;
    background-color: rgba(140, 140, 140, 0.6);
  }
  
  .scrollbar-textarea::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

interface CodeEditorProps {
  initialValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  lineNumberColor?: string;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = "",
  language = "plaintext",
  onChange,
  placeholder = "Type here...",
  lineNumberColor = "muted-foreground",
  readOnly = false,
  className = "",
  height = "300px",
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

  const [saveState, setSaveState] = useState<
    "empty" | "editing" | "waiting" | "saving" | "saved"
  >(initialValue === "" ? "empty" : "saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const LINE_HEIGHT = 21;

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
  }, [value]);

  useEffect(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [lines.length]);

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
      const paddingLeft = 16 * 4;

      const cursorX = textWidth - paddingLeft * 4;

      if (cursorX < scrollLeft + paddingLeft) {
        textarea.scrollLeft = Math.max(0, cursorX - paddingLeft - 10);
      } else if (cursorX > scrollLeft + visibleWidth - 20) {
        textarea.scrollLeft = cursorX - visibleWidth + 40;
      }

      const lineTop = cursorLine * LINE_HEIGHT;
      const visibleHeight = textarea.clientHeight;

      if (lineTop < textarea.scrollTop) {
        textarea.scrollTop = lineTop;
      } else if (lineTop + LINE_HEIGHT > textarea.scrollTop + visibleHeight) {
        textarea.scrollTop = lineTop - visibleHeight + LINE_HEIGHT + 10;
      }
    }
  }, [cursorPosition, value]);

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

    if (newValue === "") {
      setSaveState("empty");
    } else {
      setSaveState("editing");

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setSaveState("waiting");

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

  const displayLines = lines.length > 0 ? lines : [""];

  return (
    <div
      className={`bg-card rounded-lg overflow-hidden flex flex-col ${className} w-full`}
      style={{ height }}
    >
      <div className="flex justify-between items-center px-3 py-1 border-b border-border/50">
        <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
          <SelectTrigger className="w-auto px-2 h-6 border-none outline-none hover:bg-foreground/10 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-medium transition-colors">
            <SelectValue placeholder={language} />
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
                  sideOffset={
                    saveState === "editing" || saveState === "waiting" ? 5 : 4
                  }
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
          <Text
            variant="caption"
            color="muted-foreground"
            noSelect
            weight="medium"
          >
            {lastEdited.toLocaleString()}
          </Text>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="flex flex-1 overflow-hidden relative w-full"
      >
        <div
          ref={gutterRef}
          className="w-[3.5rem] border-r border-border/30 overflow-hidden overflow-y-auto absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
          }}
        >
          <div className="backdrop-blur-2xl bg-card/50 pt-1 pb-3">
            {displayLines.map((_, i) => (
              <div
                key={i}
                className="text-right pr-2"
                style={{
                  height: `${LINE_HEIGHT}px`,
                  lineHeight: `${LINE_HEIGHT}px`,
                }}
              >
                <Text
                  variant="caption2"
                  color={lineNumberColor}
                  noSelect
                  weight="regular"
                  textStyles={["monospaced"]}
                  className="inline-block text-foreground/50 mix-blend-screen"
                >
                  {i + 1}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-full relative flex-grow textarea-scrollbar">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onSelect={handleSelect}
            placeholder={currentPlaceholder}
            readOnly={readOnly}
            className={cn(
              "pl-16 pr-4 pt-1 mb-3 bg-transparent w-full h-full outline-none resize-none overflow-auto scrollbar-textarea selection:bg-foreground/75 selection:text-accent",
              currentLanguage === "code" && "font-medium",
              currentLanguage === "plaintext" && "font-normal"
            )}
            style={{
              fontFamily:
                currentLanguage === "code"
                  ? "Roboto Mono, monospace"
                  : undefined,
              fontSize: "0.875rem", // text-sm
              lineHeight: `${LINE_HEIGHT}px`,
              whiteSpace: "pre",
              scrollbarColor: "rgba(140, 140, 140, 0.3) transparent",
              letterSpacing: currentLanguage === "plaintext" ? "0.015em" : "0",
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

import { forwardRef } from "react";
import { Text } from "../text";
import { LINE_HEIGHT } from "@/lib/editorStyles";

interface EditorGutterProps {
  lines: string[];
  lineNumberColor?: string;
}

export const EditorGutter = forwardRef<HTMLDivElement, EditorGutterProps>(
  ({ lines, lineNumberColor = "muted-foreground" }, ref) => {
    const displayLines = lines.length > 0 ? lines : [""];

    return (
      <div
        ref={ref}
        className="w-[3.5rem] border-r border-border/30 overflow-hidden overflow-y-auto absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
        }}
      >
        <div className="backdrop-blur-2xl bg-card/50 pt-2 pb-3">
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
    );
  }
);

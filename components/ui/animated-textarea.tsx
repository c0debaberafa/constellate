"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextareaProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onInput"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AnimatedTextarea = React.forwardRef<
  HTMLDivElement,
  AnimatedTextareaProps
>(({ value, onChange, placeholder, className, ...props }, ref) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const previousContentRef = React.useRef<string>("");
  const isUpdatingRef = React.useRef(false);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const cursorUpdateTimeoutRef = React.useRef<number | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  // Combine refs
  React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  // Update cursor position - debounced to prevent flicker
  const updateCursorPosition = React.useCallback(() => {
    // Clear any pending update
    if (cursorUpdateTimeoutRef.current) {
      cancelAnimationFrame(cursorUpdateTimeoutRef.current);
    }

    // Skip if we're updating DOM or not focused
    if (isUpdatingRef.current || !isFocused) return;

    cursorUpdateTimeoutRef.current = requestAnimationFrame(() => {
      const editor = editorRef.current;
      const cursor = cursorRef.current;
      if (!editor || !cursor || !isFocused || isUpdatingRef.current) return;

      try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          // If no selection but focused, show cursor at start
          if (isFocused && value === "") {
            const paddingLeft =
              parseFloat(window.getComputedStyle(editor).paddingLeft) || 0;
            const paddingTop =
              parseFloat(window.getComputedStyle(editor).paddingTop) || 0;
            const lineHeight =
              parseFloat(window.getComputedStyle(editor).lineHeight) || 24;

            cursor.style.left = `${paddingLeft}px`;
            cursor.style.top = `${paddingTop}px`;
            cursor.style.height = `${lineHeight}px`;
            cursor.style.opacity = "1";
            return;
          }
          cursor.style.opacity = "0";
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();

        // Check if editor is visible
        if (editorRect.width === 0 && editorRect.height === 0) {
          cursor.style.opacity = "0";
          return;
        }

        const lineHeight =
          parseFloat(window.getComputedStyle(editor).lineHeight) || 24;
        const left = rect.left - editorRect.left;
        const top = rect.top - editorRect.top;

        if (!isNaN(left) && !isNaN(top) && left >= 0 && top >= 0) {
          cursor.style.left = `${left}px`;
          cursor.style.top = `${top}px`;
          cursor.style.height = `${lineHeight}px`;
          cursor.style.opacity = "1";
        } else {
          cursor.style.opacity = "0";
        }
      } catch {
        // Ignore errors
      }
    });
  }, [isFocused, value]);

  // Update content and apply animations
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isUpdatingRef.current) return;

    const previousContent = previousContentRef.current;
    if (previousContent === value) {
      updateCursorPosition();
      return;
    }

    // Clear any pending animation cleanup
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Find where content differs
    let diffStart = 0;
    while (
      diffStart < previousContent.length &&
      diffStart < value.length &&
      previousContent[diffStart] === value[diffStart]
    ) {
      diffStart++;
    }

    // Find where content differs from the end
    let prevEnd = previousContent.length;
    let newEnd = value.length;
    while (
      prevEnd > diffStart &&
      newEnd > diffStart &&
      previousContent[prevEnd - 1] === value[newEnd - 1]
    ) {
      prevEnd--;
      newEnd--;
    }

    const isAddition = newEnd > diffStart;

    // Build HTML with animated spans
    const fragment = document.createDocumentFragment();
    value.split("").forEach((char, index) => {
      const span = document.createElement("span");
      if (isAddition && index >= diffStart && index < newEnd) {
        span.className = "char-fade-in";
      }
      span.textContent = char;
      fragment.appendChild(span);
    });

    // Update DOM
    isUpdatingRef.current = true;
    editor.innerHTML = "";
    editor.appendChild(fragment);

    // Restore selection and update cursor
    requestAnimationFrame(() => {
      if (!editor) {
        isUpdatingRef.current = false;
        return;
      }

      // Try to restore cursor to end of new content
      try {
        const selection = window.getSelection();
        if (selection) {
          const textNodes = getTextNodes(editor);
          const targetPos = isAddition ? newEnd : diffStart;
          let offset = 0;

          for (const node of textNodes) {
            const nodeLength = node.textContent?.length || 0;
            if (offset + nodeLength >= targetPos) {
              const newRange = document.createRange();
              newRange.setStart(node, Math.min(targetPos - offset, nodeLength));
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              break;
            }
            offset += nodeLength;
          }
        }
      } catch {
        // Ignore errors
      }

      isUpdatingRef.current = false;

      // Update cursor after DOM is stable
      requestAnimationFrame(() => {
        updateCursorPosition();
      });
    });

    previousContentRef.current = value;

    // Clean up animation classes
    animationTimeoutRef.current = setTimeout(() => {
      if (editor) {
        const spans = editor.querySelectorAll(".char-fade-in");
        spans.forEach((span) => {
          (span as HTMLSpanElement).classList.remove("char-fade-in");
        });
      }
    }, 350);
  }, [value, updateCursorPosition]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdatingRef.current) return;
    const newContent = e.currentTarget.textContent || "";

    // Mark as typing and reset timeout
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000); // Stop blinking after 1 second of no typing

    onChange(newContent);
    // Cursor will update via the value change effect
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Let Enter key work naturally - don't prevent default
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
    // Cursor will update via the value change effect
  };

  const handleFocus = () => {
    setIsFocused(true);
    // If empty, show cursor at start immediately
    if (value === "") {
      requestAnimationFrame(() => {
        const editor = editorRef.current;
        const cursor = cursorRef.current;
        if (editor && cursor) {
          const paddingLeft =
            parseFloat(window.getComputedStyle(editor).paddingLeft) || 0;
          const paddingTop =
            parseFloat(window.getComputedStyle(editor).paddingTop) || 0;
          const lineHeight =
            parseFloat(window.getComputedStyle(editor).lineHeight) || 24;

          cursor.style.left = `${paddingLeft}px`;
          cursor.style.top = `${paddingTop}px`;
          cursor.style.height = `${lineHeight}px`;
          cursor.style.opacity = "1";
        }
      });
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateCursorPosition);
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClick = () => {
    // Use double RAF to ensure selection is set
    requestAnimationFrame(() => {
      requestAnimationFrame(updateCursorPosition);
    });
  };

  // Initialize content on mount
  React.useEffect(() => {
    const editor = editorRef.current;
    if (editor && value && previousContentRef.current === "") {
      editor.textContent = value;
      previousContentRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (cursorUpdateTimeoutRef.current) {
        cancelAnimationFrame(cursorUpdateTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        data-placeholder={placeholder}
        spellCheck={false}
        className={cn(
          "font-mono text-lg resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden outline-none whitespace-pre-wrap",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40",
          "caret-transparent",
          className
        )}
        style={{ minHeight: "auto", height: "auto" }}
        suppressContentEditableWarning
        {...props}
      />
      {/* Custom block cursor */}
      {isFocused && (
        <div
          ref={cursorRef}
          className={`absolute pointer-events-none z-10 transition-all duration-75 ease-linear ${
            !isTyping ? "cursor-blink" : ""
          }`}
          style={{
            left: "0px",
            top: "0px",
            width: "8px",
            height: "12px",
            backgroundColor: "hsl(160 65% 45%)",
            opacity: 0,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

AnimatedTextarea.displayName = "AnimatedTextarea";

function getTextNodes(element: Node): Node[] {
  const textNodes: Node[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }
  return textNodes;
}

export { AnimatedTextarea };

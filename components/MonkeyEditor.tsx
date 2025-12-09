"use client";

import {
  useRef,
  useState,
  useLayoutEffect,
  ChangeEvent,
  useEffect,
} from "react";

interface MonkeyEditorProps {
  value: string;
  onChange: (v: string) => void;
  cursorPos: number;
  onCursorChange: (c: number) => void;
  placeholder?: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function MonkeyEditor({
  value,
  onChange,
  cursorPos,
  onCursorChange,
  placeholder,
  onTypingChange,
}: MonkeyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevValue = useRef("");
  const [charObjects, setCharObjects] = useState<
    { id: string; ch: string; animating: boolean }[]
  >([]);

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 8, y: 8 });
  const isFirstRender = useRef(true);
  const uid = () => Math.random().toString(36).slice(2);

  // Initialize charObjects on first render or if value changes programmatically
  useEffect(() => {
    setCharObjects(
      value.split("").map((ch) => ({ id: uid(), ch, animating: false }))
    );
    prevValue.current = value;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    onCursorChange(e.target.selectionStart);
    setIsTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set isTyping to false after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 5000);
  };

  const handleCursorMove = () => {
    const e = textareaRef.current;
    if (!e) return;
    onCursorChange(e.selectionStart);
  };

  const handleKeyDown = () => {
    setIsTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set isTyping to false after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 10000);
  };

  useLayoutEffect(() => {
    charRefs.current.length = charObjects.length;
  }, [charObjects.length]);

  useLayoutEffect(() => {
    const cursorEl = cursorRef.current;

    if (!cursorEl) return;

    let newX: number;
    let newY: number;

    // Cursor at position 0 → special case
    if (cursorPos === 0) {
      newX = 8;
      newY = 8;
    } else {
      const target = charRefs.current[cursorPos - 1];
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const parentRect = target.parentElement!.getBoundingClientRect();
      const paddingLeft = 0;
      const paddingTop = 2;
      newX = rect.left - parentRect.left + rect.width + paddingLeft;
      newY = rect.top - parentRect.top + paddingTop;
    }

    // Skip animation on first render
    if (isFirstRender.current) {
      setCursorPosition({ x: newX, y: newY });
      isFirstRender.current = false;
      return;
    }

    setCursorPosition({ x: newX, y: newY });
  }, [cursorPos, charObjects.length]);

  useLayoutEffect(() => {
    const oldText = prevValue.current;
    const newText = value;

    if (oldText === newText) return;

    const oldLen = oldText.length;
    const newLen = newText.length;

    // Compute prefix
    let p = 0;
    while (p < oldLen && p < newLen && oldText[p] === newText[p]) {
      p++;
    }

    // Compute suffix
    let s = 0;
    while (
      s < oldLen - p &&
      s < newLen - p &&
      oldText[oldLen - 1 - s] === newText[newLen - 1 - s]
    ) {
      s++;
    }

    const start = p;
    const end = newLen - s;

    // Generate new objects only for newly typed characters
    const added = newText
      .slice(start, end)
      .split("")
      .map((ch) => ({
        id: uid(),
        ch,
        animating: true,
      }));

    // Rebuild charObjects:
    //   [existing prefix] [new chars] [existing suffix]
    setCharObjects((prev) => {
      const prefix = prev
        .slice(0, start)
        .map((o) => ({ ...o, animating: false }));
      const suffix = prev
        .slice(prev.length - s)
        .map((o) => ({ ...o, animating: false }));
      return [...prefix, ...added, ...suffix];
    });

    prevValue.current = newText;
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCharObjects((prev) =>
        prev.map((obj) => ({ ...obj, animating: false }))
      );
    }, 10000);
    return () => clearTimeout(timer);
  }, [charObjects]);

  // Expose isTyping state to parent
  useEffect(() => {
    onTypingChange?.(isTyping);
  }, [isTyping, onTypingChange]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* REAL INPUT */}
      <textarea
        ref={textareaRef}
        className="absolute top-0 left-0 w-full h-full font-mono opacity-0 resize-none overflow-hidden"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCursorMove}
        onClick={handleCursorMove}
        placeholder={placeholder}
        autoFocus
      />

      {/* MIRROR DISPLAY */}
      <div className="relative pointer-events-none whitespace-pre-wrap font-mono text-white">
        {value.length === 0 && placeholder ? (
          <span className="text-muted-foreground italic opacity-60">
            {placeholder}
          </span>
        ) : (
          charObjects.map((c, i) => (
            <span
              key={c.id}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              className={c.animating ? "char" : ""}
            >
              {c.ch === "\n" ? <br /> : c.ch}
            </span>
          ))
        )}

        <div
          ref={cursorRef}
          className={`cursor absolute w-[4px] h-8 bg-primary cursor-slide ${
            !isTyping ? "cursor-blink" : ""
          }`}
          style={{
            transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`,
          }}
        />
      </div>
    </div>
  );
}

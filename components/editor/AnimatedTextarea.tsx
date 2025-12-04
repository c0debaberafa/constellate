"use client";

import {
  useRef,
  useState,
  useLayoutEffect,
  ChangeEvent,
  useEffect,
} from "react";

interface AnimatedTextareaProps {
  value: string;
  onChange: (v: string) => void;
  cursorPos: number;
  onCursorChange: (c: number) => void;
  placeholder?: string;
}

export default function AnimatedTextarea({
  value,
  onChange,
  cursorPos,
  onCursorChange,
  placeholder,
}: AnimatedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevValue = useRef("");
  const [charObjects, setCharObjects] = useState<
    { id: string; ch: string; animating: boolean }[]
  >([]);

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
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
  };

  const handleCursorMove = () => {
    const e = textareaRef.current;
    if (!e) return;
    onCursorChange(e.selectionStart);
  };

  useLayoutEffect(() => {
    charRefs.current.length = charObjects.length;
  }, [charObjects.length]);

  useLayoutEffect(() => {
    const cursorEl = cursorRef.current;

    if (!cursorEl) return;

    // Cursor at position 0 → special case
    if (cursorPos === 0) {
      cursorEl.style.left = "8px";
      cursorEl.style.top = "8px";
      return;
    }

    const target = charRefs.current[cursorPos - 1];
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement!.getBoundingClientRect();
    const paddingLeft = 0;
    const paddingTop = 2;
    cursorEl.style.left = `${
      rect.left - parentRect.left + rect.width + paddingLeft
    }px`;
    cursorEl.style.top = `${rect.top - parentRect.top + paddingTop}px`;
    console.log("cursorPos:", cursorPos);
    console.log("refs:", charRefs.current);
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
    }, 1000);
    return () => clearTimeout(timer);
  }, [charObjects]);

  return (
    <div className="relative w-full">
      {/* REAL INPUT */}
      <textarea
        ref={textareaRef}
        className="absolute top-0 left-0 w-full h-full font-mono opacity-0 resize-none overflow-hidden"
        value={value}
        onChange={handleChange}
        onKeyUp={handleCursorMove}
        onClick={handleCursorMove}
        placeholder={placeholder}
        autoFocus
      />

      {/* MIRROR DISPLAY */}
      <div className="relative p-2 pointer-events-none whitespace-pre-wrap font-mono text-white">
        {charObjects.map((c, i) => (
          <span
            key={c.id}
            ref={(el) => {
              charRefs.current[i] = el;
            }}
            className={c.animating ? "char" : ""}
          >
            {c.ch === "\n" ? <br /> : c.ch}
          </span>
        ))}

        <div
          ref={cursorRef}
          className="cursor absolute w-[2px] h-4 bg-primary"
        />
      </div>
    </div>
  );
}

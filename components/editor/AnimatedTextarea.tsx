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
  const [newIndices, setNewIndices] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevValue = useRef("");
  const [charObjects, setCharObjects] = useState<{ id: string; ch: string }[]>(
    []
  );

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const uid = () => Math.random().toString(36).slice(2);

  // Initialize charObjects on first render or if value changes programmatically
  useEffect(() => {
    setCharObjects(value.split("").map((ch) => ({ id: uid(), ch })));
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
      const first = charRefs.current[0];
      if (first) {
        const rect = first.getBoundingClientRect();
        const parentRect = first.parentElement!.getBoundingClientRect();
        cursorEl.style.left = "0px";
        cursorEl.style.top = "0px";
      }
      return;
    }

    const target = charRefs.current[cursorPos - 1];
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement!.getBoundingClientRect();

    cursorEl.style.left = `${rect.right - parentRect.left}px`;
    cursorEl.style.top = `${rect.top - parentRect.top + 8}px`;
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
      .map((ch) => ({ id: uid(), ch }));

    // Rebuild charObjects:
    //   [existing prefix] [new chars] [existing suffix]
    setCharObjects((prev) => {
      const prefix = prev.slice(0, start);
      const suffix = prev.slice(prev.length - s);
      return [...prefix, ...added, ...suffix];
    });

    // Track which indices should animate
    const newIndices = Array.from({ length: end - start }, (_, i) => start + i);
    setNewIndices(newIndices);

    // Remove animation flags after fade-in
    const timeout = setTimeout(() => setNewIndices([]), 300);

    prevValue.current = newText;
    return () => clearTimeout(timeout);
  }, [value]);

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
            className={newIndices.includes(i) ? "char" : ""}
          >
            {c.ch === "\n" ? <br /> : c.ch}

            {/* Cursor */}
            {cursorPos === i + 1 && (
              <span
                ref={cursorRef}
                className="cursor inline-block w-[2px] h-4 bg-white ml-0.5"
              />
            )}
          </span>
        ))}

        {cursorPos === 0 && (
          <span
            ref={cursorRef}
            className="cursor inline-block w-[2px] h-4 bg-white absolute top-0 left-0"
          />
        )}
      </div>
    </div>
  );
}

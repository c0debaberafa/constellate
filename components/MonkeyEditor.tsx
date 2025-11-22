"use client";

import { useState, useRef, useEffect } from "react";

export default function MonkeyEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const lastNode = editor.lastChild;
    if (!lastNode || !(lastNode instanceof Text)) return;

    const text = lastNode.textContent || "";
    if (text.length === 0) return;

    const before = text.slice(0, -1);
    const lastChar = text.slice(-1);

    const span = document.createElement("span");
    span.textContent = lastChar;
    span.classList.add("fade-char");

    const parent = lastNode.parentNode!;
    parent.removeChild(lastNode);

    if (before) parent.append(before);
    parent.append(span);

    placeCaretAtEnd(editor);
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  useEffect(() => {
    editorRef.current?.focus();
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable
      className="min-h-[200px] p-4 rounded font-mono"
      onInput={handleInput}
    ></div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

interface TypingContextType {
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  isMouseMoving: boolean;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export function TypingProvider({ children }: { children: ReactNode }) {
  const [isTyping, setIsTyping] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseMoving(true);

      // Clear existing timeout
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }

      // Set isMouseMoving to false after 2 seconds of no mouse movement
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TypingContext.Provider value={{ isTyping, setIsTyping, isMouseMoving }}>
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping() {
  const context = useContext(TypingContext);
  if (context === undefined) {
    return { isTyping: false, setIsTyping: () => {}, isMouseMoving: false };
  }
  return context;
}

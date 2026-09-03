"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { MoreVertical } from "lucide-react";

interface DropdownProps {
  children: ReactNode;
}

export default function Dropdown({
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect =
        buttonRef.current.getBoundingClientRect();

      const dropdownWidth = 192;
      const dropdownHeight = 220;

      const spaceBelow =
        window.innerHeight - rect.bottom;

      const shouldOpenUp =
        spaceBelow < dropdownHeight;

      setOpenUp(shouldOpenUp);

      setPosition({
        top: shouldOpenUp
          ? rect.top - dropdownHeight - 8
          : rect.bottom + 8,

        left:
          rect.right - dropdownWidth,
      });
    }

    setOpen(!open);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        ) &&
        buttonRef.current &&
        !buttonRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  useEffect(() => {
    function handleScrollOrResize() {
      setOpen(false);
    }

    window.addEventListener(
      "resize",
      handleScrollOrResize
    );

    window.addEventListener(
      "scroll",
      handleScrollOrResize,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleScrollOrResize
      );

      window.removeEventListener(
        "scroll",
        handleScrollOrResize,
        true
      );
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <MoreVertical className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
          }}
          className="
            z-[9999]
            w-48
            overflow-hidden
            rounded-2xl
            border
            border-zinc-200
            bg-white
            shadow-lg
            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          {children}
        </div>
      )}
    </>
  );
}
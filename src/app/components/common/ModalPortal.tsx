import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}

export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const body = document.body;
    const lockCount = Number(body.dataset.modalLockCount || "0");

    if (lockCount === 0) {
      const scrollY = window.scrollY;
      body.dataset.modalScrollY = String(scrollY);
      root.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    }

    body.dataset.modalLockCount = String(lockCount + 1);

    const updateKeyboardInset = () => {
      const vv = window.visualViewport;
      if (!vv) {
        root.style.setProperty("--keyboard-inset", "0px");
        return;
      }

      const keyboardInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
    };

    updateKeyboardInset();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateKeyboardInset);
    viewport?.addEventListener("scroll", updateKeyboardInset);

    return () => {
      viewport?.removeEventListener("resize", updateKeyboardInset);
      viewport?.removeEventListener("scroll", updateKeyboardInset);

      const root = document.documentElement;
      const body = document.body;
      const currentCount = Number(body.dataset.modalLockCount || "0");
      const nextCount = Math.max(currentCount - 1, 0);
      if (nextCount === 0) {
        const savedY = Number(body.dataset.modalScrollY || "0");
        root.style.removeProperty("overflow");
        root.style.setProperty("--keyboard-inset", "0px");
        body.style.removeProperty("position");
        body.style.removeProperty("top");
        body.style.removeProperty("left");
        body.style.removeProperty("right");
        body.style.removeProperty("width");
        body.style.removeProperty("overflow");
        body.style.removeProperty("touch-action");
        delete body.dataset.modalScrollY;
        delete body.dataset.modalLockCount;
        window.scrollTo(0, savedY);
        return;
      }

      if (nextCount > 0) {
        body.dataset.modalLockCount = String(nextCount);
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

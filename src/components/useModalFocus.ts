import { useEffect, useRef } from "react";

export function useModalFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]';
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(e => e.getClientRects().length);
    dialog.tabIndex = -1;
    (focusable()[0] || dialog).focus();
    const siblings: { element: HTMLElement; inert: boolean }[] = [];
    let child: HTMLElement = dialog;
    while (child.parentElement && child !== document.body) {
      for (const sibling of Array.from(child.parentElement.children)) {
        if (sibling !== child && sibling instanceof HTMLElement) { siblings.push({ element: sibling, inert: sibling.inert }); sibling.inert = true; }
      }
      child = child.parentElement;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key === "Tab") {
        const items = focusable(); const first = items[0]; const last = items.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); siblings.forEach(({ element, inert }) => element.inert = inert); if (previous?.isConnected) previous.focus(); };
  }, [open]);
  return ref;
}

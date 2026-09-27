interface NativePort {
  postMessage(message: string): void;
  onmessage: ((event: { data: string }) => void) | null;
}
declare global {
  interface Window {
    TruecNative?: NativePort;
    __truecBack?: () => boolean;
  }
}
export const isNativeApp = () => Boolean(window.TruecNative);
let sequence = 0;
const pending = new Map<number, { resolve: (value: Response) => void; reject: (reason: Error) => void; timer: ReturnType<typeof setTimeout> }>();

export function nativeRequest(path: string, method = "GET", body?: unknown, token = ""): Promise<Response> {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    // First use seeds Room and derives password hashes on older Android devices.
    const timer = setTimeout(() => { pending.delete(id); reject(new Error("La operación tardó demasiado. Consulta su estado antes de reintentar.")); }, 60000);
    pending.set(id, { resolve, reject, timer });
    try { window.TruecNative!.postMessage(JSON.stringify({ id, path, method, body, token })); }
    catch { clearTimeout(timer); pending.delete(id); reject(new Error("No se pudo comunicar con el almacenamiento Android.")); }
  });
}

export function initializeNativeBridge() {
  if (!window.TruecNative) return;
  document.documentElement.classList.add("native-app");
  window.TruecNative.onmessage = (event) => {
    const result = JSON.parse(event.data) as { id: number; status: number; body: unknown };
    const request = pending.get(result.id);
    if (!request) return;
    clearTimeout(request.timer); pending.delete(result.id);
    request.resolve(new Response(JSON.stringify(result.body), { status: result.status, headers: { "Content-Type": "application/json" } }));
  };
  const browserFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return browserFetch(input, options);
    const headers = new Headers(options?.headers);
    return nativeRequest(url.pathname + url.search, options?.method ?? "GET",
      typeof options?.body === "string" ? JSON.parse(options.body) : undefined,
      (headers.get("Authorization") ?? "").replace(/^Bearer /, ""));
  };
}

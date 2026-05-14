import type { WSMessage } from "@/types";

const BASE_WS = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") ?? "ws://localhost:8000";

export class WSManager {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, ((payload: Record<string, unknown>) => void)[]>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          const fns = this.handlers.get(msg.type) ?? [];
          fns.forEach((fn) => fn(msg.payload));
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };
    });
  }

  on(type: string, fn: (payload: Record<string, unknown>) => void) {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, [...existing, fn]);
    return () => {
      const updated = (this.handlers.get(type) ?? []).filter((f) => f !== fn);
      this.handlers.set(type, updated);
    };
  }

  send(type: string, payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export function createTutorWS(sessionId: string) {
  return new WSManager(`${BASE_WS}/api/v1/ws/tutor/${sessionId}`);
}

export function createSpeechWS(sessionId: string) {
  return new WSManager(`${BASE_WS}/api/v1/ws/speech/${sessionId}`);
}

export function createSentimentWS(sessionId: string) {
  return new WSManager(`${BASE_WS}/api/v1/ws/sentiment/${sessionId}`);
}

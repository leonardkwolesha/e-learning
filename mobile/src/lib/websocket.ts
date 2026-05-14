const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

type MessageHandler = (data: unknown) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = () => void;

export class TutorWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private onMessage: MessageHandler;
  private onError?: ErrorHandler;
  private onClose?: CloseHandler;
  private reconnectAttempts = 0;
  private maxReconnects = 3;

  constructor(
    sessionId: string,
    token: string,
    onMessage: MessageHandler,
    onError?: ErrorHandler,
    onClose?: CloseHandler,
  ) {
    this.sessionId = sessionId;
    this.token = token;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
  }

  connect(): void {
    const url = `${WS_URL}/api/v1/ws/tutor/${this.sessionId}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch {
        this.onMessage({ type: 'text', payload: { content: event.data } });
      }
    };

    this.ws.onerror = (error: Event) => {
      this.onError?.(error);
    };

    this.ws.onclose = () => {
      this.onClose?.();
      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    };
  }

  send(message: string, chapterId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'message',
          payload: { message, chapter_id: chapterId },
        }),
      );
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnects;
    this.ws?.close();
    this.ws = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

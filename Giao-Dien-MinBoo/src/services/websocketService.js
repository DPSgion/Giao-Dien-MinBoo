// ============================================================
// WEBSOCKET SERVICE - Real-time chat & notifications
// [API 10] wss://www.minboo-be.io.vn/ws?token=<access_token>
// Backend Java: WebSocketConfig.java, ChatWebSocketHandler.java
// ============================================================

const WS_URL = "wss://www.minboo-be.io.vn/ws";

class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = {};
        this.reconnectTimer = null;
        this.isConnected = false;
    }

    // Kết nối WebSocket với access_token
    connect(token) {
        if (this.ws?.readyState === WebSocket.OPEN) return;
        this.ws = new WebSocket(`${WS_URL}?token=${token}`);

        this.ws.onopen = () => {
            console.log("[WS] Connected");
            this.isConnected = true;
            clearTimeout(this.reconnectTimer);
        };

        this.ws.onmessage = (event) => {
            try {
                const { event: eventName, data } = JSON.parse(event.data);
                if (this.listeners[eventName]) {
                    this.listeners[eventName].forEach((cb) => cb(data));
                }
            } catch (e) {
                console.error("[WS] Parse error:", e);
            }
        };

        this.ws.onclose = () => {
            console.log("[WS] Disconnected - reconnecting in 3s...");
            this.isConnected = false;
            this.reconnectTimer = setTimeout(() => {
                const t = localStorage.getItem("access_token");
                if (t) this.connect(t);
            }, 3000);
        };

        this.ws.onerror = (err) => console.error("[WS] Error:", err);
    }

    disconnect() {
        clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
        this.isConnected = false;
    }

    // Đăng ký lắng nghe event từ server
    on(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback);
    }

    // Hủy đăng ký
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName] = this.listeners[eventName].filter(
            (cb) => cb !== callback
        );
    }

    // Gửi event lên server
    emit(eventName, payload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ event: eventName, data: payload }));
        }
    }

    // [WS Client -> Server] send_message - Gửi tin nhắn mới
    // Backend Java: ChatHandler sẽ broadcast new_message tới người nhận
    sendMessage(conversationId, content, url_img = null) {
        this.emit("send_message", { conversation_id: conversationId, content, url_img });
    }

    // [WS Client -> Server] typing - Đang gõ tin nhắn
    typing(conversationId) {
        this.emit("typing", { conversation_id: conversationId });
    }

    // [WS Client -> Server] stop_typing - Ngừng gõ
    stopTyping(conversationId) {
        this.emit("stop_typing", { conversation_id: conversationId });
    }

    // [WS Client -> Server] mark_seen - Đánh dấu đã xem
    // Backend Java: update seen_by và reset unread_count
    markSeen(conversationId) {
        this.emit("mark_seen", { conversation_id: conversationId });
    }
}

export default new WebSocketService();

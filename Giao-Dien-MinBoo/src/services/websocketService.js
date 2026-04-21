import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = {};
    this.isConnected = false;
    this.userId = null;
    this.subscriptions = {};
  }

  connect(userId, token) {
    // Nếu đã kết nối với cùng userId thì không làm gì
    if (this.isConnected && this.userId === userId) return;
    if (!userId || !token) {
      console.error('WebSocket: Thiếu userId hoặc token');
      return;
    }

    this.userId = userId;

    this.client = new Client({
      webSocketFactory: () => new SockJS('https://www.minboo-be.io.vn/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this._subscribeToUserTopics(userId);
        this._emit('connected', null);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this._emit('disconnected', null);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
    });

    this.client.activate();
  }

  _subscribeToUserTopics(userId) {
    // Hủy subscription cũ nếu có
    if (this.subscriptions.messages) {
      this.subscriptions.messages.unsubscribe();
    }

    // Subscribe nhận tin nhắn mới
    this.subscriptions.messages = this.client.subscribe(
      `/topic/messages/${userId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('[WS] Received message from server:', data);
          this._emit('new_message', data);
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      }
    );

    // Subscribe typing indicator (nếu cần)
    if (this.subscriptions.typing) {
      this.subscriptions.typing.unsubscribe();
    }
    this.subscriptions.typing = this.client.subscribe(
      `/topic/typing/${userId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.isTyping) {
            this._emit('user_typing', data);
          } else {
            this._emit('user_stop_typing', data);
          }
        } catch (e) {
          console.error('Error parsing typing:', e);
        }
      }
    );
  }

  sendMessage(conversationId, content) {
    if (!this.isConnected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        conversation_id: conversationId,
        content: content,
      }),
    });
  }

  markSeen(conversationId) {
    if (!this.isConnected || !this.client) return;
    this.client.publish({
      destination: '/app/chat.markSeen',
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  }

  typing(conversationId) {
    if (!this.isConnected || !this.client) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  }

  stopTyping(conversationId) {
    if (!this.isConnected || !this.client) return;
    this.client.publish({
      destination: '/app/chat.stopTyping',
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(
      (cb) => cb !== callback
    );
  }

  _emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((cb) => cb(data));
    }
  }

  disconnect() {
    if (this.subscriptions.messages) {
      this.subscriptions.messages.unsubscribe();
    }
    if (this.subscriptions.typing) {
      this.subscriptions.typing.unsubscribe();
    }
    if (this.client) {
      this.client.deactivate();
    }
    this.isConnected = false;
    this.userId = null;
    this.subscriptions = {};
  }
}

const service = new WebSocketService();
export default service;
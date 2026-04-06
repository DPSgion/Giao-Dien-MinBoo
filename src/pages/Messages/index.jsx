import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { messageService } from "../../services/apiServices";
import websocketService from "../../services/websocketService";

export default function Messages() {
  const { conversationId: paramConvId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    fetchConversations();
    setupWebSocket();
    return () => teardownWebSocket();
  }, []);

  useEffect(() => {
    if (paramConvId) {
      const conv = conversations.find((c) => c.conversation_id === paramConvId);
      if (conv) openConversation(conv);
    }
  }, [paramConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================================
  // [API 9.1] GET /conversations - Danh sách cuộc hội thoại
  // Backend Java: MessageController.getConversations()
  // ============================================================
  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
      setConversations(res.data.conversations || []);
    } catch (_) {}
  };

  // WebSocket event handlers
  const setupWebSocket = () => {
    // [WS Server -> Client] new_message - Nhận tin nhắn mới realtime
    websocketService.on("new_message", handleNewMessage);
    // [WS Server -> Client] user_typing - Đối phương đang gõ
    websocketService.on("user_typing", handleTyping);
    // [WS Server -> Client] user_stop_typing - Đối phương ngừng gõ
    websocketService.on("user_stop_typing", handleStopTyping);
    // [WS Server -> Client] message_seen - Đối phương đã xem
    websocketService.on("message_seen", () => {});
  };

  const teardownWebSocket = () => {
    websocketService.off("new_message", handleNewMessage);
    websocketService.off("user_typing", handleTyping);
    websocketService.off("user_stop_typing", handleStopTyping);
  };

  const handleNewMessage = (data) => {
    if (data.conversation_id === activeConv?.conversation_id) {
      setMessages((prev) => [...prev, data]);
    }
    // Cập nhật last_message trong danh sách
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === data.conversation_id
          ? { ...c, last_message: data.content, unread_count: c.unread_count + 1 }
          : c
      )
    );
  };

  const handleTyping = (data) => {
    if (data.conversation_id === activeConv?.conversation_id) setIsPartnerTyping(true);
  };

  const handleStopTyping = (data) => {
    if (data.conversation_id === activeConv?.conversation_id) setIsPartnerTyping(false);
  };

  // ============================================================
  // [API 9.2] GET /conversations/{id}/messages - Lịch sử tin nhắn
  // Backend Java: MessageController.getMessages()
  // ============================================================
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setLoading(true);
    try {
      const res = await messageService.getMessages(conv.conversation_id);
      setMessages(res.data.messages || []);
      // [API 9.4] Đánh dấu đã xem
      await messageService.markSeen(conv.conversation_id);
      // [WS] mark_seen qua WebSocket
      websocketService.markSeen(conv.conversation_id);
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === conv.conversation_id ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  // ============================================================
  // [API 9.3] POST /conversations/{id}/messages (REST fallback)
  // Ưu tiên gửi qua WebSocket: websocketService.sendMessage()
  // Backend Java: MessageController.sendMessage()
  // ============================================================
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMsg.trim() && !imgFile) return;
    if (!activeConv) return;

    try {
      if (imgFile) {
        // REST fallback khi có file đính kèm
        const formData = new FormData();
        if (newMsg.trim()) formData.append("content", newMsg);
        formData.append("url_img", imgFile);
        const res = await messageService.sendMessage(activeConv.conversation_id, formData);
        setMessages((prev) => [...prev, res.data]);
        setImgFile(null);
      } else {
        // Gửi qua WebSocket (ưu tiên)
        websocketService.sendMessage(activeConv.conversation_id, newMsg);
        // Optimistic update UI
        setMessages((prev) => [...prev, {
          message_id: Date.now().toString(),
          content: newMsg,
          created_at: new Date().toISOString(),
          sender: { user_id: me.user_id, name: me.name, url_avt: me.url_avt },
        }]);
      }
      setNewMsg("");
      // [WS] Báo ngừng gõ
      websocketService.stopTyping(activeConv.conversation_id);
    } catch (_) {}
  };

  // Xử lý typing indicator
  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    if (!activeConv) return;
    // [WS] typing event
    websocketService.typing(activeConv.conversation_id);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      // [WS] stop_typing sau 2s ngừng gõ
      websocketService.stopTyping(activeConv.conversation_id);
    }, 2000);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen border-l border-gray-200">
      {/* Conversation list */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base">{me?.username}</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Chưa có tin nhắn nào</div>
          )}
          {conversations.map((conv) => (
            <button key={conv.conversation_id}
              onClick={() => openConversation(conv)}
              className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${
                activeConv?.conversation_id === conv.conversation_id ? "bg-gray-50" : ""
              }`}>
              <div className="relative">
                <img
                  src={conv.partner?.url_avt || `https://ui-avatars.com/api/?name=${conv.partner?.name}&background=random`}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={conv.partner?.name}
                />
                {conv.partner?.is_online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-semibold" : "font-normal"}`}>
                  {conv.partner?.name}
                </p>
                <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                  {conv.last_message || "Bắt đầu cuộc trò chuyện"}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <img
              src={activeConv.partner?.url_avt || `https://ui-avatars.com/api/?name=${activeConv.partner?.name}&background=random`}
              className="w-9 h-9 rounded-full object-cover"
              alt={activeConv.partner?.name}
            />
            <div>
              <p className="font-semibold text-sm">{activeConv.partner?.name}</p>
              <p className="text-xs text-gray-400">
                {activeConv.partner?.is_online ? "Đang hoạt động" : "Offline"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.sender?.user_id === me?.user_id;
              return (
                <div key={msg.message_id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                  {!isMine && (
                    <img
                      src={msg.sender?.url_avt || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=random`}
                      className="w-7 h-7 rounded-full object-cover self-end flex-shrink-0"
                      alt={msg.sender?.name}
                    />
                  )}
                  <div className={`max-w-xs ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                    {msg.url_img && (
                      <img src={msg.url_img} className="rounded-xl max-w-48 mb-1 cursor-pointer hover:opacity-90" alt="" />
                    )}
                    {msg.content && (
                      <div className={`px-4 py-2 rounded-3xl text-sm ${
                        isMine
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    )}
                    <span className="text-xs text-gray-400 mt-1">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isPartnerTyping && (
              <div className="flex gap-2">
                <img
                  src={activeConv.partner?.url_avt || `https://ui-avatars.com/api/?name=${activeConv.partner?.name}&background=random`}
                  className="w-7 h-7 rounded-full object-cover self-end"
                  alt=""
                />
                <div className="bg-gray-100 rounded-3xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {imgFile && (
            <div className="px-6 py-2 flex items-center gap-2">
              <img src={URL.createObjectURL(imgFile)} className="h-16 rounded-lg object-cover" alt="" />
              <button onClick={() => setImgFile(null)} className="text-red-500 text-xs">Xóa</button>
            </div>
          )}

          {/* Message input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-4 border-t border-gray-100">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="text-blue-500 hover:opacity-70 transition-opacity flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => setImgFile(e.target.files[0])} />
            <input
              value={newMsg}
              onChange={handleInputChange}
              placeholder="Tin nhắn..."
              className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 text-sm outline-none"
            />
            {(newMsg.trim() || imgFile) && (
              <button type="submit" className="text-blue-500 font-semibold text-sm hover:opacity-70 flex-shrink-0">
                Gửi
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </div>
          <h3 className="text-xl font-light mb-2">Tin nhắn của bạn</h3>
          <p className="text-gray-500 text-sm mb-4">Gửi ảnh và tin nhắn riêng tư cho bạn bè</p>
        </div>
      )}
    </div>
  );
}

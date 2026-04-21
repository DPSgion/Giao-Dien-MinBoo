import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/apiServices';
import websocketService from '../../services/websocketService';
import SecureImage from '../../components/common/SecureImage'; // Component tải ảnh có token

export default function Messages() {
  const { conversationId: paramConvId } = useParams();
  const { user: me } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);
  const lastOpenedParamRef = useRef(null); // Ngăn mở lại conversation do re-render

  // ============================================================
  // 1. Kết nối WebSocket & fetch conversations ban đầu
  // ============================================================
  useEffect(() => {
    if (me?.user_id) {
      const token = localStorage.getItem('access_token');
      if (token) {
        websocketService.connect(me.user_id, token);
      }
      fetchConversations();
    }

    setupWebSocket();
    return () => teardownWebSocket();
  }, [me?.user_id]);

  // ============================================================
  // 2. Xử lý mở conversation từ URL param (chỉ một lần)
  // ============================================================
  useEffect(() => {
    if (!paramConvId) {
      lastOpenedParamRef.current = null;
      return;
    }

    // Đã mở đúng conversation này rồi thì bỏ qua
    if (lastOpenedParamRef.current === paramConvId) return;

    const conv = conversations.find((c) => c.conversation_id === paramConvId);
    if (conv && activeConv?.conversation_id !== paramConvId) {
      lastOpenedParamRef.current = paramConvId;
      openConversation(conv);
    }
  }, [paramConvId, conversations, activeConv]);

  // ============================================================
  // 3. Auto scroll xuống cuối khi có tin nhắn mới
  // ============================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================
  // API: Lấy danh sách cuộc hội thoại
  // ============================================================
  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
      console.log('[DEBUG] getConversations raw response:', res);

      let conversations = [];
      if (Array.isArray(res)) {
        conversations = res;
      } else if (res && Array.isArray(res.data)) {
        conversations = res.data;
      } else if (res && Array.isArray(res.conversations)) {
        conversations = res.conversations;
      } else if (res?.data && Array.isArray(res.data.conversations)) {
        conversations = res.data.conversations;
      } else {
        console.warn('Unexpected conversations format:', res);
      }

      console.log('[DEBUG] Parsed conversations:', conversations);
      setConversations(conversations);
    } catch (error) {
      console.error('Lỗi khi tải trò chuyện:', error);
    }
  };

  // ============================================================
  // WebSocket listeners
  // ============================================================
  const setupWebSocket = () => {
    websocketService.on('new_message', handleNewMessage);
    websocketService.on('user_typing', handleTyping);
    websocketService.on('user_stop_typing', handleStopTyping);
    websocketService.on('message_seen', () => {});
  };

  const teardownWebSocket = () => {
    websocketService.off('new_message', handleNewMessage);
    websocketService.off('user_typing', handleTyping);
    websocketService.off('user_stop_typing', handleStopTyping);
  };

  const handleNewMessage = (data) => {
    console.log('[WS] new_message received:', data);
    if (data.conversation_id === activeConv?.conversation_id) {
      setMessages((prev) => [
        ...prev,
        {
          message_id: data.message_id,
          content: data.content,
          url_img: data.url_img,
          created_at: data.created_at,
          sender: data.sender,
        },
      ]);
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === data.conversation_id
          ? {
              ...c,
              last_message: data.content || (data.url_img ? '[Hình ảnh]' : ''),
              unread_count:
                data.sender?.user_id === me?.user_id
                  ? 0
                  : (c.unread_count || 0) + 1,
            }
          : c
      )
    );
  };

  const handleTyping = (data) => {
    if (data.conversation_id === activeConv?.conversation_id) {
      setIsPartnerTyping(true);
    }
  };

  const handleStopTyping = (data) => {
    if (data.conversation_id === activeConv?.conversation_id) {
      setIsPartnerTyping(false);
    }
  };

  // ============================================================
  // Mở cuộc trò chuyện, tải tin nhắn
  // ============================================================
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setLoading(true);
    try {
      const res = await messageService.getMessages(conv.conversation_id);
      let msgs = Array.isArray(res)
        ? res
        : res?.data?.messages || res?.messages || res?.data || [];

      // Sắp xếp tăng dần theo thời gian
      msgs = msgs.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setMessages(msgs);
      await messageService.markSeen(conv.conversation_id);
      websocketService.markSeen(conv.conversation_id);
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === conv.conversation_id
            ? { ...c, unread_count: 0 }
            : c
        )
      );
    } catch (error_) {
      console.error('Lỗi khi mở cuộc trò chuyện:', error_);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Gửi tin nhắn (text + ảnh)
  // ============================================================
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMsg.trim() && !imgFile) return;
    if (!activeConv) return;

    const tempMessageId = `temp_${Date.now()}`;
    const optimisticMessage = {
      message_id: tempMessageId,
      content: newMsg,
      url_img: imgFile ? URL.createObjectURL(imgFile) : null,
      created_at: new Date().toISOString(),
      sender: {
        user_id: me?.user_id,
        name: me?.name || me?.username || 'Tôi',
        url_avt: me?.url_avt,
      },
      isPending: true,
    };

    try {
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMsg('');

      const formData = new FormData();
      if (newMsg.trim()) formData.append('content', newMsg);
      if (imgFile) formData.append('url_img', imgFile);
      console.log('Sending message with file:', imgFile?.name, imgFile?.size);

      const res = await messageService.sendMessage(
        activeConv.conversation_id,
        formData
      );

      let newMessage = res?.data || res;
      // Fallback nếu server không trả created_at
      if (!newMessage.created_at) {
        newMessage.created_at = optimisticMessage.created_at;
      }

      if (newMessage?.message_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === tempMessageId
              ? { ...newMessage, isPending: false }
              : msg
          )
        );
      }

      setImgFile(null);
    } catch (error_) {
      console.error('Lỗi khi gửi tin nhắn:', error_);
      const errorMsg =
        error_?.response?.data?.message ||
        error_?.message ||
        'Gửi ảnh thất bại';
      alert(errorMsg);
      setMessages((prev) =>
        prev.filter((msg) => msg.message_id !== tempMessageId)
      );
    } finally {
      websocketService.stopTyping(activeConv.conversation_id);
    }
  };

  // ============================================================
  // Typing indicator
  // ============================================================
  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    if (!activeConv) return;
    websocketService.typing(activeConv.conversation_id);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      websocketService.stopTyping(activeConv.conversation_id);
    }, 2000);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hàm lấy thông tin partner (tùy chỉnh theo cấu trúc backend)
  const getPartnerInfo = (conv) => {
    if (conv.partner) return conv.partner;
    if (conv.other_user) return conv.other_user;
    return { name: 'Người dùng', username: 'user', url_avt: null };
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="flex h-full w-full border-l border-gray-200">
      {/* ========== CỘT TRÁI: DANH SÁCH CHAT (có scroll riêng) ========== */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base">{me?.username}</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Chưa có tin nhắn nào
            </div>
          )}
          {conversations.map((conv) => {
            const partner = getPartnerInfo(conv);
            return (
              <button
                key={conv.conversation_id}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${
                  activeConv?.conversation_id === conv.conversation_id
                    ? 'bg-gray-50'
                    : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={
                      partner.url_avt ||
                      `https://ui-avatars.com/api/?name=${partner.name || partner.username || 'U'}&background=random`
                    }
                    className="w-12 h-12 rounded-full object-cover"
                    alt={partner.name}
                  />
                  {partner.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p
                    className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold' : 'font-normal'}`}
                  >
                    {partner.name || partner.username || 'Người dùng'}
                  </p>
                  <p
                    className={`text-xs truncate ${conv.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}
                  >
                    {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== CỘT PHẢI: KHU VỰC CHAT (có scroll riêng) ========== */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <img
              src={
                getPartnerInfo(activeConv).url_avt ||
                `https://ui-avatars.com/api/?name=${getPartnerInfo(activeConv).name || getPartnerInfo(activeConv).username || 'U'}&background=random`
              }
              className="w-9 h-9 rounded-full object-cover"
              alt={getPartnerInfo(activeConv).name}
            />
            <div>
              <p className="font-semibold text-sm">
                {getPartnerInfo(activeConv).name ||
                  getPartnerInfo(activeConv).username ||
                  'Người dùng'}
              </p>
              <p className="text-xs text-gray-400">
                {getPartnerInfo(activeConv).is_online
                  ? 'Đang hoạt động'
                  : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages (scroll) */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 min-h-0">
            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.sender?.user_id === me?.user_id;
              const isPending = msg.isPending === true;
              return (
                <div
                  key={msg.message_id}
                  className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} ${isPending ? 'opacity-70' : ''}`}
                >
                  {!isMine && (
                    <img
                      src={
                        msg.sender?.url_avt ||
                        `https://ui-avatars.com/api/?name=${msg.sender?.name || msg.sender?.username || 'U'}&background=random`
                      }
                      className="w-7 h-7 rounded-full object-cover self-end flex-shrink-0"
                      alt={msg.sender?.name}
                    />
                  )}
                  <div
                    className={`max-w-xs ${isMine ? 'items-end' : 'items-start'} flex flex-col`}
                  >
                    {msg.url_img && (
                      <SecureImage
                        src={msg.url_img}
                        alt=""
                        className={`rounded-xl max-w-48 mb-1 cursor-pointer hover:opacity-90 ${isPending ? 'opacity-60' : ''}`}
                      />
                    )}
                    {msg.content && (
                      <div
                        className={`px-4 py-2 rounded-3xl text-sm flex items-center gap-2 ${
                          isMine
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        } ${isPending ? 'opacity-60' : ''}`}
                      >
                        {msg.content}
                        {isPending && (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                      </div>
                    )}
                    <span
                      className={`text-xs mt-1 ${isPending ? 'text-gray-300' : 'text-gray-400'}`}
                    >
                      {isPending ? 'Đang gửi...' : formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}

            {isPartnerTyping && (
              <div className="flex gap-2">
                <img
                  src={
                    getPartnerInfo(activeConv).url_avt ||
                    `https://ui-avatars.com/api/?name=${getPartnerInfo(activeConv).name || getPartnerInfo(activeConv).username || 'U'}&background=random`
                  }
                  className="w-7 h-7 rounded-full object-cover self-end"
                  alt=""
                />
                <div className="bg-gray-100 rounded-3xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {imgFile && (
            <div className="px-6 py-2 flex items-center gap-2">
              <img
                src={URL.createObjectURL(imgFile)}
                className="h-16 rounded-lg object-cover"
                alt=""
              />
              <button
                onClick={() => setImgFile(null)}
                className="text-red-500 text-xs"
              >
                Xóa
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 px-4 py-4 border-t border-gray-100"
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-blue-500 hover:opacity-70 transition-opacity flex-shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImgFile(e.target.files[0])}
            />
            <input
              value={newMsg}
              onChange={handleInputChange}
              placeholder="Tin nhắn..."
              className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 text-sm outline-none"
            />
            {(newMsg.trim() || imgFile) && (
              <button
                type="submit"
                className="text-blue-500 font-semibold text-sm hover:opacity-70 flex-shrink-0"
              >
                Gửi
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <h3 className="text-xl font-light mb-2">Tin nhắn của bạn</h3>
          <p className="text-gray-500 text-sm mb-4">
            Gửi ảnh và tin nhắn riêng tư cho bạn bè
          </p>
        </div>
      )}
    </div>
  );
}

// SearchModal.jsx (mở rộng)
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  userService,
  friendService,
  messageService,
  postService,
  tagService,
} from '../../services/apiServices';

export default function SearchModal({ onClose }) {
  // ========== State chung ==========
  const [activeTab, setActiveTab] = useState('users'); // "users" hoặc "posts"
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // ========== State tìm kiếm user ==========
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearch') || '[]');
    } catch {
      return [];
    }
  });

  // ========== State tìm kiếm bài viết ==========
  const [postKeyword, setPostKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const debounceRef = useRef(null);

  // Focus input khi mở modal
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lấy danh sách tag khi chuyển sang tab bài viết
  useEffect(() => {
    if (activeTab === 'posts' && allTags.length === 0) {
      tagService
        .getAllTags()
        .then((res) => {
          const tags = res.data || res || [];
          setAllTags(tags);
        })
        .catch((err) => console.error('Lỗi lấy tag:', err));
    }
  }, [activeTab, allTags.length]);

  // Debounce tìm kiếm user
  useEffect(() => {
    if (activeTab !== 'users') return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchUsers(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeTab]);

  // Debounce tìm kiếm bài viết
  useEffect(() => {
    if (activeTab !== 'posts') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPosts(), 400);
    return () => clearTimeout(debounceRef.current);
  }, [postKeyword, selectedTags, activeTab]);

  // ==================== Tìm kiếm user ====================
  const searchUsers = async (q) => {
    setLoadingUsers(true);
    try {
      const res = await userService.searchUsers({ q, page: 1, limit: 20 });
      const payload = res.data || res;
      let userList = Array.isArray(payload)
        ? payload
        : payload.users || payload.content || [];
      const mappedUsers = userList.map((u) => ({
        ...u,
        user_id: u.user_id || u.id,
        url_avt: u.url_avt || u.avatar,
      }));
      setUserResults(mappedUsers);
    } catch (err) {
      console.error('Search Users Error:', err);
      alert(
        'Lỗi tìm kiếm người dùng: ' +
          (err?.response?.data?.message || err.message)
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const saveRecent = (user) => {
    const updated = [
      user,
      ...recent.filter((r) => r.user_id !== user.user_id),
    ].slice(0, 8);
    setRecent(updated);
    localStorage.setItem('recentSearch', JSON.stringify(updated));
  };

  const removeRecent = (userId) => {
    const updated = recent.filter((r) => r.user_id !== userId);
    setRecent(updated);
    localStorage.setItem('recentSearch', JSON.stringify(updated));
  };

  // ==================== Tìm kiếm bài viết ====================
  const searchPosts = async () => {
    let keyword = postKeyword.trim();
    let tagIds = [...selectedTags];

    // Nếu keyword bắt đầu bằng #, thử tìm tag theo tên
    if (keyword.startsWith('#')) {
      const tagName = keyword.slice(1); // bỏ dấu #
      const foundTag = allTags.find(
        (t) => t.tag_name.toLowerCase() === tagName.toLowerCase()
      );
      if (foundTag && !tagIds.includes(foundTag.tag_id)) {
        tagIds.push(foundTag.tag_id);
        setSelectedTags(tagIds); // cập nhật UI
        keyword = ''; // không gửi keyword nữa
        setPostKeyword(''); // xóa ô input
      }
    }

    if (!keyword && tagIds.length === 0) {
      setPostResults([]);
      return;
    }

    setLoadingPosts(true);
    try {
      const res = await postService.searchPosts(keyword, tagIds, 0, 20);
      const payload = res.data || res;
      const posts =
        payload.content ||
        payload.data ||
        (Array.isArray(payload) ? payload : []);
      setPostResults(posts);
    } catch (err) {
      console.error('Search Posts Error:', err);
      alert(
        'Lỗi tìm kiếm bài viết: ' +
          (err?.response?.data?.message || err.message)
      );
    } finally {
      setLoadingPosts(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // ==================== Xử lý hành động ====================
  const handleAddFriend = async (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await friendService.sendRequest(userId);
      setUserResults((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, is_friend: true } : u))
      );
    } catch (err) {
      console.error(err);
      alert('Lỗi gửi lời mời: ' + err?.response?.data?.message);
    }
  };

  const handleMessage = async (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await messageService.createConversation(userId);
      const convId =
        res.data?.data?.conversation_id ||
        res.data?.conversation_id ||
        res.data?.id;
      navigate(convId ? `/messages/${convId}` : `/messages`);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo cuộc trò chuyện');
    }
  };

  // ==================== Render ====================
  return (
    <div className="fixed left-20 top-0 h-full w-96 bg-white shadow-2xl z-30 flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Tìm kiếm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          >
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          >
            Bài viết
          </button>
        </div>

        {/* Input tìm kiếm */}
        {activeTab === 'users' && (
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm người dùng..."
              className="w-full bg-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path fill="white" d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            <input
              ref={inputRef}
              value={postKeyword}
              onChange={(e) => setPostKeyword(e.target.value)}
              placeholder="Từ khóa trong bài viết..."
              className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mb-3"
            />
            {/* Danh sách tag chọn */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                {allTags.map((tag) => (
                  <button
                    key={tag.tag_id || tag.id}
                    onClick={() => toggleTag(tag.tag_id || tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag.tag_id || tag.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag.tag_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kết quả */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab Người dùng */}
        {activeTab === 'users' && (
          <>
            <div className="px-6 mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">
                {query ? `Kết quả tìm kiếm` : 'Tìm kiếm gần đây'}
              </span>
              {!query && recent.length > 0 && (
                <button
                  onClick={() => {
                    setRecent([]);
                    localStorage.removeItem('recentSearch');
                  }}
                  className="text-xs text-blue-500 font-semibold hover:underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {loadingUsers && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {!loadingUsers && query && userResults.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Không tìm thấy người dùng
              </div>
            )}
            {!loadingUsers && !query && recent.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chưa có tìm kiếm gần đây
              </div>
            )}

            {!loadingUsers &&
              (query ? userResults : recent).map((user) => (
                <Link
                  key={user.user_id}
                  to={`/profile/${user.user_id}`}
                  onClick={() => {
                    saveRecent(user);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <img
                    src={
                      user.url_avt ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=random&size=80`
                    }
                    className="w-11 h-11 rounded-full object-cover"
                    alt={user.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user.username || user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleMessage(e, user.user_id)}
                      className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg"
                    >
                      Nhắn tin
                    </button>
                    {!user.is_friend && (
                      <button
                        onClick={(e) => handleAddFriend(e, user.user_id)}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-lg"
                      >
                        Theo dõi
                      </button>
                    )}
                    {!query && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeRecent(user.user_id);
                        }}
                        className="text-gray-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {user.is_friend && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Đã theo dõi
                    </span>
                  )}
                </Link>
              ))}
          </>
        )}

        {/* Tab Bài viết */}
        {activeTab === 'posts' && (
          <>
            <div className="px-6 mb-3">
              <span className="text-sm font-semibold text-gray-500">
                Kết quả bài viết
              </span>
            </div>
            {loadingPosts && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {!loadingPosts &&
              postResults.length === 0 &&
              (postKeyword.trim() || selectedTags.length > 0) && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Không tìm thấy bài viết
                </div>
              )}
            {!loadingPosts &&
              postResults.length === 0 &&
              !postKeyword.trim() &&
              selectedTags.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Nhập từ khóa hoặc chọn tag để tìm kiếm
                </div>
              )}
            {postResults.map((post) => (
              <div
                key={post.post_id || post.id}
                className="px-6 py-3 hover:bg-gray-50 border-b border-gray-100"
              >
                <Link
                  to={`/post/${post.post_id || post.id}`}
                  onClick={onClose}
                  className="block"
                >
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {post.title || 'Không có tiêu đề'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {post.content?.replace(/<[^>]*>/g, '')}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.tag_id}
                          className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded"
                        >
                          #{tag.tag_name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

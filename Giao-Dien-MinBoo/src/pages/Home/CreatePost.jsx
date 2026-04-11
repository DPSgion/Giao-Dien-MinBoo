import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postService, tagService } from "../../services/apiServices";

export default function CreatePost() {
    const navigate = useNavigate();
    const [step, setStep] = useState("select"); // select | edit | preview
    const [imgFile, setImgFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imgBase64, setImgBase64] = useState(null);
    const [content, setContent] = useState("");
    const [privacy, setPrivacy] = useState("public");
    const [tags, setTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        fetchTags();
    }, []);

    // ============================================================
    // [API 8.1] GET /tags - Lấy danh sách tất cả tags
    // Backend Java: TagController.getAllTags()
    // ============================================================
    const fetchTags = async () => {
        try {
            const res = await tagService.getAllTags();
            // Backend trả về mảng trực tiếp hoặc nằm trong res.content tuỳ phiên bản
            const fetchedTags = Array.isArray(res) ? res : (res?.content || res?.data?.tags || res?.data || []);
            setAllTags(fetchedTags);
        } catch (_) { }
    };

    const handleFileSelect = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        setImgFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImgBase64(reader.result);
        };
        reader.readAsDataURL(file);
        
        setStep("edit");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.find((t) => t.tag_id === tag.tag_id)
                ? prev.filter((t) => t.tag_id !== tag.tag_id)
                : [...prev, tag]
        );
    };

    // ============================================================
    // [API 5.3] POST /posts - Tạo bài viết mới
    // Backend Java: PostController.createPost()
    // Content-Type: multipart/form-data
    // Body: { content?, url_img (file)?, privacy, tag_ids[] }
    // ============================================================
    const handleSubmit = async () => {
        if (!content.trim() && !imgFile) return;
        setLoading(true);
        try {
            const formData = new FormData();
            if (content.trim()) formData.append("content", content);
            if (imgFile) formData.append("url_img", imgFile);
            formData.append("privacy", privacy);
            selectedTags.forEach((tag) => formData.append("tag_ids", tag.tag_id));

            await postService.createPost(formData);
            navigate("/");
        } catch (error) {
            console.error("Create post error:", error);
            const errorMsg = typeof error === 'string' ? error : (error.message || error.data?.message || JSON.stringify(error));
            alert("Đăng bài thất bại: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (step === "select") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <h2 className="font-semibold text-sm">Tạo bài viết mới</h2>
                        <div />
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center py-20 px-8 cursor-pointer transition-colors ${dragOver ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                        onClick={() => fileRef.current?.click()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                            className="w-16 h-16 text-gray-300 mb-4">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p className="font-medium text-lg mb-2">Kéo ảnh vào đây</p>
                        <p className="text-gray-400 text-sm mb-4">hoặc</p>
                        <button className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            Chọn từ máy tính
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files[0])} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden w-full max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <button onClick={() => setStep("select")}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                        Quay lại
                    </button>
                    <h2 className="font-semibold text-sm">Tạo bài viết mới</h2>
                    <button onClick={handleSubmit} disabled={loading || (!content.trim() && !imgFile)}
                        className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading ? "Đang đăng..." : "Chia sẻ"}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row">
                    {/* Image preview */}
                    {previewUrl && (
                        <div className="sm:w-96 sm:h-96 bg-black flex items-center justify-center flex-shrink-0">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                        </div>
                    )}

                    {/* Right panel */}
                    <div className="flex-1 flex flex-col p-4 space-y-4">
                        {/* Caption */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Viết chú thích..."
                            maxLength={2200}
                            rows={4}
                            className="w-full text-sm resize-none outline-none border-b border-gray-100 pb-2 placeholder-gray-400"
                        />
                        <div className="text-right text-xs text-gray-300">{content.length}/2200</div>

                        {/* Privacy */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-sm text-gray-600">Quyền riêng tư</span>
                            <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}
                                className="text-sm font-medium outline-none cursor-pointer">
                                <option value="public">Công khai</option>
                                <option value="friends">Bạn bè</option>
                                <option value="private">Chỉ mình tôi</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <p className="text-sm font-medium mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button key={tag.tag_id} onClick={() => toggleTag(tag)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedTags.find((t) => t.tag_id === tag.tag_id)
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                                            }`}>
                                        #{tag.tag_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

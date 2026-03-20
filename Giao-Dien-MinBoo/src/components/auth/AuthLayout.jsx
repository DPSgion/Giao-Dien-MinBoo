import { Bookmark, Heart, MessageCircle, Sparkles } from "lucide-react";

const stories = ["Min", "Boo", "Mood", "Crew"];
const feedItems = [
    {
        title: "Golden hour at MinBOO Studio",
        caption: "Mọi khoảnh khắc đều đáng nhớ khi bạn chia sẻ đúng nơi.",
        likes: "12.4k lượt thích",
        tone: "from-fuchsia-500 via-pink-500 to-orange-400",
    },
    {
        title: "Fresh drops & new vibes",
        caption: "Khám phá phong cách sống, bạn bè và câu chuyện mỗi ngày.",
        likes: "8.1k lượt thích",
        tone: "from-violet-500 via-purple-500 to-indigo-500",
    },
];

export default function AuthLayout({ title, subtitle, footer, children }) {
    return (
        <div className="auth-grid-bg relative isolate min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_28%)]" />

            <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_420px] lg:px-8">
                <section className="hidden items-center justify-end lg:flex">
                    <div className="relative w-full max-w-xl">
                        <div className="floating-card absolute -left-10 top-14 hidden rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl xl:block">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">Stories hot</p>
                            <div className="mt-4 flex items-center gap-3">
                                {stories.map((story) => (
                                    <div key={story} className="space-y-2 text-center">
                                        <div className="story-bubble h-16 w-16 rounded-full p-[2px]">
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                                                {story}
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-medium text-zinc-500">{story}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="phone-shell mx-auto w-[352px] rounded-[42px] p-[14px]">
                            <div className="overflow-hidden rounded-[30px] bg-[#09090b] px-5 pb-6 pt-5 text-white">
                                <div className="flex items-center justify-between">
                                    <span className="minboo-logo text-[2rem] leading-none">MinBOO</span>
                                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80">
                                        #stay social
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-3 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                                    {stories.map((story) => (
                                        <div key={story} className="min-w-0 flex-1 space-y-2 text-center">
                                            <div className="story-bubble mx-auto h-14 w-14 rounded-full p-[2px]">
                                                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                                                    {story[0]}
                                                </div>
                                            </div>
                                            <p className="truncate text-[11px] text-zinc-300">{story}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-4">
                                    {feedItems.map((item) => (
                                        <article
                                            key={item.title}
                                            className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
                                        >
                                            <div className={`h-48 bg-gradient-to-br ${item.tone}`} />

                                            <div className="space-y-4 p-4">
                                                <div className="flex items-center justify-between text-zinc-200">
                                                    <div>
                                                        <h3 className="text-sm font-semibold">{item.title}</h3>
                                                        <p className="mt-1 text-xs text-zinc-400">{item.caption}</p>
                                                    </div>
                                                    <Sparkles className="h-4 w-4 text-pink-300" />
                                                </div>

                                                <div className="flex items-center justify-between text-zinc-300">
                                                    <div className="flex items-center gap-4">
                                                        <Heart className="h-4 w-4" />
                                                        <MessageCircle className="h-4 w-4" />
                                                    </div>
                                                    <Bookmark className="h-4 w-4" />
                                                </div>

                                                <p className="text-xs font-medium text-white">{item.likes}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="floating-card absolute -right-8 bottom-16 hidden rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl xl:block">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">MinBOO vibe</p>
                            <div className="mt-3 space-y-3 text-sm text-zinc-600">
                                <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-white">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Community</p>
                                    <p className="mt-1 text-lg font-semibold">2.3M creatives</p>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-3 shadow-inner shadow-zinc-200">
                                    <p className="font-semibold text-zinc-900">Chia sẻ ảnh, reels và khoảnh khắc</p>
                                    <p className="mt-1 text-xs text-zinc-500">Thiết kế cảm hứng từ Instagram nhưng mang dấu ấn MinBOO.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full max-w-[420px] justify-self-center">
                    <div className="auth-card-glow rounded-[36px] border border-white/70 bg-white/85 p-1 backdrop-blur-xl">
                        <div className="rounded-[32px] border border-black/5 bg-white px-6 py-8 sm:px-10">
                            <div className="mb-8 text-center">
                                <p className="minboo-logo text-5xl leading-none text-zinc-900">MinBOO</p>
                                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-50 via-fuchsia-50 to-violet-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-pink-600">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Inspired by Instagram
                                </p>
                                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900">{title}</h1>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">{subtitle}</p>
                            </div>

                            {children}
                        </div>
                    </div>

                    <div className="mt-4 rounded-[26px] border border-white/70 bg-white/80 px-6 py-5 text-center text-sm text-zinc-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                        {footer}
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-5 text-xs font-medium text-zinc-400">
                        <span>Meta</span>
                        <span>Giới thiệu</span>
                        <span>Trợ giúp</span>
                        <span>Quyền riêng tư</span>
                    </div>
                </section>
            </div>
        </div>
    );
}

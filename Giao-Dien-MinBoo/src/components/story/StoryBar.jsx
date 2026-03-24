import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { friendService } from "../../services/apiServices";

export default function StoryBar() {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        // [API 4.1] GET /users/{user_id}/friends - Lấy bạn bè để hiển thị stories
        // Backend Java: FriendController.getFriends()
        const fetchFriends = async () => {
            try {
                const res = await friendService.getFriends("me", { limit: 10 });
                setFriends(res.data.friends || []);
            } catch (_) { }
        };
        fetchFriends();
    }, []);

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {/* Your story */}
            <div className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
                <div className="relative">
                    <img
                        src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        alt="Your story"
                    />
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-xs font-bold">
                        +
                    </div>
                </div>
                <span className="text-xs text-center w-14 truncate">Tin của bạn</span>
            </div>

            {/* Friends stories */}
            {friends.map((friend) => (
                <Link key={friend.user_id} to={`/profile/${friend.user_id}`}
                    className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600`}>
                        <img
                            src={friend.url_avt || `https://ui-avatars.com/api/?name=${friend.name}&background=random`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white"
                            alt={friend.name}
                        />
                    </div>
                    <span className="text-xs text-center w-14 truncate">{friend.name}</span>
                </Link>
            ))}
        </div>
    );
}

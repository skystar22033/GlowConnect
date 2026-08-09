import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Stories() {
  const { user } = useAuth();
  const [stories] = useState([
    { id: 1, username: 'john', fullName: 'John Doe', hasStory: true, image: null },
    { id: 2, username: 'sarah', fullName: 'Sarah Khan', hasStory: true, image: null },
    { id: 3, username: 'mike', fullName: 'Mike Smith', hasStory: false, image: null },
    { id: 4, username: 'emma', fullName: 'Emma Watson', hasStory: true, image: null },
  ]);

  return (
    <div className="stories-container overflow-x-auto px-4 py-3 border-b border-border bg-surface/30">
      <div className="flex gap-4 min-w-max">
        {/* Your Story */}
        <div className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer">
          <div className="relative">
            <div className={`story-ring ${true ? 'active' : ''} w-16 h-16`}>
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                <Avatar 
                  src={user?.profileImage}
                  name={user?.fullName}
                  username={user?.username}
                  avatarPreferences={user?.avatarPreferences}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold">
              +
            </div>
          </div>
          <span className="text-xs text-text-muted truncate w-full text-center">Your Story</span>
        </div>

        {/* Other Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer">
            <div className={`story-ring ${story.hasStory ? 'active' : ''} w-16 h-16`}>
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                <Avatar 
                  name={story.fullName}
                  username={story.username}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="text-xs text-text-muted truncate w-full text-center">
              {story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
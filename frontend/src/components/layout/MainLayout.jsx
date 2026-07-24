import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CreatePostModal from '../post/CreatePostModal';

export default function MainLayout({ children, onPostCreated }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-radial-glow">
      <Navbar onCreatePost={() => setCreateOpen(true)} />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />

      {createOpen && (
        <CreatePostModal
          onClose={() => setCreateOpen(false)}
          onCreated={(post) => {
            setCreateOpen(false);
            onPostCreated?.(post);
          }}
        />
      )}
    </div>
  );
}

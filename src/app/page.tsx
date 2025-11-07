import CreateThread from "./_components/create-thread";
import ThreadCard from "./_components/thread-card";

const MOCK_THREADS = [
  {
    _id: 1,
    title: "Welcome to the ForumIQ Community!",
    user: {
      username: "Admin",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    createdAt: "2024-01-01",
  },
  {
    _id: 2,
    title: "How to get started with Next.js?",
    user: {
      username: "JaneDoe",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    createdAt: "2024-02-15",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <CreateThread />

        <div className="space-y-4">
          {MOCK_THREADS.map((thread) => (
            <ThreadCard
              key={thread._id}
              id={thread._id}
              title={thread.title}
              createdAt={thread.createdAt}
              author={thread.user.username}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

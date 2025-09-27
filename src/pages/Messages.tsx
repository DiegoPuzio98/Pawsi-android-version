import { Navigation } from "@/components/navigation";
import { ChatCenter } from "@/components/ChatCenter";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <ChatCenter />
      </main>
    </div>
  );
}
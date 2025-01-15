import Chat from "./client/components/chat";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto">
      <Chat />
    </div>
  );
}

import React from "react";
import CreateThread from "./_components/create-thread";
import Threads from "./_components/threads";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <CreateThread />
        <React.Suspense fallback={<div />}>
          <Threads />
        </React.Suspense>
      </div>
    </div>
  );
}

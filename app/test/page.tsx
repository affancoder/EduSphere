"use client";

export default function TestPage() {
  console.log("COMPONENT LOADED: /test");

  return (
    <div className="min-h-screen p-10">
      <button
        onClick={() => console.log("WORKING")}
        className="rounded bg-black px-4 py-2 text-white"
      >
        CLICK TEST
      </button>
    </div>
  );
}


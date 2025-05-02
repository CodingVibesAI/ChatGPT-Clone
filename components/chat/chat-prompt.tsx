export default function ChatPrompt({ modelName }: { modelName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-2xl gap-8">
        <h1 className="text-[2rem] md:text-[2.3rem] font-bold text-[#ececf1] text-center select-none tracking-tight drop-shadow-sm">
          What&apos;s on the agenda today?
        </h1>
        <div className="w-full flex justify-center mb-2">
          <div className="rounded-lg px-3 py-1.5 text-xs text-[#8e8ea0] font-medium select-none">
            <span>{modelName}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
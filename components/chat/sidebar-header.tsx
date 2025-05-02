
export default function SidebarHeader() {
  return (
    <button
      className="flex items-center h-12 px-4 gap-2 select-none w-full text-left hover:bg-[#2a2b32] focus:bg-[#2a2b32] rounded transition-colors"
      tabIndex={0}
      aria-label="Workspace switcher"
    >
      <span className="text-[17px] font-medium text-white tracking-tight">ChatGPT Clone</span>
    </button>
  )
} 
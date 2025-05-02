import { Button } from '@/components/ui/button'
import { LucideSend, LucidePlus, Globe, Image as ImageIcon, Search, MoreHorizontal, CloudUpload, Upload } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

export default function ChatInput() {
  return (
    <form
      className="w-full max-w-[700px] mx-auto relative flex flex-col gap-0"
      style={{
        background: "#40414f",
        borderRadius: "16px",
        border: "1px solid #353740",
        minHeight: 48,
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.08)",
        padding: "0.75rem 1.25rem",
        fontFamily: "var(--font-sans)",
        fontSize: 16,
      }}
      onSubmit={e => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('input');
        if (input && input.value.trim()) {
          // sendMessage(input.value); // call your send function here
          input.value = '';
        }
      }}
    >
      <div className="flex items-center gap-2 w-full">
       
        <input
          className="flex-1 bg-transparent border-none outline-none rounded-full px-3 py-2 text-[16px] min-h-[24px] max-h-40 transition-colors"
          style={{
            color: "#ececf1",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "1.5",
            letterSpacing: "0",
            boxShadow: "none",
          }}
          placeholder="Ask anything"
          autoComplete="off"
        />
        <style jsx global>{`
          input::placeholder {
            color: #b4bcd0 !important;
            opacity: 1;
          }
        `}</style>
      </div>
      <div className="flex items-center justify-between pt-1 w-full">
        <div className="flex gap-1">
          {[Upload, Search, Globe, ImageIcon, MoreHorizontal].map((Icon, i) => (
            
            <Tooltip.Root key={i} delayDuration={200}>
              <Tooltip.Trigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
                >
                  <Icon size={18} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  sideOffset={8}
                  className="px-3 py-1.5 rounded-md text-xs shadow-lg border z-50"
                  style={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {["Upload", "Search", "Deep research", "Create image", "More"][i]}
                  <Tooltip.Arrow className="fill-[var(--popover)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="rounded-full w-12 h-12 flex items-center justify-center ml-auto text-[#ececf1] bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
              style={{
                color: "#ececf1",
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }}
            >
              <LucideSend size={20} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={8}
              className="px-3 py-1.5 rounded-md text-xs shadow-lg border z-50"
              style={{
                background: "#23272f",
                color: "#ececf1",
                borderColor: "#353740",
                fontFamily: "var(--font-sans)",
              }}
            >
              Send
              <Tooltip.Arrow className="fill-[#23272f]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </form>
  )
} 
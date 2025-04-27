import { Button } from '@/components/ui/button'
import { LucideSend, LucidePlus, Globe, Image as ImageIcon, Search, MoreHorizontal } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

export default function ChatInput() {
  return (
    <form className="w-full max-w-3xl mx-auto bg-[#40414f]/90 rounded-2xl px-6 py-4 border border-[#353740] min-h-[64px] focus-within:border-[#444654] relative flex flex-col gap-0">
      <div className="flex items-center gap-2 w-full">
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Button type="button" size="icon" variant="ghost" className="text-[#b4bcd0] w-11 h-11">
              <LucidePlus size={20} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
              New chat
              <Tooltip.Arrow className="fill-[#23272f]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <input
          className="flex-1 bg-transparent text-white placeholder:text-[#b4bcd0] border-none outline-none rounded-full px-4 py-3 text-[17px] min-h-[32px] max-h-40 focus:border-[#444654] transition-colors"
          placeholder="Ask anything"
          autoComplete="off"
        />
      </div>
      <div className="flex items-center justify-between pt-1 w-full">
        <div className="flex gap-1">
          <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Button type="button" size="icon" variant="ghost" className="text-[#b4bcd0] w-10 h-10">
                <Search size={18} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
                Search
                <Tooltip.Arrow className="fill-[#23272f]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Button type="button" size="icon" variant="ghost" className="text-[#b4bcd0] w-10 h-10">
                <Globe size={18} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
                Deep research
                <Tooltip.Arrow className="fill-[#23272f]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Button type="button" size="icon" variant="ghost" className="text-[#b4bcd0] w-10 h-10">
                <ImageIcon size={18} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
                Create image
                <Tooltip.Arrow className="fill-[#23272f]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Button type="button" size="icon" variant="ghost" className="text-[#b4bcd0] w-10 h-10">
                <MoreHorizontal size={18} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
                More
                <Tooltip.Arrow className="fill-[#23272f]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Button type="submit" size="icon" className="bg-[#19c37d] hover:bg-[#15a06a] text-white rounded-full w-12 h-12 flex items-center justify-center ml-auto">
              <LucideSend size={20} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={8} className="bg-[#23272f] text-[#ececf1] px-3 py-1.5 rounded-md text-xs shadow-lg border border-[#353740] z-50">
              Send
              <Tooltip.Arrow className="fill-[#23272f]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </form>
  )
} 
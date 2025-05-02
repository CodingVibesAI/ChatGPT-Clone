import SidebarItem from './sidebar-item'

export default function SidebarList({ dateGroups }: { dateGroups: { label: string, items: any[] }[] }) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-2">
      {dateGroups.map((group) => (
        group.items.length > 0 && (
          <div key={group.label}>
            <div className="text-xs text-[#8e8ea0] px-2 py-1 mt-2 mb-1 font-medium tracking-wide uppercase">{group.label}</div>
            <ul className="space-y-1">
              {group.items.map((conv) => (
                <SidebarItem key={conv.id} conv={conv} />
              ))}
            </ul>
          </div>
        )
      ))}
    </nav>
  )
} 
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"

type HumbergerMenuProps = {
    onSelectMode: () => void
    onSelectAll: () => void
}

export default function HumbergerMenu({onSelectMode, onSelectAll}: HumbergerMenuProps) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger className="p-2 hover:bg-gray-400 rounded-full cursor-pointer">
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-6">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSelectMode} className="cursor-pointer">Pilih Pesan</DropdownMenuItem>
            <DropdownMenuItem onClick={onSelectAll} className="cursor-pointer">Pilih Semua</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

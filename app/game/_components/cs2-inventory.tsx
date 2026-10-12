import { siteConfig } from '@/lib/config'
import { CS2InventoryClient } from './cs2-inventory-client'

import type { CS2InventoryItem } from '@/lib/steam'

interface CS2InventoryProps {
  id?: string
  items: CS2InventoryItem[]
}

/**
 * CS2 库存组件（纯服务端组件）
 * - 完全在服务端渲染结构
 * - 排序和显示更多由客户端组件处理
 */
export function CS2Inventory({ id, items }: CS2InventoryProps) {
  // 如果没有物品，显示空状态
  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-text-primary text-sm font-semibold tracking-wider uppercase" id={id}>
          Counter-Strike 2 库存
        </h2>
        <p className="text-text-secondary text-sm">
          暂时找不到 {siteConfig.author.name} 的 Counter-Strike 2 库存数据
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {/* 客户端组件处理排序和显示更多 */}
      <CS2InventoryClient items={items} id={id} />
    </section>
  )
}

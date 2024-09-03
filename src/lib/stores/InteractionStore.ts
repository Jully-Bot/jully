import { join } from 'node:path'
import type { Interaction } from '@lib/core/Interaction'
import { BlockStore } from '@lib/entities/BlockStore'

export class InteractionStore extends BlockStore<Interaction> {
  constructor() {
    super({
      name: 'interaction-store',
      root: join(process.cwd(), 'src', 'interactions'),
    })
  }

  override async load(path: string): Promise<void> {
    if (path.includes('rules')) return

    await super.load(path)
  }
}

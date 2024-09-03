import { join } from 'node:path'
import type { Listener } from '@lib/core/Listener'
import { BlockStore } from '@lib/entities/BlockStore'

export class ListenerStore extends BlockStore<Listener> {
  constructor() {
    super({
      name: 'listener-store',
      root: join(process.cwd(), 'src', 'lib', 'listeners'),
    })
  }
}

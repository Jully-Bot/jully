import { join } from 'node:path'
import type { Listener } from '@lib/core/Listener'
import { BlockStore } from '@lib/entities/BlockStore'

export class EventStore extends BlockStore<Listener> {
  constructor() {
    super({
      name: 'event-store',
      root: join(process.cwd(), 'src', 'events'),
    })
  }
}

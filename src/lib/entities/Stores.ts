import { Collection } from 'discord.js'
import type { Block } from './Block'
import type { BlockStore } from './BlockStore'

export class Stores extends Collection<string, BlockStore<Block>> {
  constructor(stores?: BlockStore<Block>[]) {
    super(stores?.map((store) => [store.name, store]))
  }

  async register(store: BlockStore<Block>): Promise<Stores> {
    const alreadyExists = this.has(store.name)

    if (alreadyExists) return this

    console.log(`[Stores -> Register] ${store.name} has been registered.`)

    this.set(store.name, store)

    return this
  }

  async loadAll(): Promise<void> {
    for (const store of this.values()) await store.loadAll()
  }
}

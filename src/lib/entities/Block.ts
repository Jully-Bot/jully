import { existsSync } from 'node:fs'
import { basename } from 'node:path'
import { PathError } from '@lib/errors/PathErrors'
import type { BlockStore } from './BlockStore'
import type { Client } from './Client'
import type { Stores } from './Stores'

export interface BlockContext {
  name: string
  path: string
  store: BlockStore<Block>
}

export interface Container {
  client: Client | null
  stores: Stores | null
}

export const container: Container = {
  client: null,
  stores: null,
}

export abstract class Block {
  readonly path: string
  readonly name: string
  store: BlockStore<Block>
  container: typeof container

  constructor({ name, path, store }: BlockContext) {
    if (!this.verifyPath(path)) throw new PathError()

    this.path = path
    this.name = name ?? this.normalizeName(path)
    this.store = store
    this.container = container
  }

  normalizeName(path: string): string {
    return basename(path).split('.')[0].toLowerCase()
  }

  verifyPath(path: string): boolean {
    try {
      const exists = existsSync(path)

      return !!exists
    } catch {
      return false
    }
  }

  async unload(): Promise<void> {
    await this.store.unload(this)
  }

  async onLoad(): Promise<void> {}
  async onUnload(): Promise<void> {}
}

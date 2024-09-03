import { existsSync } from 'node:fs'
import { basename } from 'node:path'
import { PathError } from '@lib/errors/PathErrors'
import { Walker } from '@lib/loader/Walker'
import { Collection } from 'discord.js'
import type { Block } from './Block'

export interface BlockStoreContext {
  name?: string
  root: string
  skipExistingBlock?: boolean
}

export class BlockStore<T extends Block> extends Collection<string, Block> {
  root: string
  name: string
  skipExistingBlock: boolean
  walker: Walker

  constructor({ name, root, skipExistingBlock }: BlockStoreContext) {
    super()

    if (!this.verifyPath(root)) throw new PathError()

    this.root = root
    this.name = name ?? basename(root)
    this.skipExistingBlock = skipExistingBlock ?? true

    this.walker = new Walker()
  }

  async insert(block: T): Promise<void> {
    const alreadyExists = this.has(block.name)

    if (alreadyExists && this.skipExistingBlock)
      console.log(`[BlockLoader -> ${this.name}]: Skiping block ${block.name}`)
    else if (alreadyExists && !this.skipExistingBlock) {
      await this.unload(block)
    }

    this.set(block.name, block)

    console.log(
      `[BlockStore -> ${this.name}] Block ${block.name} has been loaded.`,
    )

    await block.onLoad()
  }

  async unload(block: T): Promise<void> {
    const hasLoaded = this.get(block.name)

    if (!hasLoaded) return

    this.delete(block.name)

    console.log(
      `[BlockStore -> ${this.name}]: Block ${block.name} has been unloaded.`,
    )

    await block.onUnload()
  }

  async load(path: string): Promise<void> {
    const name = basename(path)

    for await (const ctor of this.walker.preload(path))
      this.insert(new ctor({ name, path, store: this }) as T)
  }

  async loadAll(root?: string) {
    for await (const path of this.walker.visit(root ?? this.root))
      await this.load(path)
  }

  verifyPath(path: string): boolean {
    try {
      const exists = existsSync(path)

      return !!exists
    } catch {
      return false
    }
  }

  async onLoad(): Promise<void> {}
  async onUnload(): Promise<void> {}
}

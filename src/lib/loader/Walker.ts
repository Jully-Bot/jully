import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { Block, BlockContext } from '@lib/entities/Block'

type Ctor<T, R> = new (param: T) => R

export class Walker {
  async *preload<T extends Block>(path: string) {
    const module = await require(path)

    delete require.cache[require.resolve(path)]

    for (const ctor of Object.values(module))
      yield ctor as Ctor<BlockContext, T>
  }
  async *visit(path: string): AsyncGenerator<string> {
    const files = await readdir(path)

    for (const file of files) {
      const fullPath = join(path, file)
      const fileStat = await stat(fullPath)

      if (fileStat.isDirectory()) {
        yield* this.visit(fullPath)
      } else {
        yield fullPath
      }
    }
  }
}

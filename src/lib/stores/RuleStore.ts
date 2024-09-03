import { join } from 'node:path'
import type { Rule } from '@lib/core/Rule'
import { BlockStore } from '@lib/entities/BlockStore'

export class RuleStore extends BlockStore<Rule> {
  constructor() {
    super({
      name: 'rule-store',
      root: join(process.cwd(), 'src', 'interactions', 'rules'),
    })
  }
}

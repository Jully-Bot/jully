import { Block, type BlockContext } from '@lib/entities/Block'
import type {
  ChatInputCommandInteraction,
  Interaction as DInteraction,
} from 'discord.js'
import type { EventPayload } from './Listener'

export interface RuleOptions {
  name?: string
  timeout?: number
}

export class RuleSet extends Set<string> {
  override add(value: string) {
    if (this.has(value)) return this

    return super.add(value)
  }
}

export abstract class Rule extends Block {
  name: string
  timeout: number | null
  isPanic: boolean

  constructor(context: BlockContext, options: RuleOptions) {
    super(context)

    this.name = options.name ?? context.name
    this.timeout = options.timeout ?? null
    this.isPanic = false
  }

  async construct({ command, interaction }: EventPayload) {
    const canExecute = await this.execute(interaction)

    if (canExecute)
      return await command.execute(interaction as ChatInputCommandInteraction)

    await command.ruleTrigger({ interaction, rule: this })
  }

  abstract execute(interaction: DInteraction): Promise<boolean> | boolean

  ok(): boolean {
    this.isPanic = false
    return true
  }

  panic(): boolean {
    this.isPanic = true
    return false
  }
}

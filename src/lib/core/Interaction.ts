import { Block, type BlockContext } from '@lib/entities/Block'
import type { RuleStore } from '@lib/stores/RuleStore'
import type {
  ApplicationCommandType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction,
} from 'discord.js'
import type { EventPayload, RuleEventPayload } from './Listener'
import { type Rule, RuleSet } from './Rule'

interface InteractionMappings {
  [ApplicationCommandType.ChatInput]: {
    options: ChatInputApplicationCommandData
    context: ChatInputCommandInteraction
  }
  [ApplicationCommandType.Message]: {
    options: MessageApplicationCommandData
    context: MessageContextMenuCommandInteraction
  }
  [ApplicationCommandType.User]: {
    options: UserApplicationCommandData
    context: UserContextMenuCommandInteraction
  }
}

type InteractionOptions<T extends ApplicationCommandType> =
  InteractionMappings[T]['options']
type InteractionContext<T extends ApplicationCommandType> =
  InteractionMappings[T]['context']

interface OptionsPayload<T extends ApplicationCommandType> {
  rules?: string[]
  data: InteractionOptions<T>
}

export abstract class Interaction<
  T extends ApplicationCommandType = ApplicationCommandType.ChatInput,
> extends Block {
  #raw: InteractionOptions<T>
  rules: RuleSet

  constructor(context: BlockContext, options: OptionsPayload<T>) {
    super({ ...context, name: options.data.name })

    this.rules = new RuleSet()

    for (const rule of options?.rules ?? []) {
      this.rules.add(rule)
    }

    this.#raw = options.data
  }

  async construct(interaction: InteractionContext<T>) {
    const rules = this.rules
    const store = this.container.stores?.get('rule-store') as RuleStore

    if (rules.size <= 0) await this.execute(interaction)

    for (const target of this.rules.values()) {
      const rule = store.get(target) as Rule

      await rule.execute(interaction)
    }
  }

  abstract execute(interaction: InteractionContext<T>): unknown

  async ruleTrigger(
    payload: Pick<EventPayload, 'interaction'> & RuleEventPayload,
  ): Promise<void> {}

  toJSON(): InteractionOptions<T> {
    return this.#raw
  }
}

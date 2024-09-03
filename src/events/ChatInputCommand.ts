import { type EventPayload, Listener } from '@lib/core/Listener'
import type { Rule } from '@lib/core/Rule'
import type { BlockContext } from '@lib/entities/Block'
import type { RuleStore } from '@lib/stores/RuleStore'
import type { ChatInputCommandInteraction } from 'discord.js'

export class ChatInputCommand extends Listener<'chatInputCommand'> {
  constructor(context: BlockContext) {
    super(context, { event: 'chatInputCommand', once: false })
  }

  async invoke({ interaction, command }: EventPayload): Promise<void> {
    try {
      if (command.rules.size > 0) {
        for (const target of command.rules.values()) {
          const store = this.container.stores?.get('rule-store') as RuleStore
          const rule = store.get(target) as Rule

          interaction.client.emit('ruleExecute', { interaction, command, rule })
        }
      } else {
        await command.execute(interaction as ChatInputCommandInteraction)
      }
    } catch (err) {
      console.error(
        `[${this.name} -> Error] Failed to execute command ${command.name}`,
      )
    }
  }
}

import type { Interaction } from '@lib/core/Interaction'
import { Listener } from '@lib/core/Listener'
import type { BlockContext } from '@lib/entities/Block'
import type {
  ApplicationCommandType,
  CacheType,
  Interaction as DInteraction,
} from 'discord.js'

export class InteractionCreate extends Listener<'interactionCreate'> {
  constructor(context: BlockContext) {
    super(context, { event: 'interactionCreate', once: false })
  }

  async invoke(interaction: DInteraction<CacheType>): Promise<void> {
    if (!interaction.isCommand()) return

    const commandStore = this.container.stores?.get('interaction-store')

    if (interaction.isChatInputCommand()) {
      const command = commandStore?.get(
        interaction.commandName,
      ) as Interaction<ApplicationCommandType.ChatInput>

      interaction.client.emit('chatInputCommand', { interaction, command })
    }
  }
}

import { Interaction } from '@lib/core/Interaction'
import type { EventPayload, RuleEventPayload } from '@lib/core/Listener'
import type { BlockContext } from '@lib/entities/Block'
import {
  type ApplicationCommandType,
  type CacheType,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js'

export class Ping extends Interaction<ApplicationCommandType.ChatInput> {
  constructor(context: BlockContext) {
    super(context, {
      data: {
        name: 'ping',
        description: 'replies with a ws ping!',
      },
    })
  }

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.deferReply()

    await interaction.followUp(`Pong! ${interaction.client.ws.ping}ms`)
  }

  async ruleTrigger({
    interaction,
    rule,
  }: EventPayload & RuleEventPayload): Promise<void> {
    await interaction.deferReply()

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('Error!')
          .setDescription('Você não tem permissão para usar esse comando!')
          .addFields([
            {
              name: 'Permissão',
              value: `\`\`${rule.name}\`\``,
            },
          ])
          .setFooter({
            text: interaction.client.user.username,
            iconURL: 'https://i.imgur.com/AfFp7pu.png',
          }),
      ],
    })
  }
}

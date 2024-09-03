import { Interaction } from '@lib/core/Interaction'
import type { BlockContext } from '@lib/entities/Block'
import {
  ApplicationCommandOptionType,
  type CacheType,
  type ChatInputCommandInteraction,
} from 'discord.js'
import { codeBlock } from 'src/utils/CodeBlock'

export class Eval extends Interaction {
  constructor(context: BlockContext) {
    super(context, {
      rules: ['owner'],
      data: {
        name: 'eval',
        description: 'evaluate codes.',
        options: [
          {
            name: 'code',
            description: 'the code to evaluate.',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    })
  }

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.deferReply()

    const code = interaction.options.getString('code')

    if (!code) return

    try {
      // biome-ignore lint/security/noGlobalEval: <explanation>
      const result = await eval(code)

      await interaction.editReply(`${codeBlock(code)}${codeBlock(result)}`)
    } catch (err) {
      await interaction.editReply(codeBlock(err as string))
    }
  }
}

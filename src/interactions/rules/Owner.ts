import { Rule } from '@lib/core/Rule'
import type { BlockContext } from '@lib/entities/Block'
import type { Interaction } from 'discord.js'

export class OwnerRule extends Rule {
  constructor(context: BlockContext) {
    super(context, {
      name: 'owner',
    })
  }

  async execute(interaction: Interaction): Promise<boolean> {
    if (
      process.env.OWNERS.split(' ').includes(
        interaction.member?.user.id as string,
      )
    ) {
      return this.ok()
    }

    return this.panic()
  }
}

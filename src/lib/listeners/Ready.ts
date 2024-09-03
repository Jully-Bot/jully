import type { Interaction } from '@lib/core/Interaction'
import { Listener } from '@lib/core/Listener'
import type { BlockContext } from '@lib/entities/Block'
import type { Client } from '@lib/entities/Client'
import { ApplicationCommand } from 'discord.js'
import { prisma } from 'src/services/PrismaClient'

export class Ready extends Listener<'ready'> {
  constructor(context: BlockContext) {
    super(context, { event: 'ready', once: true })
  }

  async invoke(): Promise<void> {
    if (!this.container.client) return

    const client = this.container.client as Client
    const interactions = this.container.stores?.get('interaction-store')
    const currentInteractions = await client.application?.commands.fetch()

    console.log(
      `[Ready -> Registry] Synchronizing ${interactions?.size} interactions.`,
    )

    const newInteractions = interactions?.filter(
      (interaction) =>
        !currentInteractions?.some((i) => i.name === interaction.name),
    )

    for (const interaction of newInteractions?.values() as MapIterator<Interaction>) {
      const created = await client.application?.commands.create(
        interaction.toJSON(),
      )

      await prisma.interaction.create({
        data: {
          id: created?.id as string,
          name: created?.name as string,
        },
      })

      console.log(`[Ready -> Registry] ${interaction.name} has been created.`)
    }

    const deletedInteractions = currentInteractions?.filter(
      (interaction) => !interactions?.some((i) => i.name === interaction.name),
    )

    for (const interaction of deletedInteractions
      ?.toJSON()
      .values() as ArrayIterator<ApplicationCommand>) {
      await interaction.delete()

      await prisma.interaction.delete({
        where: {
          id: interaction.id,
        },
      })

      console.log(`[Ready -> Registry] ${interaction.name} has been deleted.`)
    }

    const updatedInteractions = interactions?.filter((interaction) =>
      currentInteractions?.some((i) => i.name === interaction.name),
    )

    let updatedInteractionsCount = 0

    for (const interaction of updatedInteractions?.values() as MapIterator<Interaction>) {
      let modified = false

      const previousCommand = currentInteractions?.find(
        (i) => i.name === interaction.name,
      )

      if (previousCommand?.description !== interaction.toJSON().description)
        modified = true
      if (
        !ApplicationCommand.optionsEqual(
          previousCommand?.options ?? [],
          interaction.toJSON().options ?? [],
        )
      )
        modified = true

      if (modified) {
        await previousCommand?.edit(interaction)
        updatedInteractionsCount++
      }
    }

    console.log(
      `[Ready -> Registry] total of ${newInteractions?.size} interactions created, ${deletedInteractions?.size} deleted and ${updatedInteractionsCount} updated.`,
    )

    console.log(`[Ready -> ${client.user?.username}] client is ready!`)
  }
}

import { ListenerStore } from '@lib/stores/CoreListenerStore'
import { EventStore } from '@lib/stores/EventStore'
import { InteractionStore } from '@lib/stores/InteractionStore'
import { RuleStore } from '@lib/stores/RuleStore'
import { type ClientOptions, Client as DiscordClient } from 'discord.js'
import { container } from './Block'
import { Stores } from './Stores'

export class Client extends DiscordClient {
  stores: Stores

  constructor(options: ClientOptions) {
    super({ ...options })

    const stores = new Stores()
    this.stores = stores

    Reflect.set(container, 'client', this)
    Reflect.set(container, 'stores', stores)
  }

  async load(): Promise<void> {
    try {
      const promises = []

      promises.push(this.stores.register(new ListenerStore()))
      promises.push(this.stores.register(new EventStore()))
      promises.push(this.stores.register(new InteractionStore()))
      promises.push(this.stores.register(new RuleStore()))
      promises.push(this.stores.loadAll())

      await Promise.all(promises)
    } catch (error) {
      console.error('Failed to load stores:', error)
      throw error
    }
  }

  override async login(token: string): Promise<string> {
    await this.load()

    const safeToken = await super.login(token)

    return safeToken
  }
}

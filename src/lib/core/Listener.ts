import { Block, type BlockContext } from '@lib/entities/Block'
import type { Client } from '@lib/entities/Client'
import type {
  ChatInputCommandInteraction,
  ClientEvents,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js'
import type { Interaction as ObsidianInteraction } from './Interaction'
import type { Rule } from './Rule'

export interface ListenerOptions {
  event?: string | symbol
  once?: boolean
}

export abstract class Listener<
  E extends keyof ClientEvents = 'ready',
> extends Block {
  event: string | symbol
  once: boolean

  emitter: Client | null
  _listener: (...args: unknown[]) => void

  constructor(context: BlockContext, options: ListenerOptions) {
    super(context)

    this.event = options.event ?? 'ready'
    this.once = options.once ?? false

    this.emitter = this.container.client
    this._listener = this.once
      ? this._invokeOnce.bind(this)
      : this._invoke.bind(this)
  }

  async onLoad(): Promise<void> {
    if (!this.emitter) return

    const method = this.once ? 'once' : 'on'

    this.emitter[method](this.event, this._listener)
  }

  async onUnload(): Promise<void> {
    if (!this.once && this.emitter) {
      this.emitter.off(this.event, this._listener)
    }
  }

  abstract invoke(
    ...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]
  ): unknown

  private async _invoke(...args: unknown[]): Promise<void> {
    try {
      await this.invoke(
        ...(args as E extends keyof ClientEvents ? ClientEvents[E] : unknown[]),
      )
    } catch (err) {
      console.error(`[Block -> ${this.name}] Failed to invoke this!\n${err}`)
    }
  }

  private async _invokeOnce(...args: unknown[]): Promise<void> {
    await this._invoke(...args)
    await this.unload()
  }
}

const Events = {
  ChatInputCommand: 'chatInputCommand' as const,
  MessageCommand: 'messageCommand' as const,
  UserCommand: 'userCommand' as const,
  RuleExecute: 'ruleExecute' as const,
} as const

declare const ObsidianEvents: typeof Events

export interface EventPayload {
  interaction:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
  command: ObsidianInteraction
}

export interface RuleEventPayload {
  rule: Rule
}

declare module 'discord.js' {
  interface ClientEvents {
    [ObsidianEvents.ChatInputCommand]: [payload: EventPayload]
    [ObsidianEvents.MessageCommand]: [payload: EventPayload]
    [ObsidianEvents.UserCommand]: [payload: EventPayload]
    [ObsidianEvents.RuleExecute]: [payload: EventPayload & RuleEventPayload]
  }
}

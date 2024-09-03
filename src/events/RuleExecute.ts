import {
  type EventPayload,
  Listener,
  type RuleEventPayload,
} from '@lib/core/Listener'
import type { BlockContext } from '@lib/entities/Block'
import { ErrorManager } from 'src/services/ErrorManager'

export class RuleExecute extends Listener<'ruleExecute'> {
  constructor(context: BlockContext) {
    super(context, { event: 'ruleExecute', once: false })
  }

  async invoke({
    interaction,
    command,
    rule,
  }: EventPayload & RuleEventPayload): Promise<void> {
    try {
      await rule.construct({ interaction, command })
    } catch (error) {
      console.error(
        `${this.name} -> Error] Failed to execute rule ${rule.name}}`,
      )
    }
  }
}

import { Client } from '@lib/entities/Client'

const client = new Client({
  intents: [],
})

client.login(process.env.CLIENT_TOKEN as string)

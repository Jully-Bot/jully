import type { Snowflake } from './Snowflake'

export abstract class DatabaseWrapper<T, R> {
  abstract create(data: T): Promise<R>
  abstract delete(data: Snowflake): Promise<R>
  abstract get(data: Snowflake): Promise<R>

  async getOrCreate(data: unknown): Promise<R> {
    const alreadyExists = await this.get(data as Snowflake)

    return alreadyExists ? alreadyExists : await this.create(data as T)
  }
}

// dotenv.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_TOKEN: string
    CLIENT_ID: string
    CLIENT_SECRET: string
    OWNERS: string
    DATABASE_URL: string
  }
}

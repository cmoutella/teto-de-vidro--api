export type Enviroment = 'production' | 'development' | 'test'

export type Bindings = {
  NODE_ENV: string
  MONGO_URI: string
  JWT_SECRET: string
  JWT_INVITATION_SECRET: string

  SCRAPER_SERVICE: string
  SCRAPER_APP_CLIENT: string
  SCRAPER_APP_KEY: string

  EMAIL_TOKEN: string
  TDV_URL: string

  OPENCEP_API: string
}

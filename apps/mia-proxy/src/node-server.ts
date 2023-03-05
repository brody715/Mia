// for local testing

import { serve } from '@hono/node-server'
import { server } from './shared'

async function main() {
  serve({
    fetch: server.getHono().fetch,
    port: 8787,
  })
}

main().catch((err) => console.error(err))

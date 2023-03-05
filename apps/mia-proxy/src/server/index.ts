import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'

export type ProxyConfig = {
  [k: string]: {
    target: string
    rewrite?: (path: string) => string
  }
}

export interface ServerOptions {
  baseUrl: string
  proxy: ProxyConfig
}

export class MiaProxyServer {
  app: Hono

  constructor(private opts: ServerOptions) {
    this.app = new Hono()
    console.log(`using proxy`, this.opts.proxy)

    const app = this.app

    app.use('*', logger())

    // @see https://hono.dev/api/exception to handle exception
    app.onError((err, c) => {
      if (err instanceof HTTPException) {
        return c.json({ error: err.message }, err.status)
      }
      if (err instanceof Error) {
        return c.json({ error: err.message }, 500)
      }
      return c.json({ error: `Unknown error: ${err}` }, 400)
    })

    const router = app.route(this.opts.baseUrl)

    // register proxy
    for (const [key, proxy] of Object.entries(this.opts.proxy)) {
      router.route(key).use('*', async (c) => {
        const targetUrl = new URL(proxy.target)
        const reqUrl = new URL(c.req.url)
        if (proxy.rewrite) {
          reqUrl.pathname = proxy.rewrite(reqUrl.pathname)
        }

        reqUrl.protocol = targetUrl.protocol
        reqUrl.port = targetUrl.port
        reqUrl.host = targetUrl.host

        const url = reqUrl.toString()

        // remove all host first
        let headers = Array.from(c.req.headers.entries()).filter(
          ([k]) => k.toLowerCase() != 'host'
        )
        headers.push(['Host', targetUrl.host])

        const details = {
          requestUrl: c.req.url,
          targetUrl: url,
          proxyKey: key,
        }

        console.log(details)

        try {
          const resp = await fetch(url, {
            method: c.req.method,
            body: c.req.body,
            headers: headers,
          })

          return resp
        } catch (err) {
          console.error(err)
          return c.json(
            {
              error: err,
              details: {
                ...details,
                message: 'failed to proxy',
              },
            },
            500
          )
        }
      })
    }
  }

  getHono() {
    return this.app
  }
}

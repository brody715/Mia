import { MiaProxyServer } from './server'

const baseUrl = '/mia_proxy'

function removePrefix(path: string, prefix: string): string {
  const nprefix = `${baseUrl}${prefix}`
  return path.replace(nprefix, '')
}

export const server = new MiaProxyServer({
  baseUrl,
  proxy: {
    '/pokeapi': {
      target: 'https://pokeapi.co',
      rewrite: (path) => removePrefix(path, '/pokeapi'),
    },
    '/openai': {
      target: 'https://api.openai.com',
      rewrite: (path) => removePrefix(path, '/openai'),
    },
  },
})

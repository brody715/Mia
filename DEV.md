## Bootstrap Mia Backend from scratch

We are using GraphQL as our communication layer, and graphql-yoga as our backend server.

We split the backend business logic into a npm package named `@mia-chat/backend`.

Different server providers (like node http, cloudflare workers, AWS lambda) can import from the backend package, and implement the server.

- see https://the-guild.dev/graphql/codegen/docs/getting-started

Schema is put in the location `packages/mia-backend/src/schemas`

**Init project**

```sh
cd packages/
mkdir mia-backend
pn init
```

**Install deps**

- see https://the-guild.dev/graphql/yoga-server/docs
- see https://the-guild.dev/graphql/codegen/docs/getting-started

```sh
pn add -D typescript @types/node

# install deps for graphql
pn add graphql graphql-yoga
```

**Configure Code Generation**

The project will generate codes from the workspace root, and put the generated files in both client and backend package.

```sh
cd <workspace-root>/

pn add -w -D @babel/core @types/node graphql typescript @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers
```

provide `codegen.yml`

```sh
pn graphql-codegen
```

- plugins list: https://the-guild.dev/graphql/codegen/plugins

**Configure unbuild**

Use unbuild to simplify the development of typescript project

- see https://github.com/unjs/unbuild

```sh
pn add -D -w unbuild

cd packages/mia-backend

pn dev
```

**Used in node server**

```ts
import { createServer } from 'node:http'
import { createServerInstance } from '@mia-chat/backend'

const miaServerInstance = createServerInstance()
const server = createServer(miaServerInstance.getRequestListener())

const port = 4000
server.listen(port, () => {
  console.log(`GraphQL Server is listening on http://localhost:${port}/graphql`)
})
```

## Bootstrap Mia Frontend App from scratch

**Run vite create using pnpm**

- see https://vitejs.dev/guide/

```sh
pnpm create vite mia-app --template react-ts

cd mia-app
pn install
pn run dev
```

**Install MaterialUI**

- see https://mui.com/material-ui/getting-started/installation/

add deps

```sh
pn add @mui/material @emotion/react @emotion/styled

# icons
pn add @mui/icons-material
```

install fonts, and add it to `src/main.ts`

```sh
pn add @fontsource/roboto
```

```ts
// in main.ts
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
```

**Configure SPA Router**

```sh

pn add react-router-dom

```

- @ see https://reactrouter.com/en/main/start/tutorial

create `src/routes/{root, error}.tsx`

And defines routes in `src/App.tsx`

We can define default redirection by using `<Navigate to="/chat">`

```tsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import ChatPage from './routes/chat'
import ErrorPage from './routes/error'

const router = createHashRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Navigate />,
      },
      {
        // set as index
        path: '/chat',
        element: <ChatPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
])

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}
```

in `src/routes/root.tsx`, using `<Outlet />` to define children page in the RootLayout

```tsx
import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
      {/* all the other elements */}
      <div id="detail">
        <Outlet />
      </div>
    </>
  )
}
```

Use `<Link />` to direct to other page

```tsx
import { Link } from 'react-router-dom'

function A() {
  return (
    <div>
      <Link to={`/chat`}>Goto Chat</Link>
    </div>
  )
}
```

**Install other useful deps**

```sh
pn add ahooks
```

## Use cloudflare workers

**Install deps**

```sh
cd apps/mia-proxy
pn add -D wrangler
```

```sh
pn wrangler login
```

**Start dev server**

```sh
wrangler dev src/index.ts
```

default port is `8787`

**Publish**

```sh
wrangler publish src/index.ts
```

## Docs

- Monorepo Example: https://github.com/ycjcl868/monorepo
- Axios API: https://axios-http.com/docs/intro
- OpenAI chat API: https://platform.openai.com/docs/api-reference/chat/create
- GraphQL tools mocking: https://the-guild.dev/graphql/tools/docs/mocking
- Vite Mock Plugin: https://github.com/vbenjs/vite-plugin-mock
- Zustand Doc: https://github.com/pmndrs/zustand

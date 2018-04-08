import { ApolloLink } from "apollo-link"
import { createHttpLink } from "apollo-link-http"
import { setContext } from "apollo-link-context"
import fetch from "node-fetch"
import { headers as requestIDHeaders } from "../../../lib/requestIDs"

import config from "config"
const { CONVECTION_API_BASE } = config

import urljoin from "url-join"

export function createConvectionLink() {
  const httpLink = createHttpLink({
    fetch,
    uri: urljoin(CONVECTION_API_BASE, "graphql"),
  })

  const middlewareLink = new ApolloLink((operation, forward) =>
    forward(operation)
  )

  const authMiddleware = setContext((_request, context) => {
    const locals =
      context.graphqlContext &&
      context.graphqlContext.res &&
      context.graphqlContext.res.locals

    const tokenLoader = locals && locals.dataLoaders.convectionTokenLoader
    const headers = { ...(locals && requestIDHeaders(locals.requestIDs)) }
    // If a token loader exists for Convection (i.e. this is an authenticated request), use that token to make
    // authenticated requests to Convection.
    if (tokenLoader) {
      return tokenLoader().then(({ token }) => ({
        headers: Object.assign(headers, { Authorization: `Bearer ${token}` }),
      }))
    }
    // Otherwise use no authentication, which is also meant for fetching the service’s (public) schema.
    return { headers }
  })

  return middlewareLink.concat(authMiddleware).concat(httpLink)
}

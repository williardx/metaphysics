import {
  mergeSchemas as _mergeSchemas,
  makeRemoteExecutableSchema,
} from "graphql-tools"
import fs from "fs"
import path from "path"

import localSchema from "../schema"

import { createConvectionLink } from "../schema/stitching/links/convection"

const defaultLinks = {
  createConvectionLink,
}

export async function mergeSchemas(links = defaultLinks) {
  // The below all relate to Convection stitching.
  // TODO: Refactor when adding another service.
  const convectionTypeDefs = fs.readFileSync(
    path.join("src/data/convection.graphql"),
    "utf8"
  )
  debugger
  const convectionLink = links.createConvectionLink()
  const convectionSchema = await makeRemoteExecutableSchema({
    schema: convectionTypeDefs,
    link: convectionLink,
  })

  const linkTypeDefs = `
    extend type Submission {
      artist: Artist
    }
  `

  const mergedSchema = _mergeSchemas({
    schemas: [localSchema, convectionSchema, linkTypeDefs],
    // Prefer others over the local MP schema.
    // onTypeConflict: (_leftType, rightType) => {
    //   console.warn(`[!] Type collision ${rightType}`) // eslint-disable-line no-console
    //   return rightType
    // },
    resolvers: {
      Submission: {
        artist: {
          fragment: `fragment SubmissionArtist on Submission { artist_id }`,
          resolve: (parent, args, context, info) => {
            const id = parent.artist_id
            return info.mergeInfo.delegateToSchema(
              localSchema,
              "query",
              "artist",
              { id },
              context,
              info
            )
          },
        },
      },
    },
  })
  mergedSchema.__allowedLegacyNames = ["__id"]
  return mergedSchema
}

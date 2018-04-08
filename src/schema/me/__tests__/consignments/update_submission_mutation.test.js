import { runAuthenticatedMergedQuery } from "test/utils"
// import { config as updateSubmissionMutation } from "schema/me/consignments/update_submission_mutation.js"
import gql from "test/gql"

import { ApolloLink } from "apollo-link"

describe("UpdateSubmissionMutation", () => {
  // it("includes the id param", () => {
  //   const mutation = updateSubmissionMutation
  //   expect(Object.keys(mutation.inputFields)).toContain("id")
  // })

  // it("includes the state param", () => {
  //   const mutation = updateSubmissionMutation
  //   expect(Object.keys(mutation.inputFields)).toContain("state")
  // })

  it("updates a submission and returns its new data payload", () => {
    const mutation = gql`
      mutation {
        updateConsignmentSubmission(
          input: {
            id: "108"
            artist_id: "andy-warhol"
            depth: "123"
            clientMutationId: "123123"
          }
        ) {
          clientMutationId
          consignment_submission {
            depth
          }
        }
      }
    `

    // const rootValue = {
    //   submissionUpdateLoader: async () => ({
    //     id: "106",
    //     artist_id: "andy-warhol",
    //     authenticity_certificate: true,
    //     depth: "1000",
    //   }),
    // }

    // const consoleLink = new ApolloLink((operation, forward) => {
    //   console.log(`starting request for ${operation.operationName}`);
    //   return forward(operation).map((data) => {
    //     console.log(`ending request for ${operation.operationName}`);
    //     return data;
    //   })
    // })

    const links = {
      createConvectionLink: () =>
        new ApolloLink((operation, forward) => {
          debugger

          return {
            id: "106",
            artist_id: "andy-warhol",
            authenticity_certificate: true,
            depth: "1000",
          }
        }),
    }

    expect.assertions(1)
    return runAuthenticatedMergedQuery(mutation, links).then(data => {
      expect(data).toMatchSnapshot()
    })
  })
})

// server.js

const { ApolloServer, gql } = require('apollo-server');

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        hello: String
    }
`;

// Resolvers
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
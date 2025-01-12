// server.js

const { ApolloServer, gql } = require('apollo-server');

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        hello: String
        users: [User]
    }

    type User {
        id: ID
        name: String
        email: String
    }
`;

const usersData = [
    {
        id: 1,
        name: 'John',
        email: 'john@example.com'
    },
    {
        id: 2,
        name: 'Jane',
        email: 'jane@example.com'
    }
];

// Resolvers
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        users: () => usersData,
    },
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
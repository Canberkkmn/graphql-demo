// server.js

const { ApolloServer, gql } = require('apollo-server');

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        hello: String
        users: [User]
    }

    type Mutation {
        createUser(input: CreateUserInput!): User
    }

    type User {
        id: ID
        name: String
        email: String
    }

    input CreateUserInput {
        name: String!
        email: String!
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
    Mutation: {
        createUser: (parent, args) => {
            const { name, email } = args.input;

            const newUser = {
                id: String(usersData.length + 1),
                name,
                email
            }

            usersData.push(newUser);

            return newUser;
        }
    }
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
// server.js

const { ApolloServer, gql } = require('apollo-server');

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        hello: String
        users: [User]
        posts: [Post]
    }

    type Mutation {
        createUser(input: CreateUserInput!): User
        createPost(input: CreatePostInput!): Post
    }

    type User {
        id: ID
        name: String
        email: String
        posts: [Post]
    }

    type Post {
        id: ID!
        title: String!
        content: String!
        author: User
    }

    input CreateUserInput {
        name: String!
        email: String!
    }

    input CreatePostInput {
        title: String!
        content: String!
        authorId: ID!
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

const postsData = [
    {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        authorId: 1
    },
    {
        id: 2,
        title: 'Post 2',
        content: 'Content 2',
        authorId: 2
    }
];

// Resolvers
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        users: () => usersData,
        posts: () => postsData
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
        },
        createPost: (parent, args) => {
            const { title, content, authorId } = args.input;

            const newPost = {
                id: String(postsData.length + 10),
                title,
                content,
                authorId
            }

            postsData.push(newPost);

            return newPost;
        }
    },
    User: {
        posts: (parent) => {
            return postsData.filter(post => post.authorId === parent.id);
        }
    },
    Post: {
        author: (parent) => {
            return usersData.find(user => user.id == parent.authorId);
        }
    }
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
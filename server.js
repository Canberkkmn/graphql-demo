// server.js

const { ApolloServer, gql } = require('apollo-server');

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        users: [User]
        posts: [Post]
        categories: [Category]
    }

    type Mutation {
        createUser(input: CreateUserInput!): User
        createPost(input: CreatePostInput!): Post
        createCategory(input: CreateCategoryInput!): Category
    }

    # User Type
    type User {
        id: ID
        name: String
        email: String
        posts: [Post]
    }

    # Post Type
    type Post {
        id: ID!
        title: String!
        content: String!
        author: User
        category: Category
    }

    # Category Type
    type Category {
        id: ID!
        name: String!
        posts: [Post]
    }

    # Create User Input
    input CreateUserInput {
        name: String!
        email: String!
    }

    # Create Post Input
    input CreatePostInput {
        title: String!
        content: String!
        authorId: ID!
        categoryId: ID!
    }

    # Create Category Input
    input CreateCategoryInput {
        name: String!
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

const categoriesData = [
    {
        id: 10,
        name: 'Category 1'
    },
    {
        id: 20,
        name: 'Category 2'
    }
];

const postsData = [
    {
        id: 101,
        title: 'Post 1',
        content: 'Content 1',
        authorId: 1,
        categoryId: 10
    },
    {
        id: 102,
        title: 'Post 2',
        content: 'Content 2',
        authorId: 2,
        categoryId: 20
    }
];

// Resolvers
const resolvers = {
    Query: {
        users: () => usersData,
        posts: () => postsData,
        categories: () => categoriesData
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
                id: String(postsData.length + 101),
                title,
                content,
                authorId
            }

            postsData.push(newPost);

            return newPost;
        },
        createCategory: (parent, { input }) => {
            const newCategory = {
                id: String(categoriesData.length + 10),
                name: input.name,
            };

            categoriesData.push(newCategory);

            return newCategory;
        },
    },
    User: {
        posts: (parent) => {
            return postsData.filter(post => post.authorId === parent.id);
        }
    },
    Post: {
        author: (parent) => {
            return usersData.find(user => user.id == parent.authorId);
        },
        category: (parent) => {
            return categoriesData.find(category => category.id == parent.categoryId);
        }
    },
    Category: {
        posts: (parent) => {
            return postsData.filter(post => post.categoryId === parent.id);
        }
    }
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
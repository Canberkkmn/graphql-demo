// server.js

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ApolloServer, gql, UserInputError, ValidationError } = require('apollo-server');

const SECRET_KEY = "supersecret123";

// Schema definition (typeDefs)
const typeDefs = gql`
    type Query {
        users: [User]
        posts: [Post]
        categories: [Category]
    }

    type Mutation {
        login(input: LoginInput!): AuthPayload
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

    # Auth Payload Type
    type AuthPayload {
        user: User
        token: String
    }

    # Auth Payload Type
    input LoginInput {
        email: String!
        password: String!
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

const createUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().max(50).required()
});

// Resolvers
const resolvers = {
    Query: {
        users: () => usersData,
        posts: () => postsData,
        categories: () => categoriesData
    },
    Mutation: {
        login: async (parent, { input }, context) => {
            const { email, password } = input;

            const user = await findUserByEmail(email);

            if (!user) {
                throw new UserInputError('User not found');
            }

            const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

            if (!passwordIsValid) {
                throw new UserInputError('Invalid password');
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                SECRET_KEY,
                {
                    expiresIn: "1h"
                }
            );

            return {
                user,
                token
            };
        },
        createUser: (parent, { input }) => {
            const { error, value } = createUserSchema.validate(input, { abortEarly: false });

            if (error) {
                throw new UserInputError('Validation Error', {
                    ValidationError: error.details.map(e => e.message)
                });
            }

            const { name, email } = value;

            /*
            if (!name.trim()) {
                throw new UserInputError('Name field is required', {
                    invalidArgs: ['name']
                });
            }

            if (!email.trim()) {
                throw new UserInputError('Email field is required', {
                    invalidArgs: ['email']
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new UserInputError('Email is invalid', {
                    invalidArgs: ['email']
                });
            }
            */

            const newUser = {
                id: String(usersData.length + 1),
                name,
                email
            }

            usersData.push(newUser);

            return newUser;
        },
        createPost: async (parent, { input }, context) => {
            if (!context.user) {
                throw new ValidationError('User not authenticated');
            }

            const newPost = {
                id: String(postsData.length + 101),
                title: input.title,
                content: input.content,
                authorId: context.user.id,
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
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7, authHeader.length)
            : null;

        let user = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, SECRET_KEY);

                user = {
                    id: decoded.userId,
                    email: decoded.email
                };
            } catch (error) {
                console.error("Invalid token", error);
            }
        }

        return { user };
    }
});

// Start the server
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
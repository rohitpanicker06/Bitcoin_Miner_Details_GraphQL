import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQYfFFk84yRGpXa7AuxMKWW09a9nBX5w'
    // If you need an authorization token, include it here
    // 'Authorization': `Bearer YOUR_TOKEN_HERE`
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;

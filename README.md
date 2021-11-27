# 🪙 Crypto Dashboard API

A GraphQL API for querying Bitvavo.

## Requirements

- [Node.js 14+](https://nodejs.org/en/download/)
- [Yarn 1](https://classic.yarnpkg.com/en/docs/install)

## Running the API

```bash
$ yarn start:dev
```

## Authentication

To authenticate, provide the following HTTP headers:

```json
{
  "Bitvavo-Api-Key": "YOUR_API_KEY",
  "Bitvavo-Api-Secret": "YOUR_API_SECRET"
}
```

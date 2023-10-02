# Study Notes

This file contains my study notes, while learning to do this challange.

## Knex

In order to knex work properly, it needs a `knexfile` that it reads to know about the database (connection, client, etc.). In my project, as the connection file is not the knexfile, I needed to create a simple file that just imports my config from the `database.ts` and exports it, so knex can find it and read it.

## Node Command Line

- The syntax `--` is used when I want to pass arguments to the next command (rather than `node`)
- `node --no-warnings --loader tsx ./node_modules/.bin/knex` is telling node to run using the `tsx`, that itself is being used to interpret the TypeScript code with the knex.

## Envirnonment Variables

- To be able to use them, I have to install a node package that is capable of reading the `.env` file
- The package `dotenv` makes the env variables available in the global variable `process.env`

## Pre-handlers

- If I want to check for a variable before executing a given code (a route call, for example), I should create a middleware function that checks if the data is valid or not. If it isn't, thent I should return from the function, else, do nothing

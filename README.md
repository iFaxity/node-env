@ifaxity/env
============

## The minimal enviroment variable package for modern Node.js environments. No dependencies.

Node 6 or above is required as ES6 is needed.

Code heavily based on [dotenv package](https://github.com/motdotla/dotenv) on npm

---------------
## Installation

`npm install @ifaxity/env --save`

or if you use yarn

`yarn add @ifaxity/env`

--------
## Usage

To use the module just require it like this

`const env = require('@ifaxity/env');`

------
## API

Example .env file:
```sh
# Node environment
NODE_ENV=production

# Example database connect options
DB_HOST='localhost'
DB_PORT=27017

# Decimals can also be used
PI=3.14

# Booleans too
DEBUG=true

# Multiline strings (must be double quoted strings)
MULTILINE="Hello\nWorld!"
```

### [env](#env)

The module is a proxy object so you can use this to get an environment variable and also convert it to the correct type. As node.js doesn't support `process.env` to have any other values other than strings for now.

Types parsed are limited to `boolean, number, string` for now.
If the variable doesnt exist then `null` is returned.

Like this:

Consider the variables in the example file above

```js
const env = require('@ifaxity/env');
env.NODE_ENV // same as process.env.NODE_ENV.

env.PORT // returns 3000 (as a number)
env.BOOL // returns true (as a boolean)

// Can also use the object deconstruction syntax
const { NODE_ENV, PORT, TRUE } = require('@ifaxity/env');
```


However `parse` & `config` is reserved as functions in this module.

### [env.config([, opts])](#config)
Signs a JWT token with a payload and a secret key.

Returns a string with the signed JWT Token.

#### Parameters
* opts {Object} - Optional options. If any of the optional options is not of a valid type or if its value is not valid then a `TokenError` will be thrown.

  * `encoding {String}` - Encoding to use when reading the env files. Encoding types are defined in the [nodejs documentation](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)

  * `path {String|Array}` - Full path to the .env file. Default value is the current working directory's .env file.

  * `env {Object}` - Object to set the config options to. Default value is process.env.

#### Basic Usage

```js
const env = require('@ifaxity/env');

// Basic usage
env.config();

// Custom file & variable
const envVars = env.config({
  path: __dirname + '/.env',
  env: {},
});
```

### [env.parse(data)](#parse)
Parses a key=value pair string to an object of variables

Returns an object of the `key=value` pairs of the data

#### Parameters
* data {String} - Data to parse in a `key=value` pair format.

#### Basic Usage

```js
const env = require('@ifaxity/env');

const envVars = env.parse(fs.readFileSync(process.cwd() + '/.env', 'utf8'));
```

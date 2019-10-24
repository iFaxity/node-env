const fs = require('fs');
const path = require('path');

const KEY_VALUE_REGEX = /^([\w.-]+)\s*=\s*(.*)$/; // key=value regex
const TRIM_REGEX = /(^['"]|['"]$)/g; // Regex for enclosing string notations
const DEFAULT_OPTS = {
  encoding: 'utf8',
  path: process.cwd(), // path were we look for .env files
  env: process.env,
  defaults: null,
};

// Parses src into an Object
function parse(data) {
  const lines = data.toString().split('\n');

  return lines
    .map(line => {
      line = line.trim();
      // ignore empty lines & comments
      return line && !line.startsWith('#') && line.match(KEY_VALUE_REGEX);
    })
    // Remove all null & falsy matches
    .filter(match => match)
    .reduce((vars, [, key, value ]) => {
      if (value) {
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.replace(/\\n/gm, '\n');
        }

        // Trim the sourrounding quotes & spaces
        value = value.replace(TRIM_REGEX, '').trim();
      }

      vars[key] = value || '';
      return vars;
    }, {});
}

function getConfig(root, encoding) {
  const files = [ '.env' ];

  if (process.env.NODE_ENV) {
    files.push(`.env.${process.env.NODE_ENV}`);
  }

  const config = files.map(file => {
    try {
      return parse(fs.readFileSync(path.join(root, file), encoding));
    } catch (ex) {
      if (ex.code == 'ENOENT') {
        return {};
      } else {
        throw ex;
      }
    }
  });

  return Object.assign({}, ...config);
}

// Populates process.env from .env file
function config(opts = {}) {
  opts = Object.assign({}, DEFAULT_OPTS, opts);
  let vars = getConfig(opts.path, opts.encoding);

  // Assign default values if default is an object
  if (opts.defaults && typeof opts.defaults == 'object') {
    vars = Object.assign({}, opts.defaults, vars);
  }

  // Assign the variables
  for (const [ key, value ] of Object.entries(vars)) {
    if (!opts.env.hasOwnProperty(key)) {
      opts.env[key] = value;
    } else {
      console.log(`[env] Variable ${key} is already defined in env output`);
    }
  }

  return vars;
}

module.exports = new Proxy({}, {
  get(_, prop) {
    // Main functions
    if (prop == 'config') return config;
    if (prop == 'parse') return parse;

    // process.env only allows strings. So we parse the values when getting a value.
    if (process.env.hasOwnProperty(prop)) {
      const value = process.env[prop];
      const num = +value;

      if (num == value) {
        return num;
      } else if (value == 'true' || value == 'false') {
        return value == 'true';
      }
      return value;
    }
  },
  set() {
    throw new Error('Env properties are not writable');
  }
});

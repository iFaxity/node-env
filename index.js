const fs = require('fs');
const path = require('path');

const KEY_VALUE_REGEX = /^([\w.-]+)\s*=\s*(.*)$/; // key=value regex
const TRIM_REGEX = /(^['"]|['"]$)/g; // Regex for enclosing string notations

// Parses src into an Object
function parse(data) {
  const lines = data.toString().split('\n');

  return lines
  .map(line => {
    line = line.trim();
    // ignore empty lines & comments
    return !line.startsWith('#') && line && line.match(KEY_VALUE_REGEX);
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

// Populates process.env from .env file
function config(opts = {}) {
  opts = Object.assign({
    encoding: 'utf8',
    path: path.resolve(process.cwd(), '.env'),
    env: process.env,
  }, opts);

  const vars = parse(fs.readFileSync(opts.path, opts.encoding));

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
  get(obj, prop) {
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
    return null;
  },
  set(obj, prop) {
    throw new TypeError('Env properties are not writable');
  }
});

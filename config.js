const express = require('express');
const host = express();
host.get('/', (req, res) => res.send('Status: online'));
module.exports = {
  // Create corresponding environment secrets or let the defaults
  dev: process.env.developer || '858551569263755284',
  auth: process.env.token, // required
  prefix: process.env.prefix || '!',
  // Configure command names/aliases
  commands: {
    add: ['add'],
    set: ['set'],
    help: ['h','help'],
    remove: ['remove']
  },
  // Create color environment secrets (optional)
  color: {
    red: process.env.red || '#FF4D4D',
    blue: process.env.blue || '#09ACEC',
    green: process.env.green || '#50C878'
  },
  // Create emoji environment secrets (unicode emoji) [optional]
  emoji: {
    tick: process.env.check_mark || '✅',
    cross: process.env.cross_mark || '❌'
  },
  // Sets a server limit, setting status to true tells the bot to limit the number of counter channels per server
  serverlimit: {
    status: false,
    limit: 5
  },
  // Configure activity!
  activity: {
    text: '',
    type: 'watching', // options: playing, listening, watching, streaming, competing
    status: 'idle' // options: online, idle, dnd, invisible
  },
  openPort: () => host.listen(2022)
}

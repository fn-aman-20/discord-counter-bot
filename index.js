const { Client, Intents, MessageEmbed } = require('discord.js');
const Database = require('@replit/database');
const main = require('./config');
main.openPort();
const db = new Database();
const client = new Client({
  shards: 'auto',
  allowedMentions: {
    parse: [ ],
    repliedUser: false
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
// Clear database of servers the bot is no longer on and set activity/presence
client.on('ready', () => {
  const servers = client.guilds.cache.map(guild => guild.id);
  db.list().then(data => {
    for (const server of data) {
      if (!servers.includes(server)) {
        db.delete(server)
      }
    }
  })
  setInterval(() => {
    let activity = {
      name: main.activity.text || `${main.prefix.trim().length > 1 ? main.prefix + ' help' : main.prefix + 'help'}`
    }
    if (main.activity.type.toLowerCase() === 'streaming') {
      activity.type = 'STREAMING';
      activity.url = 'https://twitch.tv/nocopyrightsounds'
    } else {
      activity.type = main.activity.type.toUpperCase() || 'LISTENING'
    }
    client.user.setPresence({
      activities: [activity], status: main.activity.status.toLowerCase() || 'online'
    })
  }, 60 * 1000)
});
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(main.prefix) && message.member.permissions.has('ADMINISTRATOR') ||
  message.content.startsWith(main.prefix) && message.author.id === main.dev ||
  message.content.startsWith(`<@${client.user.id}>`) && message.member.permissions.has('ADMINISTRATOR') ||
  message.content.startsWith(`<@${client.user.id}>`) && message.author.id === main.dev) {
    const { content, author, channel, guild } = message;
    let args;
    if (content.startsWith(main.prefix)) args = content.slice(main.prefix.length).trim().split(/ +/g);
    if (content.startsWith(`<@${client.user.id}>`)) args = content.slice(client.user.id.length + 3).trim().split(/ +/g);
    if (main.commands.add.includes(args[0])) {
      let num = new RegExp(/^\d+?$/);
      if (args[1]) {
        if (!args[1].startsWith('<#') || !args[1].endsWith('>')) return;
        let mentioned = args[1].slice(2, -1);
        if (!num.test(mentioned)) return;
        try {
          if (guild.channels.cache.get(mentioned).type !== 'GUILD_TEXT') return;
        } catch {return;}
        await db.list().then(data => {
          if (data.includes(guild.id)) {
            db.get(guild.id).then(server => {
              if (main.serverlimit.status) {
                if (num.test(main.serverlimit.limit)) {
                  if (server.length === Number(main.serverlimit.limit)) return message.reply({
                    embeds: [new MessageEmbed()
                    .setColor(main.color.red)
                    .setTitle(`${main.emoji.cross} The current server has reached the maximum number of counters allowed!`)]
                  })
                }
              }
              for (const counter of server) {
                if (counter.includes(mentioned)) return message.reply({
                  embeds: [new MessageEmbed()
                  .setColor(main.color.blue)
                  .setTitle(`${main.emoji.tick} There's already a counter set for the mentioned channel, no changes were made!`)]
                })
              }
              server.push([mentioned, {
                count: 0
              }])
              db.set(guild.id, server).then(() => message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.blue)
                .setTitle(`${main.emoji.tick} Successfully set a counter for the mentioned channel!`)]
              }))
            })
          }
          else {
            db.set(guild.id, [
              [mentioned, {
                count: 0
              }]
            ]).then(() => message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.green)
              .setTitle(`${main.emoji.tick} Successfully set a counter for the mentioned channel!`)]
            }))
          }
        })
      }
      else {
        await db.list().then(data => {
          if (data.includes(guild.id)) {
            db.get(guild.id).then(server => {
              if (main.serverlimit.status) {
                if (num.test(main.serverlimit.limit)) {
                  if (server.length === Number(main.serverlimit.limit)) return message.reply({
                    embeds: [new MessageEmbed()
                    .setColor(main.color.red)
                    .setTitle(`${main.emoji.cross} The current server has reached the maximum number of counters allowed!`)]
                  })
                }
              }
              for (const counter of server) {
                if (counter.includes(channel.id)) return message.reply({
                  embeds: [new MessageEmbed()
                  .setColor(main.color.blue)
                  .setTitle(`${main.emoji.tick} There's already a counter set for this channel, no changes were made!`)]
                })
              }
              server.push([channel.id, {
                count: 0
              }])
              db.set(guild.id, server).then(() => message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.blue)
                .setTitle(`${main.emoji.tick} Successfully set a counter for this channel!`)]
              }))
            })
          }
          else {
            db.set(guild.id, [
              [channel.id, {
                count: 0
              }]
            ]).then(() => message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.green)
              .setTitle(`${main.emoji.tick} Successfully set a counter for this channel!`)]
            }))
          }
        })
      }
    }
    else if (main.commands.set.includes(args[0])) {
      let num = new RegExp(/^\d+?$/);
      if (args[1]) {
        if (args[1].startsWith('<#') && args[1].endsWith('>') && args[2]) {
          let mentioned = args[1].slice(2, -1), number = Number(args[2]);
          if (!num.test(mentioned) || !num.test(number)) return;
          try {
            if (guild.channels.cache.get(mentioned).type !== 'GUILD_TEXT') return;
          } catch {return;}
          await db.list().then(data => {
            if (!data.includes(guild.id)) return message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.red)
              .setTitle(`${main.emoji.cross} No counter found in any of your server channels! Add one with the ${main.commands.add[0]} command first!`)]
            })
            db.get(guild.id).then(server => {
              let Channel = [], ChannelIndex = 0;
              for (const counter of server) {
                if (counter.includes(mentioned)) {
                  Channel = counter;
                  ChannelIndex = server.indexOf(counter);
                  break;
                }
              }
              if (Channel.length === 0) return message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.red)
                .setTitle(`${main.emoji.cross} There's no counter set for the mentioned channel! Add one with the ${main.commands.add[0]} command first!`)]
              })
              Channel[1].count = number;
              server[ChannelIndex] = Channel;
              db.set(guild.id, server).then(() => message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.blue)
                .setTitle(`${main.emoji.tick} Successfully updated the counter for the mentioned channel!`)]
              }))
            })
          })
        }
        else {
          if (!num.test(Number(args[1]))) return;
          await db.list().then(data => {
            if (!data.includes(guild.id)) return message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.red)
              .setTitle(`${main.emoji.cross} No counter found in any of your server channels! Add one with the ${main.commands.add[0]} command first!`)]
            })
            db.get(guild.id).then(server => {
              let Channel = [], ChannelIndex = 0;
              for (const counter of server) {
                if (counter.includes(channel.id)) {
                  Channel = counter;
                  ChannelIndex = server.indexOf(counter);
                  break;
                }
              }
              if (Channel.length === 0) return message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.red)
                .setTitle(`${main.emoji.cross} There's no counter set for this channel! Add one with the ${main.commands.add[0]} command first!`)]
              })
              Channel[1].count = Number(args[1]);
              server[ChannelIndex] = Channel;
              db.set(guild.id, server).then(() => message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.blue)
                .setTitle(`${main.emoji.tick} Successfully updated the counter for this channel!`)]
              }))
            })
          })
        }
      }
      else {
        await message.reply({
          embeds: [new MessageEmbed()
          .setColor(main.color.red)
          .setTitle(`${main.emoji.cross} Improper usage!`)
          .addField('Proper Usage', `\`\`\`js\n${main.prefix}${main.commands.set[0]} <number>\n${main.prefix}${main.commands.set[0]} <mention_channel> <number>\n\`\`\``)]
        })
      }
    }
    else if (main.commands.remove.includes(args[0])) {
      if (args[1]) {
        if (!args[1].startsWith('<#') || !args[1].endsWith('>')) return;
        let mentioned = args[1].slice(2, -1), num = new RegExp(/^\d+?$/);
        if (!num.test(mentioned)) return;
        try {
          if (guild.channels.cache.get(mentioned).type != 'GUILD_TEXT') return;
        } catch {return;}
        await db.list().then(data => {
          if (!data.includes(guild.id)) return message.reply({
            embeds: [new MessageEmbed()
            .setColor(main.color.red)
            .setTitle(`${main.emoji.cross} No counter found in any of your server channels! Add one with the ${main.commands.add[0]} command first!`)]
          })
          db.get(guild.id).then(server => {
            let ChannelIndex = '';
            for (const counter of server) {
              if (counter.includes(mentioned)) {
                ChannelIndex = server.indexOf(counter);
                break;
              }
            }
            if (ChannelIndex === '') return message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.red)
              .setTitle(`${main.emoji.cross} There's no counter set for the mentioned channel! Add one with the ${main.commands.add[0]} command first!`)]
            })
            server.splice(ChannelIndex, 1);
            db.set(guild.id, server).then(() => message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.green)
              .setTitle(`${main.emoji.tick} Deleted the counter of the mentioned channel!`)]
            }))
          })
        })
      }
      else {
        await db.list().then(data => {
          if (!data.includes(guild.id)) return message.reply({
            embeds: [new MessageEmbed()
            .setColor(main.color.red)
            .setTitle(`${main.emoji.cross} No counter found in any of your server channels! Add one with the ${main.commands.add[0]} command first!`)]
          })
          db.get(guild.id).then(server => {
            let ChannelIndex = '';
            for (const counter of server) {
              if (counter.includes(channel.id)) {
                ChannelIndex = server.indexOf(counter);
                break;
              }
            }
            if (ChannelIndex === '') return message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.red)
              .setTitle(`${main.emoji.cross} There's no counter set for this channel! Add one with the ${main.commands.add[0]} command first!`)]
            })
            server.splice(ChannelIndex, 1);
            db.set(guild.id, server).then(() => message.reply({
              embeds: [new MessageEmbed()
              .setColor(main.color.green)
              .setTitle(`${main.emoji.tick} Deleted the counter of this channel!`)]
            }))
          })
        })
      }
    }
    else if (main.commands.help.includes(args[0])) {
      await message.reply({
        embeds: [new MessageEmbed()
        .setColor(main.color.blue)
        .setTitle('Admin Commands')
        .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
        .addField(`${main.prefix.length > 1 ? main.prefix + ' ' + main.commands.add[0] : main.prefix + main.commands.add[0]}`, 'Adds a counter to the current or mentioned channel')
        .addField(`${main.prefix.length > 1 ? main.prefix + ' ' + main.commands.set[0] : main.prefix + main.commands.set[0]}`, 'Updates the counter of the current or mentioned channel')
        .addField(`${main.prefix.length > 1 ? main.prefix + ' ' + main.commands.remove[0] : main.prefix + main.commands.remove[0]}`, 'Deletes the counter of the current or mentioned channel')
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.member.user.displayAvatarURL({dynamic:true})
        })
        .setTimestamp()]
      })
    }
    // Developer only command! {prefix}cleardb <all [optional + risky(clears the entire database)]>
    else if (args[0].toLowerCase() === 'cleardb' && author.id === main.dev) {
      if (args[1]) {
        if (args[1].toLowerCase() !== 'all') return;
        await db.list().then(data => {
          let keys = data.length;
          for (let i = 0; i < keys; i++) {
            db.delete(data[i])
          }
          message.delete().then(() => channel.send({
            embeds: [new MessageEmbed()
            .setColor(main.color.green)
            .setTitle(`${main.emoji.tick} Deleted ${keys} key${keys.length > 1 ? 's' : ''} and cleared the database!`)]
          }).then(msg => {
            setTimeout(() => msg.delete(), 5 * 1000)
          }))
        })
      }
      else {
        await db.list().then(data => {
          if (!data.includes(guild.id)) return message.delete().then(() => channel.send({
            embeds: [new MessageEmbed()
            .setColor(main.color.red)
            .setTitle(`${main.emoji.cross} Server not found!`)]
          }).then(msg => {
            setTimeout(() => msg.delete(), 5 * 1000)
          }))
          db.delete(guild.id).then(() => message.delete().then(() => channel.send({
            embeds: [new MessageEmbed()
            .setColor(main.color.green)
            .setTitle(`${main.emoji.tick} Cleared the current server's data!`)]
          }).then(msg => {
            setTimeout(() => msg.delete(), 5 * 1000)
          })))
        })
      }
    }
  }
  else {
    let number = Number(message.content.trim().split(/ +/g)[0]), num = new RegExp(/^\d+?$/);
    if (!num.test(number)) return;
    const { author, channel, guild } = message;
    await db.list().then(data => {
      if (!data.includes(guild.id)) return;
      db.get(guild.id).then(server => {
        for (const counter of server) {
          if (counter.includes(channel.id)) {
            let index = server.indexOf(counter);
            if (!counter[1].author) counter[1].author = '';
            let next_num = counter[1].count + 1;
            if (author.id === counter[1].author || number !== next_num) {
              counter[1].count = 0;
              delete counter[1].author;
              server[index] = counter;
              db.set(guild.id, server).then(() => message.reply({
                embeds: [new MessageEmbed()
                .setColor(main.color.red)
                .setTitle(`${main.emoji.cross} You messed up! everybody would have to start again :weary:`)]
              }).then(() => message.react(main.emoji.cross)))
            }
            else if (number === next_num) {
              counter[1].count = next_num;
              counter[1].author = author.id;
              server[index] = counter;
              db.set(guild.id, server).then(() => message.react(main.emoji.tick))
            }
            return;
          }
        }
      })
    })
  }
});
client.login(main.auth);

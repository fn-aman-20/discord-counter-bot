# Discord Counter Bot
* For Replit only
* Inspired by the counting bot on top.gg
* This bot keeps a count of numbers sent by the users in your server channels!
* Requirements: `discord.js 13.8.1+`, `node v16.6+`

## Features
* Uses Replit database
* Automatically deletes data of those servers the bot is no longer on
* Additional command: `set` if someone knowingly interupts the counter
* Can have multiple counter channels set for a server alongwith counter limits

## Installation
* Copy the URL of this repo
* Go to Replit, hit create a new repl, choose to import from GitHub and paste the copied URL
* Once the repl is loaded configure the `config.js` file and it's done! Necessary details have been commented
* If you don't see the packages option in your repl, it's an indication that your repl would tend to misbehave; Create a new one and make sure that the `.config` folder appears when you hit `show hidden files`

## Keeping It Online, 24/7
* Create a new freshping account if you don't have one
* Copy the URL that shows up above the 'Status: online' message in your repl it should look like: `https://repl_name.your_replit_username.repl.co/`
* Finally go to your freshping dashboard, create a new check, paste the URL and set the check interval to 1min and hit save. It's all set now, you may need to start your bot manually 1 - 2 times a week
* Note that you just need a good service that would ping your repl every 1min or atleast 5min and it not necessarily has to be freshping

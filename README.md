# Discord Minecraft Server Manager

discord-minecraft-server-manager allows you to remotly start and stop your minecraft server from discord. It also displays the server status and other information and stops the server automatically if it’s been empty for a configurable amount of time.

## Install

    git clone https://github.com/alberto467/discord-minecraft-server-manager.git
    cd discord-minecraft-server-manager
    yarn install
    mkdir build
    npm run build

You’ll also need to inject the necessary environmental variables, you can simply create a .env file in the project root, copying [.env.example](.env.example).

## Run

You can simply run the bot with:

    npm run start

But it is raccomended to use a tool like [pm2](https://www.npmjs.com/package/pm2), which manages the logs and keeps the bot online (the [ecosystem config file](ecosystem.config.js) for pm2 is already provided).

    pm2 start

## Bot commands

### Start command

    /start

### Stop command

    /stop

### Set the auto shutdown time

    /config autoShutdownTime <ms>

If zero or a negative number is provided, the auto shutdown is disabled.

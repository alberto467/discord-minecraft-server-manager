module.exports = {
  apps: [ {
    name: 'discord-minecraft-server-manager',
    script: './build/index.js',

    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {},
    env_development: { NODE_ENV: 'development' },
    env_production: { NODE_ENV: 'production' }
  } ]
}

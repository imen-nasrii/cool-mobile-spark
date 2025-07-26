module.exports = {
  apps: [{
    name: 'tomati-market',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    
    // Variables d'environnement
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logs
    error_file: '/var/log/pm2/tomati-error.log',
    out_file: '/var/log/pm2/tomati-out.log',
    log_file: '/var/log/pm2/tomati-combined.log',
    time: true,
    
    // Redémarrage automatique
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',
    
    // Gestion erreurs
    min_uptime: '10s',
    max_restarts: 5,
    
    // Monitoring
    monitoring: false
  }]
}
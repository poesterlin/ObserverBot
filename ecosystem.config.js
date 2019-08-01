module.exports = {
  apps: [{
    name: 'Observer',
    script: 'build/index.js',
    args: '',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production'
    },
    "post-deploy": "npm install && npm run compile"
  }],
  deploy: {}
};

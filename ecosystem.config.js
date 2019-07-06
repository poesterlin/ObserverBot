module.exports = {
    apps : [{
      name: 'Observer',
      script: 'build/index.js',
      args: '',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
    }],
    deploy: {}
  };
  
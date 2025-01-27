const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        },
        onError: (err, req, res) => {
          console.log('代理错误:', err);
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log('代理请求:', req.method, req.url);
        }
      }
    }
  }
})

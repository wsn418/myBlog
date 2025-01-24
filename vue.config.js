const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
        onProxyReq(proxyReq, req, res) {
          console.log('代理请求:', req.method, req.url)
        },
        onProxyRes(proxyRes, req, res) {
          console.log('代理响应:', proxyRes.statusCode, req.url)
        },
        onError(err, req, res) {
          console.error('代理错误:', err)
        }
      }
    }
  }
})

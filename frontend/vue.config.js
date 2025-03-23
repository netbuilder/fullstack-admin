const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true)
      }),
      new webpack.EnvironmentPlugin({
        "CLOUDINARY_CLOUD_NAME": "",
        "CLOUDINARY_API_KEY": "",
        "CLOUDINARY_API_SECRET": ""
        // "CLOUDINARY_CLOUD_NAME": JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
        // "CLOUDINARY_API_KEY": JSON.stringify(process.env.CLOUDINARY_API_KEY),
        // "CLOUDINARY_API_SECRET": JSON.stringify(process.env.CLOUDINARY_API_SECRET)
      })
    ]
  }
})

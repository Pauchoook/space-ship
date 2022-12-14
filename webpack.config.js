const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let mode = 'development';

if (process.env.NODE_ENV === 'production') {
   mode = 'production';
}

module.exports = {
   mode,
   entry: './src/index.js',
   
   output: {
      path: path.resolve(__dirname, 'dist'),
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true
   },

   devServer: {
      hot: true,
      open: true
   },

   plugins: [
      new HtmlWebpackPlugin({
         template: './src/index.html'
      }),
      new MiniCssExtractPlugin({
         filename: '[name].[contenthash].css'
      })
   ],

   module: {
      rules: [
         {
            test: /\.(html)$/,
            use: ['html-loader']
         },
         {
            test: /\.(s[ac]|c)ss$/i,
            use: [
               MiniCssExtractPlugin.loader,
               'css-loader',
               'postcss-loader',
               'sass-loader'
            ]
         },
         {
            test: /\.(png|jpe?g|gif|mp3|svg|webp|ico)$/i,
            type: mode === 'production' ? 'asset' : 'asset/resource', // В продакшен режиме
         },
         {
            test: /\.(woff2?|eot|ttf|otf)$/i,
            type: 'asset/resource',
         },
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
               options: {
                  cacheDirectory: true
               }
            }
         }
      ]
   }
}
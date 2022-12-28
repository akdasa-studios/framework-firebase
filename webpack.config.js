// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: './lib/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    library: {
      type: 'commonjs',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@lib': path.resolve(__dirname, './lib'),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  externals: {
    '@akdasa-studios/framework': {
      commonjs: '@akdasa-studios/framework',
      commonjs2: '@akdasa-studios/framework',
      amd: '@akdasa-studios/framework',
      root: '@akdasa-studios/framework',
    },
    uuid: {
      commonjs: 'uuid',
      commonjs2: 'uuid',
      amd: 'uuid',
      root: 'uuid',
    },
    firebase: {
      commonjs: 'firebase',
      commonjs2: 'firebase',
      amd: 'firebase',
      root: 'firebase',
    },
    'firebase/util': {
      commonjs: 'firebase/util',
      commonjs2: 'firebase/util',
      amd: 'firebase/util',
      root: 'firebase/util',
    },
    'firebase/app': {
      commonjs: 'firebase/app',
      commonjs2: 'firebase/app',
      amd: 'firebase/app',
      root: 'firebase/app',
    },
    'firebase/firestore': {
      commonjs: 'firebase/firestore',
      commonjs2: 'firebase/firestore',
      amd: 'firebase/firestore',
      root: 'firebase/firestore',
    },
  },
}
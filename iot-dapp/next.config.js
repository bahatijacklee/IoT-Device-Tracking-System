/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lit/reactive-element/development/reactive-element.js': '@lit/reactive-element/reactive-element.js',
      'lit/development/index.js': 'lit/index.js',
      'lit-element/development/lit-element.js': 'lit-element/lit-element.js',
      'lit-html/development/lit-html.js': 'lit-html/lit-html.js'
    };

    // Add cache configuration
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    };

    return config;
  },
  transpilePackages: [
    '@walletconnect/modal-ui',
    '@lit/reactive-element',
    'lit-html',
    'lit-element',
    'lit'
  ],
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Enable module/page optimization
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      '@walletconnect/modal-ui'
    ]
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
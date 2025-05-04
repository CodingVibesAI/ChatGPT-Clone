module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-gfm|rehype-highlight|devlop|hast-util-to-jsx-runtime|hast-util-[^/]+|micromark|vfile|unified|remark-[^/]+|rehype-[^/]+|mdast-util-[^/]+|unist-util-[^/]+|bail|is-plain-obj|trough|decode-named-character-reference|character-entities|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|ccount|direction|longest-streak|zwitch|markdown-table|parse-entities|stringify-entities|trim-lines)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
} 
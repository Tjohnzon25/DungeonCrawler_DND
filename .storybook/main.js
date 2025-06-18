module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/preset-create-react-app'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
}

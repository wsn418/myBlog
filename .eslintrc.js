module.exports = {
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off'
  },
  globals: {
    defineOptions: 'readonly'
  }
} 
module.exports = {
  // 其他配置
  "overrides": [
      {
          "files": ["src/**/*.{js,vue,jsx}"], // 只校验 src 文件夹中的文件
          // 这里可以添加针对 src 文件夹的特定规则
          "rules": {
              // "no-console": "warn", // 示例规则
          }
      }
  ]
};

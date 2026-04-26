# swag-gin-demo

在终端中依次执行以下命令：

```bash
cd swag-gin-demo

# 安装 swag 命令行工具（如果你还没安装的话）
go install github.com/swaggo/swag/cmd/swag@latest
```

生成 Swagger 文档并运行

在终端中执行以下命令生成文档（每次修改了注释，都需要重新执行 `swag init`）：

```bash
# 生成 docs 文件夹及 swagger 的配置文件
swag init

# 运行你的程序
go run main.go
```

验证效果：

1. 打开浏览器访问：[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)
2. 你会看到 Swagger 的界面，页面右上方会有一个绿色的 **Authorize** 按钮（表示成功识别到了 `@securityDefinitions.apikey`）。
3. 展开 `/api/v1/secure/data` 接口，点击 `Try it out` 然后点击 `Execute`。因为此时没有鉴权，你会收到一个 `401` 响应：`Unauthorized: 无效的 API Key`。
4. 点击右上角的 **Authorize** 按钮，在弹出的输入框中输入我们代码里预设的秘钥：`my-secret-token`，点击 **Authorize** 保存然后点击 **Close**。
5. 再次对 `/api/v1/secure/data` 接口点击 `Execute`，此时 Swagger 会自动在 HTTP Request Header 中带上 `Authorization: my-secret-token`，你将成功获取到响应码 `200` 及机密数据内容。

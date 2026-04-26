package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	// 导入由 swag init 自动生成的 docs 包
	// 这里的路径需要和你的 go.mod 中的 module 名称保持一致
	_ "swag-gin-demo/docs"
)

// @title           Gin Swagger Example API
// @version         1.0
// @description     这是一个展示如何使用 ApiKeyAuth 的示例项目。

// @host      localhost:8080
// @BasePath  /api/v1

// 这里的注释非常关键，定义了全局的安全认证机制
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

// @securityDefinitions.apikey AppKeyAuth
// @in header
// @name X-APP-KEY

// @securityDefinitions.apikey AppSecretAuth
// @in header
// @name X-APP-SECRET
func main() {
	r := gin.Default()

	// 注册 Swagger UI 路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API 路由组
	v1 := r.Group("/api/v1")
	{
		// 公开接口，不需要 API Key
		v1.GET("/ping", PingHandler)

		// 私密接口路由组，应用鉴权中间件
		secure := v1.Group("/secure")
		secure.Use(AuthMiddleware())
		{
			secure.GET("/data", SecureDataHandler)
		}
	}

	// 启动服务
	r.Run(":8080")
}

// PingHandler
// @Summary      心跳测试 (公开)
// @Description  返回 pong 消息，无需鉴权
// @Tags         Public
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /ping [get]
func PingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

// SecureDataHandler
// @Summary      获取私密数据 (受保护)
// @Description  需要提供 Header 中的 Authorization 才能访问
// @Tags         Secure
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Security     ApiKeyAuth
// @Router       /secure/data [get]
func SecureDataHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": "这是一条被保护的顶级机密数据！"})
}

// AuthMiddleware 是一个简单的中间件，用于校验 API Key
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取 Header 中的 Authorization 值
		token := c.GetHeader("Authorization")

		// 这里为了演示，硬编码了一个正确的 token 值为 "my-secret-token"
		// 实际项目中可以是从数据库或 Redis 中校验
		if token != "my-secret-token" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: 无效的 API Key"})
			// 终止当前请求
			c.Abort()
			return
		}

		// 鉴权通过，继续执行后续逻辑
		c.Next()
	}
}

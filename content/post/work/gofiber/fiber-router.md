---
title: "解析Fiber路由管理"
date: 2020-06-23T13:18:48+08:00
lastmod: 2020-06-30T10:26:46+08:00
tags: [golang, gofiber, web]
categories: [golang, web]
draft: true
---
本文主要通过阅读[Fiber](https://github.com/gofiber/fiber)源码，解析`Fiber`是如何管理路由的：
1. 路由注册
1. 路由匹配

> 环境：macos 10.15.4 + go 1.14.1 + fiber [1.12.1](https://github.com/gofiber/fiber/tree/v1.12.1)

## 路由注册
### 路由结构和路由器接口
首先看一下路由的结构([源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L37-L53))：

```go
// Route 存放了注册处理器的元数据
type Route struct {
	pos         int         // 路由栈中的位置
	use         bool        // 匹配路由前缀（中间件）
	star        bool        // 路由路径为'*'
	root        bool        // 路由路径为'/'
	path        string      // 美化的路由路径
	routeParser routeParser // 路由解析器
	routeParams []string    // 大小写敏感的参数 key

	Name     string    // 路由第一个处理器的名称
	Path     string    // 原始注册路由路径
	Method   string    // HTTP method
	Handlers []Handler // 所有处理器
}
```

以及路由器接口的定义([源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L16-L35))：

```go
type Router interface {
	// 注册中间件
	Use(args ...interface{}) *Route

	Get(path string, handlers ...Handler) *Route
	Head(path string, handlers ...Handler) *Route
	Post(path string, handlers ...Handler) *Route
	Put(path string, handlers ...Handler) *Route
	Delete(path string, handlers ...Handler) *Route
	Connect(path string, handlers ...Handler) *Route
	Options(path string, handlers ...Handler) *Route
	Trace(path string, handlers ...Handler) *Route
	Patch(path string, handlers ...Handler) *Route

	Add(method, path string, handlers ...Handler) *Route
	Static(prefix, root string, config ...Static) *Route
	All(path string, handlers ...Handler) []*Route
	// 路由组，有处理器时注册成中间件
	Group(prefix string, handlers ...Handler) *Group
}
```

[App](https://github.com/gofiber/fiber/blob/v1.12.1/app.go#L45-L58)和[Group](https://github.com/gofiber/fiber/blob/v1.12.1/group.go#L12-L16)结构都实现了`Router`接口，它们的`Get`、`Head`、`Post`、`Put`、`Delete`、`Connect`、`Options`、`Trace`和`Patch`方法是`Add`方法的别名。`App`的`Add`方法其实也是对`register`方法的封装，而`Group`的实现只是组装了路由路径，再直接调用`App`的相关方法。

### `App`的注册方法
我们先看`func (app *App) register(method, pathRaw string, handlers ...Handler) *Route`方法([源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L138-L216))：

```go
func (app *App) register(method, pathRaw string, handlers ...Handler) *Route {
	// 一些检测工作
	// pathPretty 会根据 pathRaw 做一些额外的路径处理：大小写转换，清除后缀'/'等
	pathPretty := pathRaw
	// ...
	// 是不是中间件
	var isUse = method == "USE"
	// 是否通配符
	var isStar = pathPretty == "/*"
	// 是否根路径
	var isRoot = pathPretty == "/"
	// 解析路由路径
	var parsedRaw = parseRoute(pathRaw)
	var parsedPretty = parseRoute(pathPretty)

	// 增加全局的路由位置
	app.mutex.Lock()
	app.routes++
	app.mutex.Unlock()
	// 创建路由元数据
	route := &Route{
		pos:  app.routes,
		use:  isUse,
		star: isStar,
		root: isRoot,
		path:        pathPretty,
		routeParser: parsedPretty,
		routeParams: parsedRaw.params,
		Path:     pathRaw,
		Method:   method,
		Handlers: handlers,
	}
	// 假如是中间件，则为每种 HTTP methods 栈都追加路由
	if isUse {
		for m := range methodINT {
			app.addRoute(m, route)
		}
		return route
	}

	// 假如是 GET 方法，则补上 HEAD 方法
	if method == MethodGet {
		app.addRoute(MethodHead, route)
	}

	// 追加到路由栈
	app.addRoute(method, route)

	return route
}
```

我们稍微分析一下`register`做了什么事情：
1. 一些检测工作，`method`参数是否合法，`handlers`是否为空，补全路由路径等
1. 创建`pathPretty`，它是`pathRaw`的副本，然后做一些额外的路径处理：根据配置转换大小写；根据严格模式清除后缀`/`
1. 生成路由元数据，其中解析路由路径这个操作会在[后面](#解析路由路径)详细分析
1. 根据`isUse`判断是否为中间件，是的话，给每个`HTTP Methods`栈追加路由，并直接返回路由对象
1. 若`method`是`GET`方法，则为`HEAD`路由栈追加同样的路由
1. 给指定的`method`路由栈追加路由

这样，一个路由注册工作就完成了，非常直接了当。

### `Group`的`Add`方法
接下来我们看一下`Group`的`Add`方法实现：

```go
func (grp *Group) Add(method, path string, handlers ...Handler) *Route {
	return grp.app.register(method, getGroupPath(grp.prefix, path), handlers...)
}
```

非常简单，使用`getGroupPath`重新组装`path`，调用`App`的`register`方法。`getGroupPath`方法的实现也很简单：

```go
func getGroupPath(prefix, path string) string {
	if path == "/" {
		return prefix
	}
	// 清除 prefix 的'/'后缀，再拼接 path
	return utils.TrimRight(prefix, '/') + path
}
```

### 解析路由路径
解析路由路径的工作，单独放在了[path](https://github.com/gofiber/fiber/blob/v1.12.1/path.go)文件中，我们先来看看核心的`routeParser`和`paramSeg`结构：

```go
// routeParser 保存了路径 segments 和参数名称
type routeParser struct {
	segs   []paramSeg
	params []string
}

// paramsSeg 保存了每个段的元数据
type paramSeg struct {
	Param      string	// 参数名
	Const      string	// 常量字符串
	IsParam    bool		// 是否参数
	IsOptional bool		// 是否可选
	IsLast     bool		// 是否最后一个段
	EndChar    byte		// 终止字符，是'/'， '-'， '.'的其中一个，默认为'/'
}
```

我们再从上述注册方法中使用的`func parseRoute(pattern string) (p routeParser)`方法([源码](https://github.com/gofiber/fiber/blob/v1.12.1/path.go#L38-L95))开始分析，再以`/api/v1/:year-:month.:day/*/:param?`当参数，作为例子讲解：

- 找到匹配串`/`，这是一个特殊情况，`pattern`变为`api/v1/:year-:month.:day/*/:param?`
- 找到匹配串`api/`，这是一个常量匹配串，所以生成一个常量`segment`，常量`Const`字段为`api`，终止字符为`/`，`pattern`变为`v1/:year-:month.:day/*/:param?`
- 找到匹配串`v1/`，这是一个常量匹配串，且上一个`segment`是常量类型，所以追加`/v1`到上一个`segment`的`Const`字段中，`pattern`变为`:year-:month.:day/*/:param?`
- 找到匹配串`:year-`，`:`开头，所以这个`segment`是一个参数，参数名为`year`，终止字符为`-`，`pattern`变为`:month.:day/*/:param?`
- 找到匹配串`:month.`，`:`开头，所以这个`segment`是一个参数，参数名为`month`，终止字符为`.`，`pattern`变为`:day/*/:param?`
- 找到匹配串`:day/`，`:`开头，所以这个`segment`是一个参数，参数名为`day`，终止字符为`/`，`pattern`变为`*/:param?`
- 找到匹配串`*/`，`*`开头，所以这个`segment`是一个参数，而且可选(`*`是通配符)，参数名为`*`，终止字符为`/`，`pattern`变为`:param?`
- 找不到分隔符，剩余的`pattern`作为匹配串，即`:param?`，`:`开头，所以这个`segment`是一个参数，`?`结尾，所以这个`segment`也是可选的，参数名为`param`，因为接下来`pattern`已经没有了，所以终止字符使用默认值`/`，且这个`segment`的`IsLast`字段标记为`true`

最终的`routeParser`结果为：

```
segs: [
{Param:"" Const:"api/v1" IsParam:false IsOptional:false IsLast:false EndChar:'/'},
{Param:"year" Const:"" IsParam:true IsOptional:false IsLast:false EndChar:'-'},
{Param:"month" Const:"" IsParam:true IsOptional:false IsLast:false EndChar:'.'},
{Param:"day" Const:"" IsParam:true IsOptional:false IsLast:false EndChar:'/'},
{Param:"*" Const"": IsParam:true IsOptional:true IsLast:false EndChar:'/'},
{Param:"param" Const"": IsParam:true IsOptional:true IsLast:true EndChar:'/}
]
params:[year month day * param]
```

### 总结
路由注册到这里就差不多了，我们可以看到主要的工作就是解析路由路径，保存好元数据，供路由匹配使用。其实还剩下静态资源路由注册`registerStatic`没讲，它封装了`fasthttp`的相关方法，有兴趣的同学可以自行查看[源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L218-L320)。

## 路由匹配
每当`Http`请求到达后，会由`fasthttp`解析，`Fiber`将`rctx *fasthttp.RequestCtx`包装为[Fiber.Ctx](https://github.com/gofiber/fiber/blob/v1.12.1/ctx.go#L33-L46)对象，由`app.next`处理（详见[源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L119-L125)）。没有匹配的路由，则尝试设置`Method Not Allowed 405`状态码（详见[源码](https://github.com/gofiber/fiber/blob/v1.12.1/router.go#L130-L133)）。

`app.next`是处理的核心：

```go
func (app *App) next(ctx *Ctx) bool {
	// TODO set unique INT within handler(), not here over and over again
	method := methodINT[ctx.method]
	// 路由栈长度
	lenr := len(app.stack[method]) - 1
	// 从上一个索引开始循环路由栈
	for ctx.indexRoute < lenr {
		// 增加路由索引，初始为-1
		ctx.indexRoute++
		route := app.stack[method][ctx.indexRoute]
		// 检查路由是否匹配请求路径
		match, values := route.match(ctx.path, ctx.pathOriginal)
		// 未匹配则继续查找
		if !match {
			continue
		}
		// 设置路由对象和路由路径参数对应的值
		ctx.route = route
		ctx.values = values
		// 执行路由的第一个处理器
		ctx.indexHandler = 0
		route.Handlers[0](ctx)
		// 停止扫描路由栈
		return true
	}
	// 默认设置 404 状态码
	ctx.SendStatus(404)
	ctx.SendString("Cannot " + ctx.method + " " + ctx.pathOriginal)
	return false
}
```

我们看看`next`做了什么事：
- 找到请求的`method`方法对应的路由栈
- 遍历路由栈，检查路由是否匹配请求路径，详细匹配过程见[下文](#匹配请求路径)
- 匹配成功，为`ctx`设置路由对象和路由路径参数对应的值
- 执行该路由的第一个处理器
- 处理器中调用了`ctx.Next()`的话，可能[继续](https://github.com/gofiber/fiber/blob/v1.12.1/ctx.go#L615)遍历路由栈

### 匹配请求路径
接下来让我们瞅瞅路由如何去匹配请求路径：

```go
func (r *Route) match(path, original string) (match bool, values []string) {
	// 根路径匹配
	if r.root && path == "/" {
		return true, values
		// 通配符匹配
	} else if r.star {
		values := getAllocFreeParams(1)
		values[0] = original[1:]
		return true, values
	}
	// 路由包含参数时
	if len(r.routeParams) > 0 {
		// 匹配参数
		if paramPos, match := r.routeParser.getMatch(path, r.use); match {
			// 从源路径中解析出参数值
			return match, r.routeParser.paramsForPos(original, paramPos)
		}
	}
	// 是否中间件
	if r.use {
		// 根路由或者路由路径是请求路径的前缀
		if r.root || strings.HasPrefix(path, r.path) {
			return true, values
		}
		// 路由路径和请求路径相同
	} else if len(r.path) == len(path) && r.path == path {
		return true, values
	}
	// 不匹配
	return false, values
}
```

路由匹配函数的匹配过程如下：
1. 匹配根路径`/`
1. 通配符路径`/*`，参数`*`的值就是源路径的去掉首字符`original[1:]`
1. 路由包含参数的话，使用解析器[匹配](#路由参数匹配)参数位置，匹配时，从源路径获取参数对应的值
1. 中间件路由的情况下，根路由或者路由路径是请求路径的前缀也算匹配，例如`/api`匹配`/api/v1`
1. 否则检查路径是否相等

### 路由参数匹配
带参数的路由匹配`func (p *routeParser) getMatch(s string, partialCheck bool) ([][2]int, bool)`方法，是最复杂的部分，我们单独拎出来讲，代码不贴了，详见[源码](https://github.com/gofiber/fiber/blob/v1.12.1/path.go#L109-L169)：

- 根据参数数量，获取预分配内存的参数位置切片
- 遍历`routeParser`中所有的`segment`
- `partLen = len(s)`获取需要匹配的请求路径长度
- 先看常量类型的`segment`匹配：
    - `i = len(segment.Const)`获取常量字符串长度
    - `partLen < i || (i == 0 && partLen > 0)`先匹配长度
    - `s[:i] != segment.Const`匹配常量字符串值
    - `(partLen > i && s[i] != segment.EndChar)`匹配终止符
    - 若以上不匹配，则直接返回
- 再看参数类型的`segment`匹配，目标是计算出参数长度：
    - 通配符参数
        - 当前`segment`是最后一个时，参数长度为剩余请求路径长度
        - 从右向左贪婪匹配([源码](https://github.com/gofiber/fiber/blob/v1.12.1/path.go#L186-L213))最长的字符串长度，当作参数长度
    - 非通配符参数，根据当前`segment`的终止符查找
    - 

```go
// getMatch parses the passed url and tries to match it against the route segments and determine the parameter positions
func (p *routeParser) getMatch(s string, partialCheck bool) ([][2]int, bool) {
	lenKeys := len(p.params)
	paramsPositions := getAllocFreeParamsPos(lenKeys)
	var i, j, paramsIterator, partLen, paramStart int
	if len(s) > 0 {
		s = s[1:]
		paramStart++
	}
	for index, segment := range p.segs {
		partLen = len(s)
		// check parameter
		if segment.IsParam {
			// determine parameter length
			if segment.Param == wildcardParam {
				if segment.IsLast {
					i = partLen
				} else {
					i = findWildcardParamLen(s, p.segs, index)
				}
			} else {
				i = strings.IndexByte(s, segment.EndChar)
			}
			if i == -1 {
				i = partLen
			}

			if !segment.IsOptional && i == 0 {
				return nil, false
				// special case for not slash end character
			} else if i > 0 && partLen >= i && segment.EndChar != '/' && s[i-1] == '/' {
				return nil, false
			}

			paramsPositions[paramsIterator][0], paramsPositions[paramsIterator][1] = paramStart, paramStart+i
			paramsIterator++
		} else {
			// check const segment
			i = len(segment.Const)
			if partLen < i || (i == 0 && partLen > 0) || s[:i] != segment.Const || (partLen > i && s[i] != segment.EndChar) {
				return nil, false
			}
		}

		// reduce founded part from the string
		if partLen > 0 {
			j = i + 1
			if segment.IsLast || partLen < j {
				j = i
			}
			paramStart += j

			s = s[j:]
		}
	}
	if len(s) != 0 && !partialCheck {
		return nil, false
	}

	return paramsPositions, true
}
```

## 其他
`Fiber`作者[Fenny](https://github.com/Fenny)关于为什么不使用[基数树](https://en.wikipedia.org/wiki/Radix_tree)管理路由的回答：

> We discussed using a radix tree, but we would lose the stack order flexibility (like express has).
>
> Another thing I would like to mention which is misconception by many, the performance of decent routers will not impact your application.
>
> When you have 10,000 routes, you still talking about nano seconds. If you have a database query in one of your handlers, the performance of the router would not matter anymore. 
>
> However, we made sure our router is :100: regarding allocation and performance. And [@René](https://github.com/ReneWerner87) did an awesome job to replicate most key features of the expressjs path behaviour.
>
> Which makes routes like /api/*/:param/:param2 ~> /api/joker/batman/robin/2/1 possible, only in Fiber.

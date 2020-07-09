---
title: "gofiber中的性能优化"
date: 2020-07-09T15:41:24+08:00
lastmod: 2020-07-09T15:41:24+08:00
tags: [golang, gofiber]
categories: [golang, performance]
draft: true
---
[Fiber](https://docs.gofiber.io/)是基于[fasthttp](https://github.com/valyala/fasthttp)的`web`框架。`fasthttp`有不少[优化技巧](https://github.com/valyala/fasthttp#fasthttp-best-practices)和[[]byte缓存使用技巧](https://github.com/valyala/fasthttp#tricks-with-byte-buffers)。

`Fiber`中也有一些性能优化的小技巧。

> 环境：macos 10.15.4 + go 1.14.4 + fiber [1.12.5](https://github.com/gofiber/fiber/tree/v1.12.5)

## map vs switch

## 预分配内存

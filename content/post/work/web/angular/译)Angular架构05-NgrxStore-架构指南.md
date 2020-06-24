---
title: (译)Angular架构05-`Ngrx Store`-架构指南
tags: [angular, architecture, ngrx]
categories: [web, angular]
date: 2018-10-17 13:27:04
comment: true
draft: true
---
这篇文章是正在进行的`Angular`架构系列的一部分，我们将在视图层和服务层一级介绍常见的设计问题和解决方案。 这是完整系列：
- 视图层架构-智能组件与展示组件
- 视图层架构-容器与展示组件常见的设计缺陷
- 服务层架构-如何使用`Observable`数据服务构建`Angular`应用程序
- 服务层架构-`Redux`和`Ngrx Store`-何时使用`Store`？为什么？
- 服务层架构-`Ngrx Store`-架构指南

<!-- more -->
## `Angular`的`Store`架构
你有没有想过使用集中存储解决方案构建应用程序有什么好处，无论是在`Angular`还是在任何框架中？

我们经常直接进入`action`，`reducer`和`store`架构的相关术语，但这些概念（虽然必不可少）只是达到目的的手段。

集中式存储架构实际上是一组应用程序设计模式，因此最好的起点可能是了解设计意图本身，以及架构有助于解决的问题和方式。

通过首先理解，我们不太可能冒着滥用架构或使用它而不充分利用它的风险。

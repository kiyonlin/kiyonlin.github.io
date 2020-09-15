---
title: "在Golang中轻松使用ipset"
date: 2020-09-15T10:26:01+08:00
lastmod: 2020-09-15T10:26:07+08:00
tags: [golang, ispet]
categories: [golang, ipset]
---

# 前言
因为工作关系，需要使用`ipset`，但是截止目前，`golang`社区中对`ipset`的支持并不好。之前用的是[go-ipset](https://github.com/janeczku/go-ipset)，只能满足基础的使用，而且只支持`hash`类型以及部分选项。所以萌生了全面封装`golang`版本`ipset`的想法，才有了[gonetx/ipset](https://github.com/kiyonlin/gonetx/blob/master/ipset/README.md)的诞生。

# 功能
支持所有的`ispet`常用命令、类型以及实用的选项。
## 常用命令
支持增删改查导入导出等常用命令，用法可以参见[快速开始](#快速开始)和[进阶使用](#进阶使用)。

## 全类型支持
支持所有`ipset`的方法类型
- `bitmap`
- `hash`
- `list`

和数据类型
- `ip`
- `net`
- `mac`
- `port`
- `iface`

## 灵活的选项
每种`set`类型都会有各自的选项，主要集中在创建和新增操作上。目前支持`22`个选项，常用的有
- `func Exist(exist bool) Option`：创建`set`或添加`entry`时，若数据已存在报不报错；删除`entry`时不存在数据报不报错；
- `func Timeout(timeout time.Duration) Option`：创建`set`或者添加`entry`时可以指定超时时间；
- `func MaxElem(maxElem uint) Option`：指定`hash`方法类型的`set`容量；
- `func Family(family NetFamily) Option`：指定`hash`方法类型的`set`网络协议簇；
- `func HashSize(hashSize uint) Option`：指定`hash`方法类型的`set`初始化`hash`大小。

更多选项详情可以查看[文档](https://pkg.go.dev/github.com/kiyonlin/gonetx/ipset?tab=doc)。

# 示例
通过示例可以更快地了解该包的使用。需要注意的是，使用该包之前，必须调用`ispet.Check`检查系统是否支持`ispet`操作以及版本是否大于`v6.0`。

## 快速开始
```go
package main

import (
	"log"
	"time"

	"github.com/kiyonlin/gonetx/ipset"
)

func init() {
	if err := ipset.Check(); err != nil {
		panic(err)
	}
}

func main() {
	// create test set even it's exist
	set, _ := ipset.New("test", ipset.HashIp, ipset.Exist(true), ipset.Timeout(time.Hour))
	// output: test
	log.Println(set.Name())

	_ = set.Flush()

	_ = set.Add("1.1.1.1", ipset.Timeout(time.Hour))

	ok, _ := set.Test("1.1.1.1")
	// output: true
	log.Println(ok)

	ok, _ = set.Test("1.1.1.2")
	// output: false
	log.Println(ok)

	info, _ := set.List()
	// output: &{test hash:ip 4 family inet hashsize 1024 maxelem 65536 timeout 3600 216 0 [1.1.1.1 timeout 3599]}
	log.Println(info)

	_ = set.Del("1.1.1.1")

	_ = set.Destroy()
}
```
## 进阶使用
```go
package main

import (
	"bytes"
	"io/ioutil"
	"log"
	"time"

	"github.com/kiyonlin/gonetx/ipset"
)

func init() {
	if err := ipset.Check(); err != nil {
		panic(err)
	}
}

func main() {
	// create test set even it's exist
	set, _ := ipset.New("test", ipset.HashIp,
		ipset.Exist(true), ipset.Timeout(time.Hour*3),
		ipset.Family(ipset.Inet), ipset.HashSize(1024),
		ipset.MaxElem(100000),
	)

	// Saved content:
	_ = ioutil.WriteFile("saved",
		[]byte("add test 1.1.1.1 timeout 3600 -exist\nadd test 1.1.1.2 timeout 3600 -exist\n"),
		0600)
	_ = set.RestoreFromFile("saved")

	data := &bytes.Buffer{}
	data.WriteString("add test 1.1.1.3 timeout 3600 -exist\n")
	data.WriteString("add test 1.1.1.4 timeout 3600 -exist\n")

	_ = set.Restore(data)

	info, _ := set.List()
	// output: &{test hash:ip 4 family inet hashsize 1024 maxelem 100000 timeout 10800 504 0 [1.1.1.3 timeout 3599 1.1.1.2 timeout 3599 1.1.1.1 timeout 3599 1.1.1.4 timeout 3599]}
	log.Println(info)

	_ = set.SaveToFile("saved")
	// cat saved:
	//create test hash:ip family inet hashsize 1024 maxelem 100000 timeout 10800
	//add test 1.1.1.3 timeout 3599
	//add test 1.1.1.2 timeout 3599
	//add test 1.1.1.1 timeout 3599
	//add test 1.1.1.4 timeout 3599
}
```

# 最后
有任何疑问或者改进，请提交[issue](https://github.com/kiyonlin/gonetx/issues)或者[PR](https://github.com/kiyonlin/gonetx/pulls)。

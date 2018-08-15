---
title: iptables-1-简介
tag: [iptables]
category: [iptables]
date: 2018-08-15 08:45:33
---

`iptables` 是各种防火墙的基础，需要系统学习。本篇先了解 `iptables` 的一些基本概念。
::: warning 注意
本系列测试环境为 `centos 7`，`iptables` 版本 `1.4.21`。
:::
<!-- more -->

## 说明
`iptables` 是用来设置、维护和检查 `Linux` 内核的 `IP` 包过滤规则的。用户可以定义不同的表，每个表都包含几个内部的链，也能包含用户定义的链。每个链都是一个规则列表，与对应的包进行匹配：每条规则指定应当如何处理与之相匹配的包，这被称作 `target`（目标），也可以跳向同一个表内的用户定义的链。[^1]
[^1]: man iptables 8

一般 `iptables` 设置都是从 `表` 出发，到 `链 `再到 `规则`。

## 表
`iptables` 的核心之一就是 `table`，它是具有相同功能的规则集合。iptables 提供了5张表：
1. `filter` - 主要提供过滤功能，是默认的表。
2. `nat` - 主要提供网络地址转换功能，实现数据包转发，修改源地址与端口和目标地址与端口。
3. `mangle` - 主要提供修改报文的功能。
4. `raw` - 应用在不需要做 `nat` 的情况下，以提高性能。
5. `security` - 主要提供 `MAC` 网络规则。

## 链
报文需要经过一系列阶段，每个阶段可以应用各种规则，这样的一个阶段在 iptables 中称为`链(chain)`。各种阶段串起来就是一条`长链`。 iptables 中有5条默认的链：
- PREROUTING
- INPUT
- FORWARD
- OUTPUT
- POSTROUTING

用户也可以创建自定义链，但是只能被默认链调用。

## 报文生命周期
报文从网卡进入，从网卡流出，会经过5个生命周期，也就是上述的5条默认链。每条链上可以使用`相应的表组合`起来进行报文处理。当不同表处于同一条链上时，处理报文就会涉及到顺序，执行的优先级如下：

`raw` -> `mangle` -> `nat` -> `filter` -> `security`

总结成一张图：

![报文生命周期](/iptables/lifecycle.jpg)

同时，我们也可以总结出5张表分别包含了哪些链：
|表|链|
|---|---|
|raw|PREROUTING, OUTPUT|
|mangle|PREROUTING, INPUT, FORWARD, OUTPUT, POSTROUTING|
|nat|PREROUTING, INPUT, OUTPUT, POSTROUTING|
|filter|INPUT, FORWARD, OUTPUT|
|security|INPUT, FORWARD, OUTPUT|

## 规则
规则包含了匹配条件和 `target`，用来匹配报文信息。匹配不成功，则进行下一条规则检测；匹配成功后执行规则对应的 `target`。

`target` 可以是基本 `target`，用户自定义链，或者扩展中的 `target`[^2]。

基本 `target` 包含：
- ACCEPT: 让报文通过。
- DROP: 丢弃报文。
- RETURN: 停止遍历本链中的规则，将下一条规则置为`前一条`调用的链。

[^2]: man iptables-extensions 8


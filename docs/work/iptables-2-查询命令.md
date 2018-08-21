---
title: iptables详解-2-查询命令
tag: [iptables]
category: [iptables]
date: 2018-08-15 11:37:05
comment: true
---

本章介绍 `iptables` 常用的查询命令。
::: warning 注意
本系列测试环境为 `centos 7`，`iptables` 版本 `1.4.21`。
:::
<!-- more -->

## 查看表规则
`iptables` 内置了5张表，分别是 `raw`、 `nat`、 `mangle`、 `filter`、 `security`。

我们要查看 `filter` 表下的所有规则，可以使用如下命令：
``` bash {1}
iptables -t filter -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     udp  --  anywhere             anywhere             udp dpt:domain
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:domain
ACCEPT     udp  --  anywhere             anywhere             udp dpt:bootps
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:bootps

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             192.168.122.0/24     ctstate RELATED,ESTABLISHED
ACCEPT     all  --  192.168.122.0/24     anywhere
ACCEPT     all  --  anywhere             anywhere
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     udp  --  anywhere             anywhere             udp dpt:bootpc
```

其他查看其他表的命令也是类似的。当省略 `-t filter` 时，默认列出的是 `filter` 表的规则。

## 查看表的指定链
可以增加链名，指定查看表的具体链规则：
```bash {1}
iptables -nL INPUT
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     udp  --  0.0.0.0/0            0.0.0.0/0            udp dpt:53
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:53
ACCEPT     udp  --  0.0.0.0/0            0.0.0.0/0            udp dpt:67
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:67
```

## 查看规则详情
使用 `-v` 选项列出更详细的信息：
```bash {1}
iptables -vL
Chain INPUT (policy ACCEPT 724K packets, 80M bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     udp  --  virbr0 any     anywhere             anywhere             udp dpt:domain
    0     0 ACCEPT     tcp  --  virbr0 any     anywhere             anywhere             tcp dpt:domain
    0     0 ACCEPT     udp  --  virbr0 any     anywhere             anywhere             udp dpt:bootps
    0     0 ACCEPT     tcp  --  virbr0 any     anywhere             anywhere             tcp dpt:bootps

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     all  --  any    virbr0  anywhere             192.168.122.0/24     ctstate RELATED,ESTABLISHED
    0     0 ACCEPT     all  --  virbr0 any     192.168.122.0/24     anywhere
    0     0 ACCEPT     all  --  virbr0 virbr0  anywhere             anywhere
    0     0 REJECT     all  --  any    virbr0  anywhere             anywhere             reject-with icmp-port-unreachable
    0     0 REJECT     all  --  virbr0 any     anywhere             anywhere             reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT 710K packets, 74M bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     udp  --  any    virbr0  anywhere             anywhere             udp dpt:bootpc
```

字段含义：
- pkts: 报文数量
- bytes: 报文大小
- target: target动作
- port: 协议
- opt: 选项
- in: 入口网卡
- out: 出口网卡
- source: 源ip/ip段
- destination: 目标ip/ip段


### 链策略 Policy和精确报文数据
表中每个链都包含了策略 `Policy`，总报文数和总报文大小。`policy ACCEPT`表示链的默认策略为 `ACCEPT`。 总报文数和总报文大小可以使用 `-x` 选项显示精确的数据:
```bash {1,2,5,8,11}
iptables -vnxL -t nat
Chain PREROUTING (policy ACCEPT 6856 packets, 469577 bytes)
    pkts      bytes target     prot opt in     out     source               destination

Chain INPUT (policy ACCEPT 6661 packets, 424028 bytes)
    pkts      bytes target     prot opt in     out     source               destination

Chain OUTPUT (policy ACCEPT 97282 packets, 5880717 bytes)
    pkts      bytes target     prot opt in     out     source               destination

Chain POSTROUTING (policy ACCEPT 97282 packets, 5880717 bytes)
    pkts      bytes target     prot opt in     out     source               destination
       0        0 RETURN     all  --  *      *       192.168.122.0/24     224.0.0.0/24
       0        0 RETURN     all  --  *      *       192.168.122.0/24     255.255.255.255
       0        0 MASQUERADE  tcp  --  *      *       192.168.122.0/24    !192.168.122.0/24     masq ports: 1024-65535
       0        0 MASQUERADE  udp  --  *      *       192.168.122.0/24    !192.168.122.0/24     masq ports: 1024-65535
       0        0 MASQUERADE  all  --  *      *       192.168.122.0/24    !192.168.122.0/24
```

## 名称解析
`iptables` 默认进行了名称解析，这会牺牲效率，可以使用 `-n` 选项直接显示ip。
```bash {1}
iptables -nvL -t nat
Chain PREROUTING (policy ACCEPT 6854 packets, 469K bytes)
 pkts bytes target     prot opt in     out     source               destination

Chain INPUT (policy ACCEPT 6659 packets, 424K bytes)
 pkts bytes target     prot opt in     out     source               destination

Chain OUTPUT (policy ACCEPT 96829 packets, 5853K bytes)
 pkts bytes target     prot opt in     out     source               destination

Chain POSTROUTING (policy ACCEPT 96829 packets, 5853K bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 RETURN     all  --  *      *       192.168.122.0/24     224.0.0.0/24
    0     0 RETURN     all  --  *      *       192.168.122.0/24     255.255.255.255
    0     0 MASQUERADE  tcp  --  *      *       192.168.122.0/24    !192.168.122.0/24     masq ports: 1024-65535
    0     0 MASQUERADE  udp  --  *      *       192.168.122.0/24    !192.168.122.0/24     masq ports: 1024-65535
    0     0 MASQUERADE  all  --  *      *       192.168.122.0/24    !192.168.122.0/24
```

## 显示规则序号
使用 --line[-number] 展示规则行号：
```bash {1}
iptables -L --line
Chain INPUT (policy ACCEPT)
num  target     prot opt source               destination
1    ACCEPT     udp  --  anywhere             anywhere             udp dpt:domain
2    ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:domain
3    ACCEPT     udp  --  anywhere             anywhere             udp dpt:bootps
4    ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:bootps

Chain FORWARD (policy ACCEPT)
num  target     prot opt source               destination
1    ACCEPT     all  --  anywhere             192.168.122.0/24     ctstate RELATED,ESTABLISHED
2    ACCEPT     all  --  192.168.122.0/24     anywhere
3    ACCEPT     all  --  anywhere             anywhere
4    REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable
5    REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT)
num  target     prot opt source               destination
1    ACCEPT     udp  --  anywhere             anywhere             udp dpt:bootpc
```

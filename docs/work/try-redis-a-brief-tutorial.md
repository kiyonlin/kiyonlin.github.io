---
title: try redis-a brief tutorial
tag: [redis]
date: 2016-09-19 13:35:01
updated: 2016-09-19 13:35:01
category: [技术, redis]
---
## Tutorial
Redis is what is called a key-value store, often referred to as a NoSQL database.  
Redis是一种key-value存储,经常被称为NOSQL。
### SET和GET
```redis
> set server:name "fido"
OK
> get server:name
"fido"
```
### MSET和MGET
一次设置或获取多个key对应的值
```redis
> mset a 10 b 20 c 30
OK
> mget a b c
1) "10"
2) "20"
3) "30"
```

### DEL和INCR(DECR)
del顾名思义就是删除  
```redis
> set connections 10
OK
> incr connections
(integer) 11
> incr connections
(integer) 12
> del connections
(integer) 1
> incr connections
(integer) 1
```
incr具有*`原子性`*,所以不会污染数据。  
以下操作可能产生脏读  
```redis
x = GET count
x = x + 1
SET count x
```

### EXPIRE和TTL
可以为存储在redis中的键值对设置超时时间
```redis
> set resource:lock "Redis Demo"
OK
> expire resource:lock 120
(integer) 1
> ttl resource:lock
(integer) 110
> ttl resource:lock
(integer) 106
> set resource:lock "redis demo 2"
OK
> ttl resource:lock
(integer) -1
```
从上面的命令可以看出,在键值对的有效期内重置数据的话,超时时间会被赋值为-1,即不超时

### List
列表结构
#### RPUSH和LPUSH
在列表右/左侧添加数据
```redis
> rpush friends "Alice"
(integer) 1
> rpush friends "Bob"
(integer) 2
> lpush friends "Sam"
(integer) 3
```
#### LRANGE
LRANGE list begin end  
获取一个子列表,使用开始下标(从0开始)和结束下标截取,-1表示到列表末尾  
三个参数必须写全, 无效的参数比如(1 0)会返回空列表
```redis
> lrange friends 0 -1
1) "Sam"
2) "Alice"
3) "Bob"
> lrange friends 0 1
1) "Sam"
2) "Alice"
> lrange friends 1 2
1) "Alice"
2) "Bob"
```

#### LLEN、LPOP和RPOP
length命令,获取列表长度;pop表示"弹出"数据
```redis
> llen friends
(integer) 3
> lpop friends
"Sam"
> rpop friends
"Bob"
> llen friends
(integer) 1
> lrange friends 0 -1
1) "Alice"
```

### SET
集合结构
#### SADD和SREM
add和remove命令
```redis
> sadd superpowers "flight"
(integer) 1
> sadd superpowers "x-ray vision"
(integer) 1
> sadd superpower "reflexes"
(integer) 1
> srem superpowers "reflexes"
0
```
#### SISMEMBER、SMEMBER和SUNION
is member: 判断值是不是集合的一员  
members: 展示所有成员
union: 合并两个集合,并返回一个列表
```redis
> sismember superpowers "flight"
(integer) 1
> sismember superpowers "reflexes"
(integer) 0
> smembers superpowers
1) "flight"
2) "x-ray vision"

> sadd birdpowers "pecking"
(integer) 1
> sadd birdpowers "flight"
(integer) 1
> sunion superpowers birdpowers
1) "flight"
2) "pecking"
3) "x-ray vision"
```
### Sorted Sets
有序集合是一个排序的集合,每个值会有一个计数,用来排序
#### ZADD和ZRANGE
```redis
> zadd hackers 1940 "Alan Kay"
(integer) 1
> zadd hackers 1906 "Grace Hopper"
(integer) 1
> ZADD hackers 1953 "Richard Stallman"
(integer) 1
> ZADD hackers 1965 "Yukihiro Matsumoto"
(integer) 1
> ZADD hackers 1916 "Claude Shannon"
(integer) 1
> ZADD hackers 1969 "Linus Torvalds"
(integer) 1
> ZADD hackers 1957 "Sophie Wilson"
(integer) 1
> ZADD hackers 1912 "Alan Turing"
(integer) 1

> ZRANGE hackers 2 4
1) "Claude Shannon"
2) "Alan Kay"
3) "Richard Stallman"
```

### HASH
哈希表
#### HSET HGETALL HMSET HGET
HMSET: 一次设置多个值(set multiple fields at once)
```redis
> HSET user:1000 name "John Smith"
(integer) 1
> HSET user:1000 email "john.smith@example.com"
(integer) 1
> HSET user:1000 password "s3cret"
(integer) 1
> HGETALL user:1000
1) "name"
2) "John Smith"
3) "email"
4) "john.smith@example.com"
5) "password"
6) "s3cret"
> HMSET user:1001 name "Mary Jones" password "hidden" email "mjones@example.com"
OK
> HGET user:1001 name
"Mary Jones"
```
#### HINCRBY和HDEL
```redis
> HSET user:1000 visits 10
(integer) 1
> HINCRBY user:1000 visits 1
(integer) 11
> HINCRBY user:1000 visits 10
(integer) 21
> HDEL user:1000 visits
(integer) 1
> HINCRBY user:1000 visits 1
(integer) 1
```

更多HASH命令,参考[这里](http://redis.io/commands#hash)


---
title: php学习(一)
tag: [php]
category: [技术,php]
date: 2016-08-19 21:21:40
updated: 2016-08-22 21:21:40
---
#### 构造函数  
```php
function __construct(){}
```
#### 析构函数
释放资源,比如打印机。当对象被设为null(对象不会再被调用的时候,),或者程序结束时,会调用析构函数。
```php
function __destruct{}
```
this是php里面的伪变量,表示自身对象  
self对应类的静态变量

#### 重写
方法名和修饰完全一样,**参数可以不一样**

###魔术方法
```php
__toString()
```
和toString一样的作用

```php
__invoke()
```
对象作方法调用  
在把对象当作一个方法调用的时候自动调用

```php
// $name是方法名称,$args是数组
public function __call($name, $args)
```
当对象访问不存在的方法名称时,会被自动调用

```php
// $name是方法名称,$args是数组
public static function __callStatic($name, $args)
```
当对象访问不存在的静态方法名称时,会被自动调用  

还有四个重要的函数:
```php
//TODO: 查一下用法
call_user_func_array()
call_user_func()
func_get_args()
func_num_args()
```

属性重载有四个重要的函数:
```php
__get(),__set(),__isset(),__unset()
```
使用方法
```php
$obj->className;
$obj->className = 'MagicClassX';
isset(obj->className);
empty(obj->className);
unset(obj->className);
```

```php
__clone
```
在调用clone方法时会被调用,初始化clone时对象里的值

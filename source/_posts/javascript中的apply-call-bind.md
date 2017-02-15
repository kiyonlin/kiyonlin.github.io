---
title: 'javascript中的apply,call,bind'
tag: [javascript]
category:
  - 技术
  - javascript
date: 2017-02-15 10:01:44
updated: 2017-02-15 10:01:44
---

# apply和call
apply和call的作用一致，只是接受的参数方式不同
```javascript
func.apply(this, [arg1, arg2]);
func.call(this, arg1, arg2);
```

# bind
bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this, 之后的一序列参数将会在传递的实参前传入作为它的参数。

## 语法
`fun.bind(thisArg[, arg1[, arg2[, ...]]])`
## 参数

### thisArg
当绑定函数被调用时，该参数会作为原函数运行时的 this 指向。当使用new 操作符调用绑定函数时，该参数无效。
### arg1, arg2, ...
当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。
## 返回值
返回由指定的this值和初始化参数改造的原函数拷贝

## 描述
bind() 函数会创建一个新函数（称为绑定函数），新函数与被调函数（绑定函数的目标函数）具有相同的函数体（在 ECMAScript 5 规范中内置的call属性）。当目标函数被调用时 this 值绑定到 bind() 的第一个参数，该参数不能被重写。绑定函数被调用时，bind() 也接受预设的参数提供给原函数。一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

## 注意点
多次 bind() 是无效的。更深层次的原因， bind() 的实现，相当于使用函数在内部包了一个 call / apply ，第二次 bind() 相当于再包住第一次 bind() ,故第二次以后的 bind 是无法生效的。

# 总结
- apply 、 call 、bind 三者都是用来改变函数的this对象的指向的；
- apply 、 call 、bind 三者第一个参数都是this要指向的对象，也就是想指定的上下文；
- apply 、 call 、bind 三者都可以利用后续参数传参；
- bind是返回对应函数，便于稍后调用；apply、call则是立即调用 。
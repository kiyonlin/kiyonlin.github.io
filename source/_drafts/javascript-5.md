---
title: javascript-5 迭代器和生成器
tag: [javascript, 迭代器, 生成器]
category: [技术, javascript]
date: 2016-10-28 11:05:04
updated: 2016-10-28 11:05:04
---
- [mozilla JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 6入门](http://es6.ruanyifeng.com/)
- [JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/)

# 迭代器
迭代器`Iterator`的作用有三个：
- 一是为各种数据结构，提供一个统一的、简便的访问接口；
- 二是使得数据结构的成员能够按某种次序排列；
- 三是ES6创造了一种新的遍历命令`for...of`循环，`Iterator`接口主要供`for...of`消费。

一个迭代器对象 ，知道如何每次访问集合中的一项， 并记录它的当前在序列中所在的位置。在  `JavaScript` 中 迭代器是一个`对象`，它提供了一个 `next()` 方法，返回序列中的下一项。这个方法返回包含`done`和`value`两个属性的对象。
```javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```
# 定义自定义迭代器
# 生成器（Generators）: 一个更好的方法来构建遍历器
# 高级生成器
# 生成器表达式

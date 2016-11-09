---
title: EMCAScript6入门学习-3 对象
tag:
  - EMCAScript6
  - ES6
  - 对象
category:
  - EMCAScript6
date: 2016-11-09 19:08:29
updated: 2016-11-09 19:08:29
---
源自[ECMAScript 6入门](http://es6.ruanyifeng.com/)
#属性的简洁表示法
ES6允许直接写入变量和函数，作为对象的属性和方法。
```javascript
// 属性简写
var foo = 'bar';
var baz = {foo};
baz // {foo: "bar"}

// 等同于
var baz = {foo: foo};

// 方法简写
var o = {
  method() {
    return "Hello!";
  }
};

// 等同于

var o = {
  method: function() {
    return "Hello!";
  }
};

```
`CommonJS`模块输出变量，就非常合适使用简洁写法。
```javascript
var ms = {};

function getItem (key) {
  return key in ms ? ms[key] : null;
}

function setItem (key, value) {
  ms[key] = value;
}

function clear () {
  ms = {};
}

module.exports = { getItem, setItem, clear };
// 等同于
module.exports = {
  getItem: getItem,
  setItem: setItem,
  clear: clear
};
```

如果某个方法的值是一个`Generator`函数，前面需要加上星号。
```javascript
var obj = {
  * m(){
    yield 'hello world';
  }
};
```
# Object.assign()
`Object.assign`方法用于对象的合并，将源对象（`source`）的所有可枚举属性，复制到目标对象（`target`）。
```javascript
var target = { a: 1 };

var source1 = { b: 2 };
var source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```
`Object.assign`方法的第一个参数是目标对象，后面的参数都是源对象。
**注意**，如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。

## 注意点
`Object.assign`方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。
```javascript
var obj1 = {a: {b: 1}};
var obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2
```
上面代码中，源对象`obj1`的`a`属性的值是一个对象，`Object.assign`拷贝得到的是这个对象的引用。这个对象的任何变化，都会反映到目标对象上面。

对于这种嵌套的对象，一旦遇到同名属性，`Object.assign`的处理方法是替换，而不是添加。
```javascript
var target = { a: { b: 'c', d: 'e' } }
var source = { a: { b: 'hello' } }
Object.assign(target, source)
// { a: { b: 'hello' } }
```
上面代码中，`target`对象的`a`属性被`source`对象的`a`属性整个替换掉了，而不会得到`{ a: { b: 'hello', d: 'e' } }`的结果。这通常不是开发者想要的，需要特别小心。

---
title: EMCAScript6入门学习-3 对象
tags: [es6]
categories: [web, es6]
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
## Object.assign()
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

### 注意点
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

### 常见用途
1. 为对象添加属性
```javascript
class Point {
  constructor(x, y) {
    Object.assign(this, {x, y});
  }
}
```
2. 为对象添加方法
```javascript
Object.assign(SomeClass.prototype, {
  someMethod(arg1, arg2) {
    ···
  },
  anotherMethod() {
    ···
  }
});

// 等同于下面的写法
SomeClass.prototype.someMethod = function (arg1, arg2) {
  ···
};
SomeClass.prototype.anotherMethod = function () {
  ···
};
```
3. 克隆对象
```javascript
function clone(origin) {
  return Object.assign({}, origin);
}

// 采用这种方法克隆，只能克隆原始对象自身的值，不能克隆它继承的值。如果想要保持继承链，可以采用下面的代码。

function clone(origin) {
  let originProto = Object.getPrototypeOf(origin);
  return Object.assign(Object.create(originProto), origin);
}
```
4. 合并多个对象
```javascript
// 将多个对象合并到某个对象。

const merge =
  (target, ...sources) => Object.assign(target, ...sources);

// 如果希望合并后返回一个新对象，可以改写上面函数，对一个空对象合并。

const merge =
  (...sources) => Object.assign({}, ...sources);
```

5. 为属性指定默认值
```javascript
const DEFAULTS = {
  logLevel: 0,
  outputFormat: 'html'
};

function processContent(options) {
  options = Object.assign({}, DEFAULTS, options);
}
// 注意，由于存在深拷贝的问题，DEFAULTS对象和options对象的所有属性的值，都只能是简单类型，而不能指向另一个对象。否则，将导致DEFAULTS对象的该属性不起作用。
```

## 属性的遍历
ES6一共有5种方法可以遍历对象的属性。

1. `for...in`循环遍历对象自身的和继承的可枚举属性（不含`Symbol`属性）。

2. `Object.keys`返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含`Symbol`属性）。

3. `Object.getOwnPropertyNames(obj)`返回一个数组，包含对象自身的所有属性（不含`Symbol`属性，但是包括不可枚举属性）。

4. `Object.getOwnPropertySymbols(obj)`返回一个数组，包含对象自身的所有`Symbol`属性。

5. `Reflect.ownKeys(obj)`返回一个数组，包含对象自身的所有属性，不管是属性名是`Symbol`或字符串，也不管是否可枚举。

以上的5种方法遍历对象的属性，都遵守同样的属性遍历的次序规则。

- 首先遍历所有属性名为数值的属性，按照数字排序。
- 其次遍历所有属性名为字符串的属性，按照生成时间排序。
- 最后遍历所有属性名为Symbol值的属性，按照生成时间排序。

```javascript
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```
上面代码中，`Reflect.ownKeys`方法返回一个数组，包含了参数对象的所有属性。这个数组的属性次序是这样的，首先是数值属性`2`和`10`，其次是字符串属性`b`和`a`，最后是`Symbol`属性。

## \_\_proto\_\_属性，Object.setPrototypeOf()，Object.getPrototypeOf()

### \_\_proto\_\_属性
`__proto__`属性（前后各两个下划线），用来读取或设置当前对象的`prototype`对象。目前，所有浏览器（包括IE11）都部署了这个属性。

该属性没有写入ES6的正文，而是写入了附录，原因是`__proto__`前后的双下划线，说明它本质上是一个内部属性，而不是一个正式的对外的`API`，只是由于浏览器广泛支持，才被加入了ES6。标准明确规定，只有浏览器必须部署这个属性，其他运行环境不一定需要部署，而且新的代码最好认为这个属性是不存在的。因此，无论从语义的角度，还是从兼容性的角度，都不要使用这个属性，而是使用下面的`Object.setPrototypeOf()`（写操作）、`Object.getPrototypeOf()`（读操作）、`Object.create()`（生成操作）代替。

### Object.setPrototypeOf()
```javascript
// 格式
Object.setPrototypeOf(object, prototype)

// 用法
let proto = {};
let obj = { x: 10 };
Object.setPrototypeOf(obj, proto);

proto.y = 20;
proto.z = 40;

obj.x // 10
obj.y // 20
obj.z // 40
```

### Object.getPrototypeOf()

```javascript
// 用法
Object.getPrototypeOf(obj);

// 例子
function Rectangle() {
}

var rec = new Rectangle();

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype);
Object.getPrototypeOf(rec) === Rectangle.prototype
// false
```

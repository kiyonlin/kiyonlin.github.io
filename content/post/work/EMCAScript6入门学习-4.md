---
title: EMCAScript6入门学习-4
tag:
  - EMCAScript6
  - ES6
  - Set
  - Map
category:
  - EMCAScript6
date: 2016-11-10 08:48:15
updated: 2016-11-10 08:48:15
---
源自[ECMAScript 6入门](http://es6.ruanyifeng.com/)
## Set
```javascript
// 接受一个数组（或类似数组的对象）作为参数，用来初始化。
var set = new Set([1, 2, 3, 4, 4]);
// 通过add方法向Set结构加入成员
set.add(5)
[...set]

// 去除数组的重复成员
[...new Set(array)]
```

向`Set`加入值的时候，不会发生类型转换，所以`5`和`"5"`是两个不同的值。`Set`内部判断两个值是否不同，使用的算法叫做`“Same-value equality”`，它类似于精确相等运算符`（===）`，主要的区别是`NaN`等于自身，而精确相等运算符认为`NaN`不等于自身。
```javascript
let set = new Set();
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set {NaN}
```
上面代码向`Set`实例添加了两个`NaN`，但是只能加入一个。这表明，在`Set`内部，两个`NaN`是相等。

两个对象总是不相等的。
```javascript
let set = new Set();

set.add({});
set.size // 1

set.add({});
set.size // 2
```

### Set实例的属性和方法
Set结构的实例有以下属性。

- Set.prototype.constructor：构造函数，默认就是Set函数。
- Set.prototype.size：返回Set实例的成员总数。

Set实例的方法分为两大类：操作方法（用于操作数据）和遍历方法（用于遍历成员）。下面先介绍四个操作方法。

- add(value)：添加某个值，返回Set结构本身。
- delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- has(value)：返回一个布尔值，表示该值是否为Set的成员。
- clear()：清除所有成员，没有返回值。

### 遍历操作
Set结构的实例有四个遍历方法，可以用于遍历成员。

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回键值对的遍历器
- forEach()：使用回调函数遍历每个成员

### 应用
扩展运算符`（...）`内部使用`for...of`循环，所以也可以用于`Set`结构。
`Set`可以很容易地实现并集`（Union）`、交集`（Intersect）`和差集`（Difference）`。
```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// 差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

## WeakSet
- WeakSet的成员只能是对象，而不能是其他类型的值
- WeakSet中的对象都是弱引用，即垃圾回收机制不考虑WeakSet对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于WeakSet之中。这个特点意味着，无法引用WeakSet的成员，因此**WeakSet是不可遍历的**。

作为构造函数，`WeakSet`可以接受一个数组或类似数组的对象作为参数，数组的成员只能是对象。（实际上，任何具有`iterable`接口的对象，都可以作为`WeakSet`的参数。）该数组的所有成员，都会自动成为`WeakSet`实例对象的成员。
```javascript
var a = [[1,2], [3,4]];
var ws = new WeakSet(a);

var b = [3, 4];
var ws = new WeakSet(b);
// Uncaught TypeError: Invalid value used in weak set(…)
```

WeakSet结构有以下三个方法。

- WeakSet.prototype.add(value)：向WeakSet实例添加一个新成员。
- WeakSet.prototype.delete(value)：清除WeakSet实例的指定成员。
- WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在WeakSet实例之中。

`WeakSet`没有`size`属性，没有办法遍历它的成员。
```javascript
ws.size // undefined
ws.forEach // undefined

ws.forEach(function(item){ console.log('WeakSet has ' + item)})
// TypeError: undefined is not a function
```

`WeakSet`的一个用处，是储存`DOM`节点，而不用担心这些节点从文档移除时，会引发内存泄漏。

## Map
ES6提供了`Map`数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。

作为构造函数，`Map`也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。
```javascript
var map = new Map([
  ['name', '张三', 'ignored'],
  ['title', 'Author', 'me']
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"

// Map构造函数接受数组作为参数，实际上执行的是下面的算法。
var items = [
  ['name', '张三'],
  ['title', 'Author']
];
var map = new Map();
items.forEach(([key, value]) => map.set(key, value));
```

`Map`的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。
```javascript
var map = new Map();

var k1 = ['a'];
var k2 = ['a'];

map
.set(k1, 111)
.set(k2, 222);

map.get(k1) // 111
map.get(k2) // 222
```
上面代码中，变量k1和k2的值是一样的，但是它们在Map结构中被视为两个键。

如果`Map`的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，`Map`将其视为一个键，包括`0`和`-0`。另外，虽然`NaN`不严格相等于自身，但`Map`将其视为同一个键。
```javascript
let map = new Map();

map.set(NaN, 123);
map.get(NaN) // 123

map.set(-0, 123);
map.get(+0) // 123
```

### 遍历方法
`Map`原生提供三个遍历器生成函数和一个遍历方法。

- keys()：返回键名的遍历器。
- values()：返回键值的遍历器。
- entries()：返回所有成员的遍历器。
- forEach()：遍历Map的所有成员。

需要特别注意的是，`Map`的遍历顺序就是插入顺序。
```javascript
let map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
```

## WeakMap
`WeakMap`结构与`Map`结构基本类似，唯一的区别是它只接受对象作为键名（`null`除外），不接受其他类型的值作为键名，而且键名所指向的对象，不计入垃圾回收机制。基本上，`WeakMap`的专用场合就是，它的键所对应的对象，可能会在将来消失。`WeakMap`结构有助于防止内存泄漏。
```javascript
// WeakMap应用的典型场合就是DOM节点作为键名
let myElement = document.getElementById('logo');
let myWeakmap = new WeakMap();

myWeakmap.set(myElement, {timesClicked: 0});

myElement.addEventListener('click', function() {
  let logoData = myWeakmap.get(myElement);
  logoData.timesClicked++;
  myWeakmap.set(myElement, logoData);
}, false);
```

`WeakMap`的另一个用处是部署私有属性。
```javascript
let _counter = new WeakMap();
let _action = new WeakMap();

class Countdown {
  constructor(counter, action) {
    _counter.set(this, counter);
    _action.set(this, action);
  }
  dec() {
    let counter = _counter.get(this);
    if (counter < 1) return;
    counter--;
    _counter.set(this, counter);
    if (counter === 0) {
      _action.get(this)();
    }
  }
}

let c = new Countdown(2, () => console.log('DONE'));

c.dec()
c.dec()
// DONE
```

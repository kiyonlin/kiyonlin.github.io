---
title: EMCAScript6入门学习-1
tag:
  - EMCAScript6
  - ES6
category:
  - EMCAScript6
date: 2016-11-09 08:51:19
updated: 2016-11-09 08:51:19
---
源自[ECMAScript 6入门](http://es6.ruanyifeng.com/)
<!-- more -->
## 简介
ES6的第一个版本，在2015年6月发布，正式名称是《ECMAScript 2015标准》（简称ES2015）。ES6既是一个历史名词，也是一个泛指，含义是5.1版以后的JavaScript的下一代标准，涵盖了ES2015、ES2016、ES2017等等，而ES2015则是正式名称，特指该年发布的正式版本的语言标准。  
ES2015~ES6.0  
ES2016~ES6.1  

## let命令
`let`
- 声明的变量只在它所在的代码块有效
- 不存在变量提升
- 不允许重复声明。  

### 暂时性死区（temporal dead zone，简称TDZ）
只要块级作用域内存在`let`命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。
```javascript
var tmp = 123;

if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
```
上面代码中，存在全局变量`tmp`，但是块级作用域内`let`又声明了一个局部变量`tmp`，导致后者绑定这个块级作用域，所以在`let`声明变量前，对`tmp`赋值会报错。

有些“死区”比较隐蔽，不太容易发现。
```javascript
function bar(x = y, y = 2) {
  return [x, y];
}

bar(); // 报错
```
上面代码中，调用`bar`函数之所以报错（某些实现可能不报错），是因为参数`x`默认值等于另一个参数`y`，而此时`y`还没有声明，属于”死区“。如果`y`的默认值是`x`，就不会报错，因为此时`x`已经声明了。
```javascript
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]
```


## const命令
`const`
- 声明一个只读的常量
- 一旦声明，就必须立即初始化,且不能改变
- 只在声明所在的块级作用域内有效
- 不存在变量提升
- 存在暂时性死区
- 不可重复声明
- 对于复合类型的变量，变量名不指向数据，而是指向数据所在的地址

## 正则
### RegExp构造函数
如果`RegExp`构造函数第一个参数是一个正则对象，那么可以使用第二个参数指定修饰符。而且，返回的正则表达式会忽略原有的正则表达式的修饰符，只使用新指定的修饰符。
```javascript
new RegExp(/abc/ig, 'i').flags
// "i"
```
### u修饰符
ES6对正则表达式添加了u修饰符，含义为“Unicode模式”，用来正确处理大于`\uFFFF`的Unicode字符

### y修饰符
ES6对正则表达式添加了y修饰符，叫做“粘连”（sticky）修饰符。
y修饰符的作用与g修饰符类似，也是全局匹配，后一次匹配都从上一次匹配成功的下一个位置开始。不同之处在于，g修饰符只要剩余位置中存在匹配就可，而y修饰符确保匹配必须从剩余的第一个位置开始，这也就是“粘连”的涵义。
```javascript
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null
```

可以说，y修饰符号隐含了头部匹配的标志`^`

## 数组
### Array.from()
`Array.from`方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括ES6新增的数据结构`Set`和`Map`）。

```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5的写法
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6的写法
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']

// NodeList对象
let ps = document.querySelectorAll('p');
Array.from(ps).forEach(function (p) {
  console.log(p);
});
// 也可以使用扩展运算符
[...ps];

// arguments对象
function foo() {
  var args = Array.from(arguments);
  // 也可以使用扩展运算符
  var args2 = [...arguments];
}

// 字符串转数组
Array.from('hello')
// ['h', 'e', 'l', 'l', 'o']

// set转数组
let namesSet = new Set(['a', 'b'])
Array.from(namesSet) // ['a', 'b']
```

任何有`length`属性的对象，都可以通过`Array.from`方法转为数组，而此时扩展运算符就无法转换。
```javascript
Array.from({ length: 3 });
// [ undefined, undefined, undefined ]
```
上面代码中，`Array.from`返回了一个具有三个成员的数组，每个位置的值都是`undefined`。扩展运算符转换不了这个对象。


`Array.from`还可以接受第二个参数，作用类似于数组的`map`方法，用来对每个元素进行处理，将处理后的值放入返回的数组。
```javascript
Array.from(arrayLike, x => x * x);
// 等同于
Array.from(arrayLike).map(x => x * x);

Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

### Array.of()
`Array.of`方法用于将一组值，转换为数组。这个方法主要是为了弥补数组构造函数Array()的不足。因为参数个数的不同，会导致Array()的行为有差异。


### find()和findIndex()
数组实例的`find`方法，用于找出第一个符合条件的数组成员。它的参数是一个回调函数，所有数组成员依次执行该回调函数，直到找出第一个返回值为`true`的成员，然后返回该成员。如果没有符合条件的成员，则返回`undefined`。
```javascript
[1, 4, -5, 10].find((n) => n < 0)
// -5

// find方法的回调函数可以接受三个参数，依次为当前的值、当前的位置和原数组
[1, 5, 10, 15].find(function(value, index, arr) {
  return value > 9;
}) // 10
```

数组实例的`findIndex`方法的用法与`find`方法非常类似，返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1。
```javascript
[1, 5, 10, 15].findIndex(function(value, index, arr) {
  return value > 9;
}) // 2
```

### entries()，keys()和values()
```javascript
// 对键名的遍历
for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

// 对键值的遍历
for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

// 对键值对的遍历
for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"

// 手动调用遍历器对象的next方法进行遍历。
let letter = ['a', 'b', 'c'];
let entries = letter.entries();
console.log(entries.next().value); // [0, 'a']
console.log(entries.next().value); // [1, 'b']
console.log(entries.next().value); // [2, 'c']
console.log(entries.next().value); // undefined
```

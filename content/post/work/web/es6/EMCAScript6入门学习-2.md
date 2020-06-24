---
title: EMCAScript6入门学习-2 函数
tags: [es6]
categories: [web, es6]
date: 2016-11-09 15:11:43
updated: 2016-11-09 15:11:43
---
源自[ECMAScript 6入门](http://es6.ruanyifeng.com/)

## 参数默认值

参数默认值可以与解构赋值的默认值，结合起来使用。
```javascript
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined, 5
foo({x: 1}) // 1, 5
foo({x: 1, y: 2}) // 1, 2
foo() // TypeError: Cannot read property 'x' of undefined
```

### 参数默认值的位置
通常情况下，定义了默认值的参数，应该是函数的尾参数。因为这样比较容易看出来，到底省略了哪些参数。如果非尾部的参数设置默认值，实际上这个参数是没法省略的。
```javascript
// 例一
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined])
f(, 1) // 报错
f(undefined, 1) // [1, 1]

// 例二
function f(x, y = 5, z) {
  return [x, y, z];
}

f() // [undefined, 5, undefined]
f(1) // [1, 5, undefined]
f(1, ,2) // 报错
f(1, undefined, 2) // [1, 5, 2]

// 例三
function foo(x = 5, y = 6) {
  console.log(x, y);
}

foo(undefined, null)
// 5 null
```
上面代码中，有默认值的参数都不是尾参数。这时，无法只省略该参数，而不省略它后面的参数，除非显式输入`undefined`。如果传入`undefined`，将触发该参数等于默认值，`null`则没有这个效果。

### 函数的length属性
指定了默认值以后，函数的`length`属性，将返回没有指定默认值的参数个数。也就是说，指定了默认值后，`length`属性将失真。
```javascript
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```
上面代码中，`length`属性的返回值，等于函数的参数个数减去指定了默认值的参数个数。
这是因为`length`属性的含义是，该函数预期传入的参数个数。

rest参数也不会计入length属性。
```javascript
(function(...args) {}).length // 0
```
如果设置了默认值的参数不是尾参数，那么`length`属性也不再计入**后面**的参数了。
```javascript
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

### 应用
利用参数默认值，可以指定某一个参数不得省略，如果省略就抛出一个错误。
```javascript
function throwIfMissing() {
  throw new Error('Missing parameter');
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo()
// Error: Missing parameter
```
上面代码的`foo`函数，如果调用的时候没有参数，就会调用默认值`throwIfMissing`函数，从而抛出一个错误。

## rest参数
ES6引入`rest`参数（形式为“...变量名”），用于获取函数的多余参数，这样就不需要使用`arguments`对象了。`rest`参数搭配的变量是一个数组，该变量将多余的参数放入数组中。
```javascript
function add(...values) {
  let sum = 0;

  for (let val of values) {
    sum += val;
  }

  return sum;
}

add(2, 5, 3) // 10
```
`rest`参数之后不能再有其他参数（即只能是最后一个参数），否则会报错。
```javascript
// 报错
function f(a, ...b, c) {
  // ...
}
```

## 扩展运算符
扩展运算符（spread）是三个点（...）。它好比rest参数的逆运算，将一个数组转为用逗号分隔的参数序列。
### 替代数组的apply方法
扩展运算符取代apply方法的一个实际的例子，应用Math.max方法，简化求出一个数组最大元素的写法。
```javascript
// ES5的写法
Math.max.apply(null, [14, 3, 77])

// ES6的写法
Math.max(...[14, 3, 77])

// 等同于
Math.max(14, 3, 77);
```
另一个例子是通过`push`函数，将一个数组添加到另一个数组的尾部。
```javascript
// ES5的写法
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
Array.prototype.push.apply(arr1, arr2);

// ES6的写法
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
arr1.push(...arr2);
```

### 合并数组
```javascript
// ES5
[1, 2].concat(more)
// ES6
[1, 2, ...more]

var arr1 = ['a', 'b'];
var arr2 = ['c'];
var arr3 = ['d', 'e'];

// ES5的合并数组
arr1.concat(arr2, arr3);
// [ 'a', 'b', 'c', 'd', 'e' ]

// ES6的合并数组
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]
```

## 箭头函数
### 基本用法
ES6允许使用“箭头”（=>）定义函数。
```javascript
var f = v => v;
// 上面的箭头函数等同于：
var f = function(v) {
  return v;
};
```
箭头函数可以与变量解构结合使用。
```javascript
const full = ({ first, last }) => first + ' ' + last;

// 等同于
function full(person) {
  return person.first + ' ' + person.last;
}
```

箭头函数的一个用处是**简化回调函数**。
```javascript
// 正常函数写法
[1,2,3].map(function (x) {
  return x * x;
});

// 箭头函数写法
[1,2,3].map(x => x * x);
```
### 使用注意点
箭头函数有几个使用注意点。

1. 函数体内的`this`对象，就是定义时所在的对象，而不是使用时所在的对象。

2. 不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误。

3. 不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用`Rest`参数代替。

4. 不可以使用`yield`命令，因此箭头函数不能用作`Generator`函数。

上面四点中，第一点尤其值得注意。`this`对象的指向是可变的，但是在箭头函数中，它是固定的。

箭头函数可以让`this`指向固定化，这种特性很有利于封装回调函数。下面是一个例子，`DOM`事件的回调函数封装在一个对象里面。
```javascript
var handler = {
  id: '123456',

  init: function() {
    document.addEventListener('click',
      event => this.doSomething(event.type), false);
  },

  doSomething: function(type) {
    console.log('Handling ' + type  + ' for ' + this.id);
  }
};
```
上面代码的`init`方法中，使用了箭头函数，这导致这个箭头函数里面的this，总是指向`handler`对象。否则，回调函数运行时，`this.doSomething`这一行会报错，因为此时`this`指向`document`对象。

`this`指向的固定化，并不是因为箭头函数内部有绑定`this`的机制，实际原因是箭头函数根本没有自己的`this`，导致内部的`this`就是外层代码块的`this`。正是因为它没有`this`，所以也就不能用作构造函数。

所以，箭头函数转成ES5的代码如下。
```javascript
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```
## 尾调用优化
尾调用（`Tail Call`）是函数式编程的一个重要概念，本身非常简单，一句话就能说清楚，就是指某个函数的最后一步是调用另一个函数。
```javascript
function f(x){
  return g(x);
}
```
上面代码中，函数`f`的最后一步是调用函数`g`，这就叫尾调用。

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。
```javascript
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```
上面代码是一个阶乘函数，计算n的阶乘，最多需要保存n个调用记录，复杂度 O(n) 。

如果改写成尾递归，只保留一个调用记录，复杂度 O(1) 。
```javascript
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

尾递归的实现，往往需要改写递归函数，确保最后一步只调用自身。做到这一点的方法，就是把所有用到的内部变量改写成函数的参数。
两个方法可以解决这个问题。
函数式编程有一个概念，叫做柯里化（`currying`），意思是将多参数的函数转换成单参数的形式。这里也可以使用柯里化。
```javascript
function currying(fn, n) {
  return function (m) {
    return fn.call(this, m, n);
  };
}

function tailFactorial(n, total) {
  if (n === 1) return total;
  return tailFactorial(n - 1, n * total);
}

const factorial = currying(tailFactorial, 1);

factorial(5) // 120
```

第二种方法就简单多了，就是采用ES6的函数默认值。
```javascript
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120
```

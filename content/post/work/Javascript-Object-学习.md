---
title: Javascript Object 学习
tag: [javascript, object]
category:
  - 技术
  - javascript
date: 2017-02-16 08:59:17
updated: 2017-02-16 08:59:17
---
原文[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
## Object.assign()
把任意多个的**源对象自身**的**可枚举属性**拷贝给目标对象，然后返回目标对象。
### 语法
`Object.assign(target, ...sources)`
### 参数
- target
	目标对象。
- sources
	任意多个源对象。
### 返回值
目标对象会被返回。

### 描述
`Object.assign` 方法只会拷贝源对象自身的并且可枚举的属性到目标对象身上。该方法使用源对象的 `[ [ Get ] ]` 和目标对象的 `[ [ Set ] ]`，所以它会调用相关 `getter` 和 `setter`。因此，它分配属性而不是复制或定义新的属性。如果合并源包含了 `getter`，那么该方法就不适合将新属性合并到原型里。假如是拷贝属性定义到原型里，包括它们的可枚举性，那么应该使用 `Object.getOwnPropertyDescriptor()` 和 `Object.defineProperty()` 。

`String`类型和 `Symbol` 类型的属性都会被拷贝。

注意，在属性拷贝过程中可能会产生异常，比如目标对象的某个只读属性和源对象的某个属性同名，这时该方法会抛出一个 `TypeError` 异常，拷贝过程中断，已经拷贝成功的属性不会受到影响，还未拷贝的属性将不会再被拷贝。

注意， `Object.assign` 会跳过那些值为 `null` 或 `undefined` 的源对象。

### 示例
#### 深度拷贝问题

假如需要深度拷贝的话，仍旧需要使用别的方法。因为 `Object.assign()` 拷贝的是在 `source` 里是对象的属性的引用而不是对象本身。
```javascript
function test() {
  let a = { b: {c:4} , d: { e: {f:1}} }
  // 浅拷贝
  let g = Object.assign({},a)
  // 深拷贝
  let h = JSON.parse(JSON.stringify(a));
  console.log(g.d) // { e: { f: 1 } }
  g.d.e = 32
  console.log('g.d.e set to 32.') // g.d.e set to 32.
  console.log(g) // { b: { c: 4 }, d: { e: 32 } }
  console.log(a) // { b: { c: 4 }, d: { e: 32 } }
  console.log(h) // { b: { c: 4 }, d: { e: { f: 1 } } }
  h.d.e = 54
  console.log('h.d.e set to 54.') // h.d.e set to 54.
  console.log(g) // { b: { c: 4 }, d: { e: 32 } }
  console.log(a) // { b: { c: 4 }, d: { e: 32 } }
  console.log(h) // { b: { c: 4 }, d: { e: 54 } }
}
test();
```

#### 合并 objects
```javascript
var o1 = { a: 1 };
var o2 = { b: 2 };
var o3 = { c: 3 };

var obj = Object.assign(o1, o2, o3);
console.log(obj); // { a: 1, b: 2, c: 3 }
console.log(o1);  // { a: 1, b: 2, c: 3 }, 注意目标对象自身也会改变。
```

#### 拷贝 symbol 类型的属性
```javascript
var o1 = { a: 1 };
var o2 = { [Symbol("foo")]: 2 };

var obj = Object.assign({}, o1, o2);
console.log(obj); // { a: 1, [Symbol("foo")]: 2 }
```

#### 继承属性和不可枚举属性是不能拷贝的
```javascript
var obj = Object.create({foo: 1}, { // foo 是个继承属性。
    bar: {
        value: 2  // bar 是个不可枚举属性。
    },
    baz: {
        value: 3,
        enumerable: true  // baz 是个自身可枚举属性。
    }
});

var copy = Object.assign({}, obj);
console.log(copy); // { baz: 3 }
```

#### 原始类型会被包装为 object
```javascript
var v1 = "abc";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo")

var obj = Object.assign({}, v1, null, v2, undefined, v3, v4);
// 原始类型会被包装，null 和 undefined 会被忽略。
// 注意，只有字符串的包装对象才可能有自身可枚举属性。
console.log(obj); // { "0": "a", "1": "b", "2": "c" }
```

#### 异常会打断接下来的拷贝任务
```javascript
var target = Object.defineProperty({}, "foo", {
    value: 1,
    writable: false
}); // target 的 foo 属性是个只读属性。

Object.assign(target, {bar: 2}, {foo2: 3, foo: 3, foo3: 3}, {baz: 4});
// TypeError: "foo" is read-only
// 注意这个异常是在拷贝第二个源对象的第二个属性时发生的。

console.log(target.bar);  // 2，说明第一个源对象拷贝成功了。
console.log(target.foo2); // 3，说明第二个源对象的第一个属性也拷贝成功了。
console.log(target.foo);  // 1，只读属性不能被覆盖，所以第二个源对象的第二个属性拷贝失败了。
console.log(target.foo3); // undefined，异常之后 assign 方法就退出了，第三个属性是不会被拷贝到的。
console.log(target.baz);  // undefined，第三个源对象更是不会被拷贝到的。
```

#### 拷贝访问器（accessor）
```javascript
var obj = {
  foo: 1,
  get bar() {
    return 2;
  }
};

var copy = Object.assign({}, obj);
// { foo: 1, bar: 2 }
// copy.bar的值来自obj.bar的getter函数的返回值
console.log(copy);

// 下面这个函数会拷贝所有自有属性的属性描述符
function completeAssign(target, ...sources) {
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});

    // Object.assign 默认也会拷贝可枚举的Symbols
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

var copy = completeAssign({}, obj);
// { foo:1, get bar() { return 2 } }
console.log(copy);
```

## Object.create()
创建一个拥有指定原型和若干个指定属性的对象。
### 语法
`Object.create(proto, [ propertiesObject ])`
### 参数
- proto
	一个对象，作为新创建对象的原型。或者为 null。
- propertiesObject
	可选。该参数对象是一组属性与值，该对象的属性名称将是新创建的对象的属性名称，值是属性描述符（这些属性描述符的结构与 `Object.defineProperties()` 的第二个参数一样）。**注意**：该参数对象不能是 `undefined` ，另外只有该对象中自身拥有的可枚举的属性才有效，也就是说该对象的原型链上属性是无效的。

### 抛出异常
如果 `proto` 参数不是 `null` 或一个对象值，则抛出一个 `TypeError` 异常。

### 例子
#### 使用Object.create实现类式继承

下面的例子演示了如何使用 `Object.create()` 来实现类式继承。这是一个单继承。
```javascript
//Shape - superclass
function Shape() {
  this.x = 0;
  this.y = 0;
}

Shape.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    console.info("Shape moved.");
};

// Rectangle - subclass
function Rectangle() {
  Shape.call(this); //call super constructor.
}

Rectangle.prototype = Object.create(Shape.prototype);

var rect = new Rectangle();

rect instanceof Rectangle //true.
rect instanceof Shape //true.

rect.move(1, 1); //Outputs, "Shape moved."
```

如果希望能继承到多个对象,则可以使用混入的方式。
```javascript
function MyClass() {
     SuperClass.call(this);
     OtherSuperClass.call(this);
}

MyClass.prototype = Object.create(SuperClass.prototype); //inherit
mixin(MyClass.prototype, OtherSuperClass.prototype); //mixin

MyClass.prototype.myMethod = function() {
     // do a thing
};
```
`mixin` 函数会把超类原型上的函数拷贝到子类原型上，这里 `mixin` 函数没有给出,需要自己实现。

#### 使用Object.create 的 propertyObject 参数
```javascript
var o;

// 创建一个原型为null的空对象
o = Object.create(null);


o = {};
// 以字面量方式创建的空对象就相当于:
o = Object.create(Object.prototype);


o = Object.create(Object.prototype, {
  // foo会成为所创建对象的数据属性
  foo: { writable:true, configurable:true, value: "hello" },
  // bar会成为所创建对象的访问器属性
  bar: {
    configurable: false,
    get: function() { return 10 },
    set: function(value) { console.log("Setting `o.bar` to", value) }
}})


function Constructor(){}
o = new Constructor();
// 上面的一句就相当于:
o = Object.create(Constructor.prototype);
// 当然,如果在Constructor函数中有一些初始化代码,Object.create不能执行那些代码


// 创建一个以另一个空对象为原型,且拥有一个属性p的对象
o = Object.create({}, { p: { value: 42 } })

// 省略了的属性特性默认为false,所以属性p是不可写,不可枚举,不可配置的:
o.p = 24
o.p
//42

o.q = 12
for (var prop in o) {
   console.log(prop)
}
//"q"

delete o.p
//false

//创建一个可写的,可枚举的,可配置的属性p
o2 = Object.create({}, { p: { value: 42, writable: true, enumerable: true, configurable: true } });
```

## Object.defineProperty()
在一个对象上定义一个新属性，或者修改一个已经存在的属性， 并返回这个对象。
### 语法
`Object.defineProperty(obj, prop, descriptor)`
### 参数
- obj
	需要定义属性的对象。
- prop
	需定义或修改的属性的名字。
- descriptor
	将被定义或修改的属性的描述符。
### 返回值
返回传入函数的对象，即第一个参数 `obj`

### 描述
该方法允许精确添加或修改对象的属性。一般情况下，我们为对象添加属性是通过赋值来创建并显示在属性枚举中（`for...in` 或 `Object.keys` 方法）， 但这种方式添加的属性值可以被改变，也可以被删除。而使用 `Object.defineProperty()` 则允许改变这些额外细节的默认设置。例如，默认情况下，使用  `Object.defineProperty()` 增加的属性值是不可改变的。

对象里目前存在的属性描述符有两种主要形式：数据描述符和存取描述符。数据描述符是一个拥有可写或不可写值的属性。存取描述符是由一对 `getter-setter` 函数功能来描述的属性。描述符必须是两种形式之一；不能同时是两者。

数据描述符和存取描述符均具有以下可选键值：
- configurable
	当且仅当该属性的 `configurable` 为 `true` 时，该属性描述符才能够被改变，也能够被删除。默认为 `false`。
- enumerable
	当且仅当该属性的 `enumerable` 为 `true` 时，该属性才能够出现在对象的枚举属性中。默认为 `false`。

数据描述符同时具有以下可选键值：
- value
	该属性对应的值。可以是任何有效的 `JavaScript` 值（数值，对象，函数等）。默认为 `undefined`。
- writable
	当且仅当该属性的 `writable` 为 `true` 时，该属性才能被赋值运算符改变。默认为 `false`。

存取描述符同时具有以下可选键值：
- get
	一个给属性提供 `getter` 的方法，如果没有 `getter` 则为 `undefined`。该方法返回值被用作属性值。默认为 `undefined`。
- set
	一个给属性提供 `setter` 的方法，如果没有 `setter` 则为 `undefined`。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 `undefined`。

记住，这些选项不一定是自身属性，如果是继承来的也要考虑。为了确认保留这些默认值，可能要在这之前冻结 `Object.prototype` ，明确指定所有的选项，或者将 `__proto__` 属性指向 `null`。

```javascript
// 使用 __proto__
Object.defineProperty(obj, "key", {
  __proto__: null, // 没有继承的属性
  value: "static"  // 没有 enumerable
                   // 没有 configurable
                   // 没有 writable
                   // 作为默认值
});

// 显式
Object.defineProperty(obj, "key", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: "static"
});

// 循环使用同一对象
function withValue(value) {
  var d = withValue.d || (
    withValue.d = {
      enumerable: false,
      writable: false,
      configurable: false,
      value: null
    }
  );
  d.value = value;
  return d;
}
// ... 并且 ...
Object.defineProperty(obj, "key", withValue("static"));

// 如果 freeze 可用, 防止代码添加或删除对象原型的属性
// （value, get, set, enumerable, writable, configurable）
(Object.freeze||Object)(Object.prototype);
```

### 示例

###创建属性

如果对象中不存在指定的属性，`Object.defineProperty()` 就创建这个属性。当描述符中省略某些字段时，这些字段将使用它们的默认值。拥有布尔值的字段的默认值都是 `false`。`value`，`get` 和 `set` 字段的默认值为 `undefined`。定义属性时如果没有 `get/set/value/writable`，那它被归类为数据描述符。
```javascript
var o = {}; // 创建一个新对象

// Example of an object property added with defineProperty with a data property descriptor
Object.defineProperty(o, "a", {value : 37,
                               writable : true,
                               enumerable : true,
                               configurable : true});
// 对象o拥有了属性a，值为37

// Example of an object property added with defineProperty with an accessor property descriptor
var bValue;
Object.defineProperty(o, "b", {get : function(){ return bValue; },
                               set : function(newValue){ bValue = newValue; },
                               enumerable : true,
                               configurable : true});
o.b = 38;
// 对象o拥有了属性b，值为38

// The value of o.b is now always identical to bValue, unless o.b is redefined

// 数据描述符和存取描述符不能混合使用
Object.defineProperty(o, "conflict", { value: 0x9f91102,
                                       get: function() { return 0xdeadbeef; } });
// throws a TypeError: value appears only in data descriptors, get appears only in accessor descriptors
```

#### 修改属性
如果属性已经存在，`Object.defineProperty()` 将尝试根据描述符中的值以及对象当前的配置来修改这个属性。如果描述符的 `configurable` 特性为 `false`（即该特性为 `non-configurable`），那么除了 `writable` 外，其他特性都不能被修改，并且数据和存取描述符也不能相互切换。

如果一个属性的 `configurable` 为 `false`，则其 `writable` 特性也只能修改为 `false`。

如果尝试修改 `non-configurable` 属性特性（除 `writable` 以外），将会产生一个 `TypeError` 异常，除非当前值与修改值相同。
##### Writable 属性

当属性特性（`property attribute`） `writable` 设置为 `false` 时，表示 `non-writable`，属性不能被修改。
```javascript
var o = {}; // 创建一个新对象

Object.defineProperty(o, "a", { value : 37,
                                writable : false });

console.log(o.a); // 打印 37
o.a = 25; // 没有错误抛出（在严格模式下会抛出，即使之前已经有相同的值）
console.log(o.a); // 打印 37， 赋值不起作用。
```

##### Enumerable 特性

属性特性 `enumerable` 定义了对象的属性是否可以在 `for...in` 循环和 `Object.keys()` 中被枚举。
```javascript
var o = {};
Object.defineProperty(o, "a", { value : 1, enumerable:true });
Object.defineProperty(o, "b", { value : 2, enumerable:false });
Object.defineProperty(o, "c", { value : 3 }); // enumerable defaults to false
o.d = 4; // 如果使用直接赋值的方式创建对象的属性，则这个属性的enumerable为true

for (var i in o) {
  console.log(i);
}
// 打印 'a' 和 'd' (in undefined order)

Object.keys(o); // ["a", "d"]

o.propertyIsEnumerable('a'); // true
o.propertyIsEnumerable('b'); // false
o.propertyIsEnumerable('c'); // false
```

##### Configurable 特性

`configurable` 特性表示对象的属性是否可以被删除，以及除 `writable` 特性外的其他特性是否可以被修改。
```javascript
var o = {};
Object.defineProperty(o, "a", { get : function(){return 1;},
                                configurable : false } );

// throws a TypeError
Object.defineProperty(o, "a", {configurable : true});

// throws a TypeError
Object.defineProperty(o, "a", {enumerable : true});

// throws a TypeError (之前未设置)
Object.defineProperty(o, "a", {set : function(){}});

// throws a TypeError (即使get方法完全一样)
Object.defineProperty(o, "a", {get : function(){return 1;}});

// throws a TypeError
Object.defineProperty(o, "a", {value : 12});

console.log(o.a); // logs 1
delete o.a; // Nothing happens
console.log(o.a); // logs 1
```

#### 添加多个属性和默认值

考虑特性被赋予的默认特性值非常重要，通常，使用点运算符和 `Object.defineProperty()`为对象的属性赋值时，数据描述符中的属性默认值是不同的，如下例所示。
```javascript
var o = {};

o.a = 1;
// 等同于 :
Object.defineProperty(o, "a", {
  value : 1,
  writable : true,
  configurable : true,
  enumerable : true
});


// 另一方面，
Object.defineProperty(o, "a", { value : 1 });
// 等同于 :
Object.defineProperty(o, "a", {
  value : 1,
  writable : false,
  configurable : false,
  enumerable : false
});
```

#### 一般的 Setters 和 Getters

下面的例子说明了如何实现自我存档的对象。当 `temperature` 属性设置时，`archive` 数组会得到一个 `log`。
```javascript
function Archiver() {
  var temperature = null;
  var archive = [];

  Object.defineProperty(this, 'temperature', {
    get: function() {
      console.log('get!');
      return temperature;
    },
    set: function(value) {
      temperature = value;
      archive.push({ val: temperature });
    }
  });

  this.getArchive = function() { return archive; };
}

var arc = new Archiver();
arc.temperature; // 'get!'
arc.temperature = 11;
arc.temperature = 13;
arc.getArchive(); // [{ val: 11 }, { val: 13 }]
```

另一个例子：
```javascript
var pattern = {
    get: function () {
        return 'I alway return this string,whatever you have assigned';
    },
    set: function () {
        this.myname = 'this is my name string';
    }
};


function TestDefineSetAndGet() {
    Object.defineProperty(this, 'myproperty', pattern);
}


var instance = new TestDefineSetAndGet();
instance.myproperty = 'test';

// 'I alway return this string,whatever you have assigned'
console.log(instance.myproperty);

// 'this is my name string'
console.log(instance.myname);
```

## Object.defineProperties()
在一个对象上添加或修改一个或者多个自有属性，并返回该对象。

### 语法
`Object.defineProperties(obj, props)`
### 参数
- obj
	将要被添加属性或修改属性的对象
- props
	该对象的一个或多个键值对定义了将要为对象添加或修改的属性的具体配置
### 例子
```javascript
var obj = {};
Object.defineProperties(obj, {
  "property1": {
    value: true,
    writable: true
  },
  "property2": {
    value: "Hello",
    writable: false
  }
  // 等等.
});
alert(obj.property2) //弹出"Hello"
```

## Object.freeze()
冻结一个对象，冻结指的是**不能向这个对象添加新的属性，不能修改其已有属性的值，不能删除已有属性，以及不能修改该对象已有属性的可枚举性、可配置性、可写性**。也就是说，这个对象永远是不可变的。该方法返回被冻结的对象。
### 语法
Object.freeze(obj)
### 参数
- obj
	将要被冻结的对象
### 返回值
被冻结的对象。
### 描述
冻结对象的所有自身属性**都不可能以任何方式被修改**。任何尝试修改该对象的操作都会失败，可能是静默失败，也可能会抛出异常（严格模式中）。

数据属性的值不可更改，访问器属性（有getter和setter）也同样（但由于是函数调用，给人的错觉是还是可以修改这个属性）。**如果一个属性的值是个对象，则这个对象中的属性是可以修改的，除非它也是个冻结对象**。
### 例子
```javascript
var obj = {
  prop: function (){},
  foo: "bar"
};

// 可以添加新的属性,已有的属性可以被修改或删除
obj.foo = "baz";
obj.lumpy = "woof";
delete obj.prop;

var o = Object.freeze(obj);

assert(Object.isFrozen(obj) === true);

// 现在任何修改操作都会失败
obj.foo = "quux"; // 静默失败
obj.quaxxor = "the friendly duck"; // 静默失败,并没有成功添加上新的属性

// ...在严格模式中会抛出TypeError异常
function fail(){
  "use strict";
  obj.foo = "sparky"; // 抛出TypeError异常
  delete obj.quaxxor; // 抛出TypeError异常
  obj.sparky = "arf"; // 抛出TypeError异常
}

fail();

// 使用Object.defineProperty方法同样会抛出TypeError异常
Object.defineProperty(obj, "ohai", { value: 17 }); // 抛出TypeError异常
Object.defineProperty(obj, "foo", { value: "eit" }); // 抛出TypeError异常
```

下面的例子演示了一个冻结对象中的非冻结对象是可以被修改的（浅冻结）。
```javascript
obj = {
  internal : {}
};

Object.freeze(obj);
obj.internal.a = "aValue";

obj.internal.a // "aValue"

// 想让一个对象变的完全冻结,冻结所有对象中的对象,我们可以使用下面的函数.

function deepFreeze (o) {
  var prop, propKey;
  Object.freeze(o); // 首先冻结第一层对象.
  for (propKey in o) {
    prop = o[propKey];
    if (!o.hasOwnProperty(propKey) || !(typeof prop === "object") || Object.isFrozen(prop)) {
      // 跳过原型链上的属性和已冻结的对象.
      continue;
    }

    deepFreeze(prop); //递归调用.
  }
}

obj2 = {
  internal : {}
};

deepFreeze(obj2);
obj2.internal.a = "anotherValue";
obj2.internal.a; // undefined
```

## Object.getOwnPropertyDescriptor()
返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性）
### 语法
`Object.getOwnPropertyDescriptor(obj, prop)`
### 参数
- obj
	在该对象上查看属性
- prop
	一个属性名称，该属性的属性描述符将被返回
### 返回值
如果指定的属性存在于对象上，则返回其属性描述符（property descriptor），否则返回 undefined。

### 描述
该方法允许对一个属性的描述进行检索。在 `Javascript` 中， 属性 由一个字符串类型的“名字”（`name`）和一个“属性描述符”（`property descriptor`）对象构成。

一个属性描述符是一个对象，由下面属性当中的某些组成的：
- value
	该属性的值(仅针对数据属性描述符有效)
- writable
	当且仅当属性的值可以被改变时为 `true`。(仅针对数据属性描述有效)
- get
	获取该属性的访问器函数（getter）。如果没有访问器， 该值为undefined。(仅针对包含访问器或设置器的属性描述有效)
- set
	获取该属性的设置器函数（setter）。 如果没有设置器， 该值为undefined。(仅针对包含访问器或设置器的属性描述有效)
- configurable
	当且仅当指定对象的属性描述可以被改变或者属性可被删除时，为 `true`。
- enumerable
	当且仅当指定对象的属性可以被枚举出时，为 `true`。

##示例
```javascript
var o, d;

o = { get foo() { return 17; } };
d = Object.getOwnPropertyDescriptor(o, "foo");
// d is { configurable: true, enumerable: true, get: /*访问器函数*/, set: undefined }

o = { bar: 42 };
d = Object.getOwnPropertyDescriptor(o, "bar");
// d is { configurable: true, enumerable: true, value: 42, writable: true }

o = {};
Object.defineProperty(o, "baz", { value: 8675309, writable: false, enumerable: false });
d = Object.getOwnPropertyDescriptor(o, "baz");
// d is { value: 8675309, writable: false, enumerable: false, configurable: false }
```

## Object.isExtensible()
判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。

### 语法
`Object.isExtensible(obj)`
### 参数
- obj
	需要检测的对象
### 描述
默认情况下，对象是可扩展的：即可以为他们添加新的属性。以及它们的 `__proto__`  属性可以被更改。`Object.preventExtensions`，`Object.seal` 或 `Object.freeze` 方法都可以标记一个对象为不可扩展（`non-extensible`）。

### 例子
```javascript
// 新对象默认是可扩展的.
var empty = {};
Object.isExtensible(empty); // === true

// ...可以变的不可扩展.
Object.preventExtensions(empty);
Object.isExtensible(empty); // === false

// 密封对象是不可扩展的.
var sealed = Object.seal({});
Object.isExtensible(sealed); // === false

// 冻结对象也是不可扩展.
var frozen = Object.freeze({});
Object.isExtensible(frozen); // === false
```

## Object.seal()
让一个对象密封，并返回被密封后的对象。密封对象是指那些不能添加新的属性，不能删除已有属性，以及不能修改已有属性的可枚举性、可配置性、可写性，但可能可以修改已有属性的值的对象。

### 语法
`Object.seal(obj)`
### 参数
- obj
	将要被密封的对象
### 描述
通常情况下，一个对象是可扩展的（可以添加新的属性）。密封一个对象会让这个对象变的不能添加新属性，且所有已有属性会变的不可配置。属性不可配置的效果就是属性变的不可删除，以及一个数据属性不能被重新定义成为访问器属性，或者反之。但属性的值仍然可以修改。尝试删除一个密封对象的属性或者将某个密封对象的属性从数据属性转换成访问器属性，结果会静默失败或抛出 `TypeError` 异常（严格模式）。

不会影响从原型链上继承的属性。但 `__proto__ (  )` 属性的值也会不能修改。

### 例子
```javascript
var obj = {
    prop: function () {},
    foo: "bar"
  };

// 可以添加新的属性,已有属性的值可以修改,可以删除
obj.foo = "baz";
obj.lumpy = "woof";
delete obj.prop;

var o = Object.seal(obj);

assert(o === obj);
assert(Object.isSealed(obj) === true);

// 仍然可以修改密封对象上的属性的值.
obj.foo = "quux";

// 但不能把一个数据属性重定义成访问器属性.
Object.defineProperty(obj, "foo", { get: function() { return "g"; } }); // 抛出TypeError异常

// 现在,任何属性值以外的修改操作都会失败.
obj.quaxxor = "the friendly duck"; // 静默失败,新属性没有成功添加
delete obj.foo; // 静默失败,属性没有删除成功

// ...在严格模式中,会抛出TypeError异常
function fail() {
  "use strict";
  delete obj.foo; // 抛出TypeError异常
  obj.sparky = "arf"; // 抛出TypeError异常
}
fail();

// 使用Object.defineProperty方法同样会抛出异常
Object.defineProperty(obj, "ohai", { value: 17 }); // 抛出TypeError异常
Object.defineProperty(obj, "foo", { value: "eit" }); // 成功将原有值改变
```
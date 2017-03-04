---
title: vue2学习过程
tag: [vue2, javascript, js]
category:
  - 技术
  - javascript
date: 2017-03-02 14:52:05
updated: 2017-03-02 14:52:05
---

指令（Directives）是带有 `v-` 前缀的特殊属性。指令属性的值预期是**单一 `JavaScript` 表达式**（除了 `v-for`，之后再讨论）。

指令的职责就是**当其表达式的值改变时相应地将某些行为应用到 `DOM` 上**。

## 参数

一些指令能接受一个“参数”，在指令后以冒号指明。例如， `v-bind` 指令被用来响应地更新 HTML 属性：
```HTML
<a v-bind:href="url"></a>
```
在这里 `href` 是参数，告知 `v-bind` 指令将该元素的 `href` 属性与表达式 `url` 的值绑定。

另一个例子是 `v-on` 指令，它用于监听 DOM 事件：
```HTML
<a v-on:click="doSomething">
```
在这里参数是监听的事件名。

## 修饰符

修饰符（Modifiers）是以半角句号 `.` 指明的特殊后缀，用于指出一个指令应该以特殊方式绑定。

# 计算属性
任何复杂逻辑都应当使用计算属性，避免模版难以维护。

## 计算缓存 vs Methods
**计算属性是基于它的依赖缓存**。计算属性只有在它的相关依赖发生改变时才会重新取值。这就意味着只要 `message` 没有发生改变，多次访问 `reversedMessage` 计算属性会立即返回之前的计算结果，而不必再次执行函数。

## 计算 setter

计算属性默认只有 `getter` ，不过在需要时也可以提供一个 `setter` ：
```JS
// ...
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
// ...
```
现在在运行 `vm.fullName = 'John Doe'` 时， `setter` 会被调用， `vm.firstName` 和 `vm.lastName` 也会被对应更新。

# 条件渲染
## v-else-if

	2.1.0 新增

# 列表渲染
- 数组：`v-for="(item[, index]) in items"` index可以省略
- 对象：`v-for="(value[, key][, index]) in object"` key和index可以省略
- 取整：`v-for="n in 10"` 1-10

# 事件处理器
## 事件修饰符
Vue.js 为 `v-on` 提供了 **事件修饰符**。通过由点(.)表示的指令后缀来调用修饰符。
- stop
- prevent
- capture
- self
- once

```JS
<!-- 阻止单击事件冒泡 -->
<a v-on:click.stop="doThis"></a>
<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="onSubmit"></form>
<!-- 修饰符可以串联  -->
<a v-on:click.stop.prevent="doThat"></a>
<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>
<!-- 添加事件侦听器时使用事件捕获模式 -->
<div v-on:click.capture="doThis">...</div>
<!-- 只当事件在该元素本身（而不是子元素）触发时触发回调 -->
<div v-on:click.self="doThat">...</div>
```

	2.1.4 新增
```JS
<!-- 点击事件将只会触发一次 -->
<a v-on:click.once="doThis"></a>
```

## 按键修饰符
全部的按键别名：
- enter
- tab
- delete (捕获 “删除” 和 “退格” 键)
- esc
- space
- up
- down
- left
- right
可以通过全局 config.keyCodes 对象自定义按键修饰符别名：
```JS
// 可以使用 v-on:keyup.f1
Vue.config.keyCodes.f1 = 112
```
[键盘按键对应的ASCII码值](http://no001.blog.51cto.com/1142339/287798)

	2.1.0 新增
可以用如下修饰符开启鼠标或键盘事件监听，使在按键按下时发生响应。
- ctrl
- alt
- shift
- meta(cmd/windows)

```HTML
<!-- Alt + C -->
<input @keyup.alt.67="clear">
<!-- Ctrl + Click -->
<div @click.ctrl="doSomething">Do something</div>
```

	疑问：复制粘贴操作会不会被覆盖?

# 表单控件绑定
修饰符
```JS
<!-- 在 "change" 而不是 "input" 事件中更新 -->
<input v-model.lazy="msg" >
<!-- 自动将用户的输入值转为 Number 类型（如果原值的转换结果为 NaN 则返回原值） -->
<input v-model.number="age" type="number">
<!-- 自动过滤用户输入的首尾空格 -->
<input v-model.trim="msg">
```

# 组件
## 注册组件
```JS
<!-- 注册一个全局组件 -->
Vue.component('my-component', {
  // 选项
})

<!-- 局部注册 -->
var Child = {
  template: '<div>A custom component!</div>'
}
new Vue({
  // ...
  components: {
    // <my-component> 将只在父模板可用
    'my-component': Child
  }
})
```
## 构成组件
在 Vue.js 中，父子组件的关系可以总结为 **props down**, **events up** 。父组件通过 **props** 向下传递数据给子组件，子组件通过 **events** 给父组件发送消息。
### 使用 Prop 传递数据
类似于用 `v-bind` 绑定 HTML 特性到一个表达式，也可以用 `v-bind` 动态绑定 props 的值到父组件的数据中。每当父组件的数据变化时，该变化也会传导给子组件：
```HTML
<div>
  <input v-model="parentMsg">
  <br>
  <child v-bind:my-message="parentMsg"></child>
</div>
```
### Prop 验证
```JS
Vue.component('example', {
  props: {
    // 基础类型检测 （`null` 意思是任何类型都可以）
    propA: Number,
    // 多种类型
    propB: [String, Number, Boolean, Array],
    // 必传且是字符串
    propC: {
      type: String,
      required: true
    },
    // 数字，有默认值
    propD: {
      type: Number,
      default: 100
    },
    // 数组／对象的默认值应当由一个工厂函数返回
    propE: {
      type: Object,
      default: function () {
        return { message: 'hello' }
      }
    },
    // 自定义验证函数
    propF: {
      validator: function (value) {
        return value > 10
      }
    }
    // type 也可以是一个自定义构造器，使用 instanceof 检测。
	// 当 prop 验证失败了，如果使用的是开发版本会抛出一条警告。
  }
})
```
## 自定义事件
### 使用 v-on 绑定自定义事件

每个 Vue 实例都实现了事件接口(Events interface)，即：
- 使用 $on(eventName) 监听事件
- 使用 $emit(eventName) 触发事件

父组件可以在使用子组件的地方直接用 `v-on` 来监听子组件触发的事件。
```HTML
<div id="counter-event-example">
  <p>{{ total }}</p>
  <button-counter v-on:incrementOn="incrementTotal"></button-counter>
  <button-counter v-on:incrementOn="incrementTotal"></button-counter>
</div>
```
```JS
Vue.component('button-counter', {
  template: '<button v-on:click="incrementChild">{{ counter }}</button>',
  data: function () {
    return {
      counter: 0
    }
  },
  methods: {
    incrementChild: function () {
      this.counter += 1
      this.$emit('incrementOn')
    }
  },
})
new Vue({
  el: '#counter-event-example',
  data: {
    total: 0
  },
  methods: {
    incrementTotal: function () {
      this.total += 1
    }
  }
})
```

### 使用自定义事件的表单输入组件
```HTML
<div id="app">
  <currency-input    label="Price"    	 v-model="price"></currency-input>
  <currency-input    label="Shipping"    v-model="shipping"></currency-input>
  <currency-input    label="Handling"    v-model="handling"></currency-input>
  <currency-input    label="Discount"    v-model="discount"></currency-input>

  <p>Total: ${{ total }}</p>
</div>
```
```JS
Vue.component('currency-input', {
  template: '\
    <div>\
      <label v-if="label">{{ label }}</label>\
      $\
      <input\
        ref="input"\
        v-bind:value="value"\
        v-on:input="updateValue($event.target.value)"\
        v-on:focus="selectAll"\
        v-on:blur="formatValue"\
      >\
    </div>\
  ',
  props: {
    value: {
      type: Number,
      default: 0
    },
    label: {
      type: String,
      default: ''
    }
  },
  mounted: function () {
    this.formatValue()
  },
  methods: {
    updateValue: function (value) {
      var result = currencyValidator.parse(value, this.value)
      if (result.warning) {
        this.$refs.input.value = result.value
      }
      this.$emit('input', result.value)
    },
    formatValue: function () {
      this.$refs.input.value = currencyValidator.format(this.value)
    },
    selectAll: function (event) {
      // Workaround for Safari bug
      // http://stackoverflow.com/questions/1269722/selecting-text-on-focus-using-jquery-not-working-in-safari-and-chrome
      setTimeout(function () {
      	event.target.select()
      }, 0)
    }
  }
})

new Vue({
  el: '#app',
  data: {
    price: 0,
    shipping: 0,
    handling: 0,
    discount: 0
  },
  computed: {
    total: function () {
      return ((
        this.price * 100 + this.shipping * 100 + this.handling * 100
         - this.discount * 100
      ) / 100).toFixed(2)
    }
  }
})
```
### 作用域插槽

	2.1.0 新增
作用域插槽是一种特殊类型的插槽，用作（可以传入数据的）可重用模板,而不是已渲染元素。
在子组件中，只需将数据传递到插槽，就像你将 prop 传递给组件一样：
```HTML
<div class="child">
  <slot text="hello from child"></slot>
</div>
```
在父级中，具有特殊属性 `scope` 的 `<template>` 元素，表示它是作用域插槽的模板。`scope` 的值对应一个临时变量名，此变量接收从子组件中传递的 prop 对象：
```HTML
<div class="parent">
  <child>
    <template scope="props">
      <span>hello from parent</span>
      <span>{{ props.text }}</span>
    </template>
  </child>
</div>
```

# 关于Virtual DOM的文章
- [深度剖析：如何实现一个 Virtual DOM 算法](https://github.com/livoras/blog/issues/13)
- [Vue原理解析之Virtual Dom](https://segmentfault.com/a/1190000008291645)
- [深入研究Virtual DOM](http://www.lixuejiang.me/2016/12/18/%E6%B7%B1%E5%85%A5%E7%A0%94%E7%A9%B6Virtual-DOM/)

# 前端测试

[聊一聊前端自动化测试](https://segmentfault.com/a/1190000004558796)
---
title: "(译)Golang类型参数草案设计"
date: 2020-07-03T08:25:05+08:00
lastmod: 2020-07-08T12:05:13+08:00
tags: [golang, generic]
categories: [golang, generic, 译文]
draft: true
---
{{< blockquote author="Ian Lance Taylor, Robert Griesemer" source="June 16, 2020" link="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md" >}}
  Type Parameters - Draft Design: https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md
{{< /blockquote >}}

## 摘要
我们建议扩展Go语言，以便为类型和函数添加可选的类型参数。类型参数可能受接口类型的约束。我们还建议扩展用作类型约束的接口类型，以允许列出可能分配给它们的类型集。在许多情况下，都支持通过统一算法进行类型推断，从而可以从函数调用中省略类型实参。该设计与Go 1完全向后兼容。
{{< expand "原文" >}}
<p>We suggest extending the Go language to add optional type parameters to types and functions. Type parameters may be constrained by interface types. We also suggest extending interface types, when used as type constraints, to permit listing the set of types that may be assigned to them. Type inference via a unification algorithm is supported to permit omitting type arguments from function calls in many cases. The design is fully backward compatible with Go 1.</p>
{{< /expand >}}

## 如何阅读这份设计草案
这份草案很长，下面一些有关如何阅读的指南。
{{< expand "原文" >}}
<p>this document is long. here is some guidance on how to read it.</p>
{{< /expand >}}

- 我们从一个高层次的概述开始，非常简要地描述这些概念。
- 然后，我们从头开始解释完整的设计，并通过简单的示例介绍我们需要的细节。
- 完整描述设计之后，我们将讨论实现，设计中的一些问题以及与其他泛型方法的比较。
- 然后，我们提供有关如何在实践中使用此设计的几个完整示例。
- 在示例之后的附录中讨论了一些次要细节。
{{< expand "原文" >}}
<li>We start with a high level overview, describing the concepts very briefly.</li>
<li>We then explain the full design starting from scratch, introducing the details as we need them, with simple examples.</li>
<li>After the design is completely described, we discuss implementation, some issues with the design, and a comparison with other approaches to generics.</li>
<li>We then present several complete examples of how this design would be used in practice.</li>
<li>Following the examples some minor details are discussed in an appendix.</li>
{{< /expand >}}

## 高层次概述
本节非常简短地解释了设计草案建议的更改，适用于已经熟悉泛型如何在Go之类的语言中工作的人们。这些概念将在以下各节中详细说明。
{{< expand "原文" >}}
<p>This section explains the changes suggested by the design draft very briefly. This section is intended for people who are already familiar with how generics would work in a language like Go. These concepts will be explained in detail in the following sections.</p>
{{< /expand >}}

- 函数可以具有由关键字`type`引入的其他类型参数列表：`func F（type T）（p T）{...}`。
- 这些类型参数可以在函数参数和函数体内使用。
- 类型也可以具有类型参数列表：`type M(type T) []T`。
- 每个类型参数可以具有可选的类型约束：`func F(type T Constraint)(p T) { ... }`。
- 类型约束是接口类型。
- 用作类型约束的接口类型可以具有预先声明的类型列表，只有基础类型是类型列表中的类型才能实现该接口。
- 使用泛型函数或类型需要传递类型实参。
- 在通常情况下，类型推断允许省略类型参数。
- 如果类型参数具有类型约束，则其类型参数必须实现约束接口。
- 泛型函数只能使用类型约束所允许的操作。
{{< expand "原文" >}}
<li>Functions can have an additional type parameter list introduced by the keyword <code>type</code>: <code>func F(type T)(p T) { ... }</code>.</li>
<li>These type parameters can be used by the regular parameters and in the function body.</li>
<li>Types can also have a type parameter list: <code>type M(type T) []T</code>.</li>
<li>Each type parameter can have an optional type constraint: <code>func F(type T Constraint)(p T) { ... }</code>.</li>
<li>Type constraints are interface types.</li>
<li>Interface types used as type constraints can have a list of predeclared types; only types whose underlying type is one of those types can implement the interface.</li>
<li>Using a generic function or type requires passing type arguments.</li>
<li>Type inference permits omitting the type arguments in common cases.</li>
<li>If a type parameter has a type constraint its type argument must implement the interface.</li>
<li>Generic functions may only use operations permitted by the type constraint.</li>
{{< /expand >}}

在以下各节中，我们将详细介绍这些语言更改。你可能希望跳到这些[示例](#示例)，看看设计草案的代码在实践中的使用。

{{< expand "原文" >}}
<p>In the following sections we work through each of these language changes in great detail. You may prefer to skip ahead to the examples to see what generic code written to this design draft will look like in practice.</p>
{{< /expand >}}

## 背景
该版本的设计草案与2019年7月31日提出的版本有很多相似之处，但`contracts`已被删除并由`interface types`代替。
{{< expand "原文" >}}
<p>This version of the design draft has many similarities to the one presented on July 31, 2019, but contracts have been removed and replaced by interface types.</p>
{{< /expand >}}

有许多要求为Go[添加泛型编程支持的请求](https://github.com/golang/go/wiki/ExperienceReports#generics)。并在[issue](https://golang.org/issue/15292)和[活动文档](https://docs.google.com/document/d/1vrAy9gMpMoS3uaVphB32uVXX4pi-HnNjkMEgyAHX4N4/view)中进行了广泛的讨论。
{{< expand "原文" >}}
<p>There have been many requests to add additional support for generic programming in Go. There has been extensive discussion on the issue tracker and on a living document.</p>
{{< /expand >}}

可以通过上面的链接找到多种添加类型参数的建议。这里提出的许多想法以前都曾出现过。此处描述的主要新功能是对语法和约束接口类型的仔细研究。
{{< expand "原文" >}}
<p>There have been several proposals for adding type parameters, which can be found through the links above. Many of the ideas presented here have appeared before. The main new features described here are the syntax and the careful examination of interface types as constraints.</p>
{{< /expand >}}

本设计草案建议扩展Go语言，以添加一种形式的参数多态性，其中类型参数不受声明的子类型关系（如在某些面向对象的语言中）的约束，而受显式定义的结构约束的约束。
{{< expand "原文" >}}
<p>This design draft suggests extending the Go language to add a form of parametric polymorphism, where the type parameters are bounded not by a declared subtyping relationship (as in some object oriented languages) but by explicitly defined structural constraints.</p>
{{< /expand >}}

此设计不支持模板元编程或任何其他形式的编译时编程。
{{< expand "原文" >}}
<p>This design does not support template metaprogramming or any other form of compile time programming.</p>
{{< /expand >}}

由于术语`泛型`在Go社区中被广泛使用，因此我们将在下文中将其用作表示具有类型参数的函数或类型的简写。不要将本设计中使用的`泛型`一词与其他语言（例如C++，C＃，Java或Rust）中的同一术语混淆；它们有相似之处，但不相同。
{{< expand "原文" >}}
<p>As the term generic is widely used in the Go community, we will use it below as a shorthand to mean a function or type that takes type parameters. Don't confuse the term generic as used in this design with the same term in other languages like C++, C#, Java, or Rust; they have similarities but are not the same.</p>
{{< /expand >}}

## 设计
我们将基于简单的示例分阶段描述完整的设计。

{{< expand "原文" >}}
<p>We will describe the complete design in stages based on simple examples.</p>
{{< /expand >}}

### 类型参数
泛型代码是指使用延迟指定类型的代码。未指定的类型称为`type parameter`。运行泛型代码时，`type parameter`将设置为`type argument`。
{{< expand "原文" >}}
<p>Generic code is code that is written using types that will be specified later. An unspecified type is called a <I>type parameter</I>. When running the generic code, the type parameter will be set to a <I>type argument</I>.</p>
{{< /expand >}}

这是一个打印出切片中每个元素的函数，其中切片的元素类型（这里称为`T`）是未知的。这是我们要允许以支持泛型编程的函数类型的一个简单例子。（稍后我们还将讨论[泛型类型](#泛型类型)）。
{{< expand "原文" >}}
<p>Here is a function that prints out each element of a slice, where the element type of the slice, here called <code>T</code>, is unknown. This is a trivial example of the kind of function we want to permit in order to support generic programming. (Later we'll also discuss generic types).</p>
{{< /expand >}}

```go
// Print 打印切片的元素。
// 可以使用任何切片值来调用它。
func Print(s []T) { // 只是一个示例，而不是建议的语法。
	for _, v := range s {
		fmt.Println(v)
	}
}
```

使用这种方法，首先要做出的决定是：应如何声明类型参数`T`？在Go这样的语言中，我们希望每个标识符都以某种方式声明。
{{< expand "原文" >}}
<p>With this approach, the first decision to make is: how should the type parameter <code>T</code> be declared? In a language like Go, we expect every identifier to be declared in some way.</p>
{{< /expand >}}

在这里，我们进行设计决策：类型参数与普通的非类型函数参数相似，因此应与其他参数一起列出。但是，类型参数与非类型参数不同，因此，尽管它们出现在参数列表中，但我们还是要加以区分。这导致我们做出下一个设计决策：我们定义一个附加的，可选的参数列表，描述类型参数。此参数列表出现在常规参数之前。它以关键字`type`开头，并列出类型参数。
{{< expand "原文" >}}
<p>Here we make a design decision: type parameters are similar to ordinary non-type function parameters, and as such should be listed along with other parameters. However, type parameters are not the same as non-type parameters, so although they appear in the list of parameters we want to distinguish them. That leads to our next design decision: we define an additional, optional, parameter list, describing type parameters. This parameter list appears before the regular parameters. It starts with the keyword <code>type</code>, and lists type parameters.</p>
{{< /expand >}}

```go
// Print 打印任意切片的元素。
// Print 具有类型参数T，并且具有单个（非类型）参数s，是该类型参数的切片
func Print(type T)(s []T) {
	// 和👆一样
}
```

这表示在函数`Print`中，标识符`T`是一个类型参数，当前是未知的类型，但是在调用该函数时会知道。如上所述，当描述普通的非类型参数时，类型参数可以用作类型。它也可以在函数体内使用。
{{< expand "原文" >}}
<p>This says that within the function <code>Print</code> the identifier <code>T</code> is a type parameter, a type that is currently unknown but that will be known when the function is called. As seen above, the type parameter may be used as a type when describing the ordinary non-type parameters. It may also be used within the body of the function.</p>
{{< /expand >}}

由于`Print`具有类型参数，因此任何`Print`调用都必须提供类型参数。稍后，我们将看到通常如何通过使用[函数参数类型推断](#函数参数类型推断)从非类型参数推导出该类型参数。现在，我们将显式传递类型参数。类型实参的传递与声明类型实参的传递非常相似：作为单独的参数列表。在函数调用时，不需要使用`type`关键字。
{{< expand "原文" >}}
<p>Since <code>Print</code> has a type parameter, any call of <code>Print</code> must provide a type argument. Later we will see how this type argument can usually be deduced from the non-type argument, by using function argument type inference. For now, we'll pass the type argument explicitly. Type arguments are passed much like type parameters are declared: as a separate list of arguments. At the call site, the <code>type</code> keyword is not used.</p>
{{< /expand >}}

```go
	// 用 []int 调用 Print.
	// Print 的类型参数为T，我们要传递 []int，
	// 因此我们通过编写 Print(int) 来传递 int 的类型参数。
	// 函数 Print(int) 期望 []int 作为参数。

	Print(int)([]int{1, 2, 3})

	// 打印:
	// 1
	// 2
	// 3
```

### 约束条件
让我们的例子稍微复杂一些。我们将其变成一个可以通过在每个元素上调用`String`方法将任何类型的切片转换为`[]string`的函数。
{{< expand "原文" >}}
<p>Let‘s make our example slightly more complicated. Let’s turn it into a function that converts a slice of any type into a <code>[]string</code> by calling a <code>String</code> method on each element.</p>
{{< /expand >}}

```go
// 这个方法是无效的。
func Stringify(type T)(s []T) (ret []string) {
	for _, v := range s {
		ret = append(ret, v.String()) // 无效
	}
	return ret
}
```

乍一看似乎可以，但是在此示例中，`v`具有类型`T`，我们对`T`一无所知。特别是，我们不知道`T`具有`String`方法。因此，对`v.String()`的调用是无效的。
{{< expand "原文" >}}
<p>This might seem OK at first glance, but in this example <code>v</code> has type <code>T</code>, and we don‘t know anything about <code>T</code>. In particular, we don’t know that <code>T</code> has a <code>String</code> method. So the call to <code>v.String()</code> is invalid.</p>
{{< /expand >}}

自然而然地，在支持泛型编程的其他语言中也会出现相同的问题。例如，在C++中，泛型函数（用C++术语来说是函数模板）可以对泛型类型的值调用任何方法。也就是说，在C++方法中，可以调用`v.String()`。如果使用没有`String`方法的类型实参调用该函数，则使用该类型实参编译对`v.String`的调用时将报告错误。这些错误可能很长，因为在错误发生之前可能有几层泛型函数调用，因此必须报告所有错误以了解出了什么问题。
{{< expand "原文" >}}
<p>Naturally, the same issue arises in other languages that support generic programming. In C++, for example, a generic function (in C++ terms, a function template) can call any method on a value of generic type. That is, in the C++ approach, calling <code>v.String()</code> is fine. If the function is called with a type argument that does not have a <code>String</code> method, the error is reported when compiling the call to <code>v.String</code> with that type argument. These errors can be lengthy, as there may be several layers of generic function calls before the error occurs, all of which must be reported to understand what went wrong.</p>
{{< /expand >}}

对于Go语言，C++方法将是一个糟糕的选择。原因之一是语言的风格。在Go中，我们不会引用名称，例如`String`，而是希望它们存在。找到它们时，Go会将所有名称解析为其声明。
{{< expand "原文" >}}
<p>The C++ approach would be a poor choice for Go. One reason is the style of the language. In Go we don't refer to names, such as, in this case, <code>String</code>, and hope that they exist. Go resolves all names to their declarations when they are seen.</p>
{{< /expand >}}

另一个原因是Go旨在支持大规模编程。我们必须考虑以下情况：泛型函数定义（上面的`Stringify`）和对泛型函数的调用（未显示，但可能在其他软件包中）相距甚远。通常，所有泛型代码都希望类型参数满足某些要求。我们将这些要求称为约束（其他语言也有类似的想法，称为类型界限或特征界限或概念）。在这种情况下，约束非常明显：类型必须具有`String() string`方法。在其他情况下，它可能不那么明显。
{{< expand "原文" >}}
<p>Another reason is that Go is designed to support programming at scale. We must consider the case in which the generic function definition (<code>Stringify</code>, above) and the call to the generic function (not shown, but perhaps in some other package) are far apart. In general, all generic code expects the type arguments to meet certain requirements. We refer to these requirements as constraints (other languages have similar ideas known as type bounds or trait bounds or concepts). In this case, the constraint is pretty obvious: the type has to have a <code>String() string</code> method. In other cases it may be much less obvious.</p>
{{< /expand >}}

我们不想从`Stringify`发生的任何事情中获得约束（在这种情况下，请调用`String`方法）。如果这样做，对`Stringify`的微小更改可能会更改约束。这意味着较小的更改可能导致调用该函数的代码太远而意外中断。 `Stringify`故意更改其约束并强迫用户进行更改是很好的。我们要避免的是`Stringify`意外更改其约束。
{{< expand "原文" >}}
<p>We don‘t want to derive the constraints from whatever <code>Stringify</code> happens to do (in this case, call the <code>String</code> method). If we did, a minor change to <code>Stringify</code> might change the constraints. That would mean that a minor change could cause code far away, that calls the function, to unexpectedly break. It’s fine for <code>Stringify</code> to deliberately change its constraints, and force users to change. What we want to avoid is <code>Stringify</code> changing its constraints accidentally.</p>
{{< /expand >}}

这意味着约束必须对调用者传递的类型参数和泛型函数中的代码都设置限制。调用者只能传递满足约束的类型参数。泛型函数只能以约束所允许的方式使用这些值。我们认为这是一条重要规则，适用于在Go中定义泛型编程的任何尝试：泛型代码只能使用已知其类型参数实现的操作。
{{< expand "原文" >}}
<p>This means that the constraints must set limits on both the type arguments passed by the caller and the code in the generic function. The caller may only pass type arguments that satisfy the constraints. The generic function may only use those values in ways that are permitted by the constraints. This is an important rule that we believe should apply to any attempt to define generic programming in Go: generic code can only use operations that its type arguments are known to implement.</p>
{{< /expand >}}

### 任何类型都允许的操作
在进一步讨论约束之前，让我们简要地指出在没有约束的情况下会发生什么。如果泛型函数没有为类型参数指定约束，就像上面的`Print`方法一样，则该参数允许使用任何类型参数。泛型函数只能与该类型参数的值一起使用的操作是允许用于任何类型的值的那些操作。在上面的示例中，`Print`函数声明一个变量`v`，其类型为类型参数`T`，并将该变量传递给函数。
{{< expand "原文" >}}
<p>Before we discuss constraints further, let's briefly note what happens in their absence. If a generic function does not specify a constraint for a type parameter, as is the case for the <code>Print</code> method above, then any type argument is permitted for that parameter. The only operations that the generic function can use with values of that type parameter are those operations that are permitted for values of any type. In the example above, the <code>Print</code> function declares a variable <code>v</code> whose type is the type parameter <code>T</code>, and it passes that variable to a function.</p>
{{< /expand >}}

任何类型允许的操作是：
{{< expand "原文" >}}
<p>The operations permitted for any type are:</p>
{{< /expand >}}

- 声明那些类型的变量
- 将相同类型的其他值分配给这些变量
- 将这些变量传递给函数或从函数返回它们
- 取那些变量的地址
- 将这些类型的值转换或分配给类型`interface{}`
- 将`T`类型的值转换为`T`类型（允许，但无用）
- 使用类型断言将接口值转换为类型
- 在类型`switch`中将类型用作`case`
- 定义和使用使用这些类型的复合类型，例如该类型的切片
- 将类型传递给一些内置函数，例如`new`
{{< expand "原文" >}}
<li>declare variables of those types</li>
<li>assign other values of the same type to those variables</li>
<li>pass those variables to functions or return them from functions</li>
<li>take the address of those variables</li>
<li>convert or assign values of those types to the type <code>interface{}</code></li>
<li>convert a value of type <code>T</code> to type <code>T</code> (permitted but useless)</li>
<li>use a type assertion to convert an interface value to the type</li>
<li>use the type as a case in a type switch</li>
<li>define and use composite types that use those types, such as a slice of that type</li>
<li>pass the type to some builtin functions such as <code>new</code></li>
{{< /expand >}}

尽管目前预计不会进行任何操作，但将来的语言更改可能还会添加其他此类操作。
{{< expand "原文" >}}
<p>It's possible that future language changes will add other such operations, though none are currently anticipated.</p>
{{< /expand >}}

### 定义约束
Go已经具有与我们需要的约束接近的构造：接口类型。接口类型是一组方法。可以分配给接口类型的变量的唯一值是那些类型实现相同方法的值。除了任何类型允许的操作之外，只能使用接口类型的值执行的操作是调用方法。
{{< expand "原文" >}}
<p>Go already has a construct that is close to what we need for a constraint: an interface type. An interface type is a set of methods. The only values that can be assigned to a variable of interface type are those whose types implement the same methods. The only operations that can be done with a value of interface type, other than operations permitted for any type, are to call the methods.</p>
{{< /expand >}}

用类型参数调用泛型函数类似于分配给接口类型的变量：类型参数必须实现类型参数的约束。编写泛型函数就像使用接口类型的值：泛型代码只能使用约束所允许的操作（或任何类型所允许的操作）。
{{< expand "原文" >}}
<p>Calling a generic function with a type argument is similar to assigning to a variable of interface type: the type argument must implement the constraints of the type parameter. Writing a generic function is like using values of interface type: the generic code can only use the operations permitted by the constraint (or operations that are permitted for any type).</p>
{{< /expand >}}

在这种设计中，约束只是接口类型。实现约束只是实现接口类型。（稍后，我们将看到如何为方法调用以外的操作定义约束，例如二进制运算符）。
{{< expand "原文" >}}
<p>In this design, constraints are simply interface types. Implementing a constraint is simply implementing the interface type. (Later we'll see how to define constraints for operations other than method calls, such as binary operators).</p>
{{< /expand >}}

对于`Stringify`示例，我们需要一个带有`String`方法的接口类型，该方法不带任何参数并返回`string`类型的值。
{{< expand "原文" >}}
<p>For the <code>Stringify</code> example, we need an interface type with a <code>String</code> method that takes no arguments and returns a value of type <code>string</code>.</p>
{{< /expand >}}

```go
// Stringer是一种类型约束，它要求type参数具有String方法，
// 并允许泛型函数调用String。
// String方法应返回该值的字符串表示形式。
type Stringer interface {
	String() string
}
```
（此讨论无关紧要，但这定义了与标准库的`fmt.Stringer`类型相同的接口，实际代码可能只使用`fmt.Stringer`。）
{{< expand "原文" >}}
<p>(It doesn‘t matter for this discussion, but this defines the same interface as the standard library’s <code>fmt.Stringer</code> type, and real code would likely simply use <code>fmt.Stringer</code>.)</p>
{{< /expand >}}

### 使用约束
对于泛型函数，可以将约束视为类型参数的类型：元类型。因此，尽管泛型函数不一定需要使用约束，但使用了约束时，它们会作为元类型在类型参数列表中列出。
{{< expand "原文" >}}
<p>For a generic function, a constraint can be thought of as the type of the type argument: a meta-type. So, although generic functions are not required to use constraints, when they do they are listed in the type parameter list as the meta-type of a type parameter.</p>
{{< /expand >}}

```go
// Stringify在 s 的每个元素上调用 String 方法，并返回结果。
func Stringify(type T Stringer)(s []T) (ret []string) {
	for _, v := range s {
		ret = append(ret, v.String())
	}
	return ret
}
```

单个类型参数`T`后跟适用于`T`的约束，在这种情况下为`Stringer`。
{{< expand "原文" >}}
<p>The single type parameter <code>T</code> is followed by the constraint that applies to <code>T</code>, in this case <code>Stringer</code>.</p>
{{< /expand >}}

### 多个类型参数
尽管`Stringify`示例仅使用单个类型参数，但函数可能具有多个类型参数。
{{< expand "原文" >}}
<p>Although the <code>Stringify</code> example uses only a single type parameter, functions may have multiple type parameters.</p>
{{< /expand >}}

```go
// Print2 具有两个类型参数和两个非类型参数。
func Print2(type T1, T2)(s1 []T1, s2 []T2) { ... }
```
比较一下
{{< expand "原文" >}}
<p>Compare this to</p>
{{< /expand >}}

```go
// Print2Same 具有一个类型参数和两个非类型参数。
func Print2Same(type T)(s1 []T, s2 []T) { ... }
```

在`Print2`中，`s1`和`s2`可以是不同类型的切片。在`Print2Same`中，`s1`和`s2`必须是相同元素类型的切片。
{{< expand "原文" >}}
<p>In <code>Print2</code> <code>s1</code> and <code>s2</code> may be slices of different types. In <code>Print2Same</code> <code>s1</code> and <code>s2</code> must be slices of the same element type.</p>
{{< /expand >}}

每个类型参数可能都有其自己的约束。
{{< expand "原文" >}}
<p>Each type parameter may have its own constraint.</p>
{{< /expand >}}

```go
// Stringer 是需要String方法的类型约束。 
// String 方法应返回该值的字符串表示形式。
type Stringer interface {
	String() string
}

// Plusser 是需要Plus方法的类型约束。 
// Plus 方法应将参数添加到内部字符串中并返回结果。
type Plusser interface {
	Plus(string) string
}

// ConcatTo 使用 String 方法获取元素切片，使用 Plus 方法获取元素切片。
// 切片应具有相同的元素数量。
// 这会将 s 的每个元素转换为字符串，
// 将其传递给 p 的相应元素的 Plus 方法，
// 并返回结果字符串的一部分。
func ConcatTo(type S Stringer, P Plusser)(s []S, p []P) []string {
	r := make([]string, len(s))
	for i, v := range s {
		r[i] = p[i].Plus(v.String())
	}
	return r
}
```

如果为任何类型参数指定了约束，则每个类型参数都必须具有约束。如果某些类型参数需要约束而有些则不需要，则那些不需要参数的约束应该具有`interface {}`的约束。
{{< expand "原文" >}}
<p>If a constraint is specified for any type parameter, every type parameter must have a constraint. If some type parameters need a constraint and some do not, those that do not should have a constraint of <code>interface{}</code>.</p>
{{< /expand >}}

```go
// StrAndPrint 接受可以是任何类型的标签切片，
// 和必须具有 String 方法的切片值，
// 将值转换为字符串，并打印标记的字符串。
func StrAndPrint(type L interface{}, T Stringer)(labels []L, vals []T) {
	// 上面定义了 Stringify。它返回一个 []string。
	for i, s := range Stringify(vals) {
		fmt.Println(labels[i], s)
	}
}
```

单个约束可以用于多个类型参数，就像单个约束可以用于多个非类型函数参数一样。该约束分别应用于每个类型参数。
{{< expand "原文" >}}
<p>A single constraint can be used for multiple type parameters, just as a single type can be used for multiple non-type function parameters. The constraint applies to each type parameter separately.</p>
{{< /expand >}}

```go
// Stringify2将两个不同类型的切片转换为字符串，
// 并返回所有字符串的串联。
func Stringify2(type T1, T2 Stringer)(s1 []T1, s2 []T2) string {
	r := ""
	for _, v1 := range s1 {
		r += v1.String()
	}
	for _, v2 := range s2 {
		r += v2.String()
	}
	return r
}
```

### 泛型类型
我们不仅需要泛型函数：我们还需要泛型类型。我们建议将类型扩展为采用类型参数。
{{< expand "原文" >}}
<p>We want more than just generic functions: we also want generic types. We suggest that types be extended to take type parameters.</p>
{{< /expand >}}

类型的参数就像函数的类型参数一样。

在类型定义内，可以像其他类型一样使用类型参数。
{{< expand "原文" >}}
<p>A type‘s parameters are just like a function’s type parameters.</p>
<p>Within the type definition, the type parameters may be used like any other type.</p>
{{< /expand >}}

要使用泛型类型，必须提供类型参数。这看起来像一个函数调用，只是在这种情况下该函数实际上是一种类型。这称为*实例化(instantiation)*。当通过为类型参数提供类型实参来实例化类型时，我们会生成一个类型，其中类型定义中对类型参数的每次使用都被相应的类型实参替换。
{{< expand "原文" >}}
<p>To use a generic type, you must supply type arguments. This looks like a function call, except that the function in this case is actually a type. This is called <I>instantiation</I>. When we instantiate a type by supplying type arguments for the type parameters, we produce a type in which each use of a type parameter in the type definition is replaced by the corresponding type argument.</p>
{{< /expand >}}

```go
// v 是一个int值的向量。
//
// 这类似于假装"Vector(int)"是有效的标识符，
// 然后这样写
//   type "Vector(int)" []int
//   var v "Vector(int)"
// Vector(int)的所有用法都将引用相同的"Vector(int)"类型。
//
var v Vector(int)
```

泛型类型可以具有方法。方法的接收者类型必须声明与接收者类型的定义中声明的数量相同的类型参数。声明它们时没有`type`关键字或任何约束。
{{< expand "原文" >}}
<p>Generic types can have methods. The receiver type of a method must declare the same number of type parameters as are declared in the receiver type's definition. They are declared without the <code>type</code> keyword or any constraint.</p>
{{< /expand >}}

```go
// Push 将值添加到向量的末尾。
func (v *Vector(T)) Push(x T) { *v = append(*v, x) }
```

方法声明中列出的类型参数不必与类型声明中的类型参数具有相同的名称。特别是，如果方法未使用它们，那么它们可以是`_`。
{{< expand "原文" >}}
<p>The type parameters listed in a method declaration need not have the same names as the type parameters in the type declaration. In particular, if they are not used by the method, they can be <code>_</code>.</p>
{{< /expand >}}

在泛型类型可以引用自身的情况下，泛型可以引用自身，但是当这样做时，类型实参必须是按相同顺序列出的类型形参。此限制可防止类型实例化的无限递归。
{{< expand "原文" >}}
<p>A generic type can refer to itself in cases where a type can ordinarily refer to itself, but when it does so the type arguments must be the type parameters, listed in the same order. This restriction prevents infinite recursion of type instantiation.</p>
{{< /expand >}}

```go
// List 是类型为 T 的值的链接列表。
type List(type T) struct {
	next *List(T) // 对 List(T) 的引用是可以的
	val  T
}

// 此类型无效。
type P(type T1, T2) struct {
	F *P(T2, T1) // 无效；必须是 (T1, T2)
}
```

此限制适用于直接和间接引用。
{{< expand "原文" >}}
<p>This restriction applies to both direct and indirect references.</p>
{{< /expand >}}

```go
// ListHead 是链接表的头。
type ListHead(type T) struct {
	head *ListElement(T)
}

// ListElement 是带有头的链接表的元素。
// 每个元素都指向头部。
type ListElement(type T) struct {
	next *ListElement(T)
	val  T
	// 可以在这里使用 ListHead(T)。
	// ListHead(T) 引用 ListElement(T) 引用 ListHead(T).
	// 无法使用 ListHead(int)，因为 ListHead(T)
	// 会间接引用 ListHead(int).
	head *ListHead(T)
}
```

（注意：在更了解人们如何编写代码的情况下，可以放宽此规则，以允许在某些情况下使用不同的类型参数。）
{{< expand "原文" >}}
<p>(Note: with more understanding of how people want to write code, it may be possible to relax this rule to permit some cases that use different type arguments.)</p>
{{< /expand >}}

泛型类型的类型参数可能具有约束。
{{< expand "原文" >}}
<p>The type parameter of a generic type may have constraints.</p>
{{< /expand >}}

```go
// StringableVector 是某种类型的切片，
// 其中类型必须具有 String 方法。
type StringableVector(type T Stringer) []T

func (s StringableVector(T)) String() string {
	var sb strings.Builder
	for i, v := range s {
		if i > 0 {
			sb.WriteString(", ")
		}
		// 可以在这里调用 v.String 是因为 v 是 T 类型，
		// 并且 T 的约束是 Stringer。
		sb.WriteString(v.String())
	}
	return sb.String()
}
```

### 方法可能不需要其他类型的参数
尽管泛型类型的方法可以使用该类型的参数，但是方法本身可能没有其他类型的参数。如果向方法中添加类型参数有用时，则必须编写一个适当的参数化顶级函数。
{{< expand "原文" >}}
<p>Although methods of a generic type may use the type's parameters, methods may not themselves have additional type parameters. Where it would be useful to add type arguments to a method, people will have to write a suitably parameterized top-level function.</p>
{{< /expand >}}

在[issues章节](#没有参数化的方法)中将对此进行更多讨论。
{{< expand "原文" >}}
<p>There is more discussion of this in the issues section.</p>
{{< /expand >}}

### 操作
如我们所见，我们将接口类型用作约束。接口类型提供了一组方法，仅此而已。这就是说，到目前为止，泛型函数可以对类型参数的值执行的唯一操作（对任何类型都允许的操作除外）是调用方法。
{{< expand "原文" >}}
<p>As we‘ve seen, we are using interface types as constraints. Interface types provide a set of methods, and nothing else. This means that with what we’ve seen so far, the only thing that generic functions can do with values of type parameters, other than operations that are permitted for any type, is call methods.</p>
{{< /expand >}}

但是，对于我们要表达的所有内容，方法调用还不够。考虑这个简单的函数，该函数返回值切片的最小元素，其中该切片被假定为非空。
{{< expand "原文" >}}
<p>However, method calls are not sufficient for everything we want to express. Consider this simple function that returns the smallest element of a slice of values, where the slice is assumed to be non-empty.</p>
{{< /expand >}}

```go
// 这个方法是无效的。
func Smallest(type T)(s []T) T {
	r := s[0] // 切片为空会 panic
	for _, v := range s[1:] {
		if v < r { // 无效
			r = v
		}
	}
	return r
}
```

任何合理的泛型实现都应允许您编写此函数。问题是表达式`v < r`。假定`T`支持`<`运算符，但是`T`没有约束。在没有约束的情况下，最小功能只能使用所有类型可用的操作，但并非所有Go类型都支持`<`。不幸的是，由于`<`不是方法，因此没有明显的方法来编写允许`<`的约束（接口类型）。
{{< expand "原文" >}}
<p>Any reasonable generics implementation should let you write this function. The problem is the expression <code>v < r</code>. This assumes that T supports the <code><</code> operator, but <code>T</code> has no constraint. Without a constraint the function Smallest can only use operations that are available for all types, but not all Go types support <code><</code>. Unfortunately, since <code><</code> is not a method, there is no obvious way to write a constraint—an interface type—that permits <code><</code>.</p>
{{< /expand >}}

我们需要一种方法来编写仅接受支持`<`的类型的约束。为此，我们注意到，除了稍后将要讨论的两个例外之外，该语言定义的所有算术，比较和逻辑运算符都只能与该语言预先声明的类型或已定义的类型一起使用。其基础类型是那些预先声明的类型之一。也就是说，运算符`<`只能与预先声明的类型（例如`int`或`float64`）或基础类型为这些类型之一的已定义类型一起使用。 Go不允许将`<`与复合类型或任意定义的类型一起使用。
{{< expand "原文" >}}
<p>We need a way to write a constraint that accepts only types that support <code><</code>. In order to do that, we observe that, aside from two exceptions that we will discuss later, all the arithmetic, comparison, and logical operators defined by the language may only be used with types that are predeclared by the language, or with defined types whose underlying type is one of those predeclared types. That is, the operator <code><</code> can only be used with a predeclared type such as int or float64, or a defined type whose underlying type is one of those types. Go does not permit using <code><</code> with a composite type or with an arbitrary defined type.</p>
{{< /expand >}}

这意味着我们不必尝试为`<`编写约束，而可以采用另一种方法：不是说约束应支持哪些运算符，而是可以说约束应接受哪些（底层）类型。
{{< expand "原文" >}}
<p>This means that rather than try to write a constraint for <code><</code>, we can approach this the other way around: instead of saying which operators a constraint should support, we can say which (underlying) types a constraint should accept.</p>
{{< /expand >}}

#### 约束中的类型列表
用作约束的接口类型可以列出可以用作类型参数的显式类型。这是使用`type`关键字后跟逗号分隔的类型列表来完成的。例如：
{{< expand "原文" >}}
<p>An interface type used as a constraint may list explicit types that may be used as type arguments. This is done using the <code>type</code> keyword followed by a comma-separated list of types. For example:</p>
{{< /expand >}}

```go
// SignedInteger 是类型约束，它允许任何带符号的整数类型。
type SignedInteger interface {
	type int, int8, int16, int32, int64
}
```

`SignedInteger`约束指定类型参数必须是列出的类型之一。更准确地说，类型实参的基础类型必须与类型列表中类型之一的基础类型相同。这意味着`SignedInteger`将接受列出的整数类型，并且还将接受定义为这些类型之一的任何类型。
{{< expand "原文" >}}
<p>The <code>SignedInteger</code> constraint specifies that the type argument must be one of the listed types. More precisely, the underlying type of the type argument must be identical to the underlying type of one of the types in the type list. This means that <code>SignedInteger</code> will accept the listed integer types, and will also accept any type that is defined as one of those types.</p>
{{< /expand >}}

当泛型函数使用具有这些约束之一的类型参数时，它可以使用所有列出的类型允许的任何操作。这可以是`<`，`range`，`<-`等操作。如果可以使用约束中列出的每种类型成功编译函数，则允许该操作。

一个约束可能只有一个类型列表。
{{< expand "原文" >}}
<p>When a generic function uses a type parameter with one of these constraints, it may use any operation that is permitted by all of the listed types. This can be an operation like <code><</code>, <code>range</code>, <code><-</code>, and so forth. If the function can be compiled successfully using each type listed in the constraint, then the operation is permitted.</p>
<p>A constraint may only have one type list.</p>
{{< /expand >}}

对于前面显示的`Smallest`示例，我们可以使用如下约束：
{{< expand "原文" >}}
<p>For the <code>Smallest</code> example shown earlier, we could use a constraint like this:</p>
{{< /expand >}}

```go
package constraints

// Ordered 是与任何有序类型匹配的类型约束。
// Ordered 类型是一种支持<，<=，>和>=运算符的类型。
type Ordered interface {
	type int, int8, int16, int32, int64,
		uint, uint8, uint16, uint32, uint64, uintptr,
		float32, float64,
		string
}
```

在实践中，很可能会定义此约束并将其导出到新的标准库包中，即`constraints`，以便函数和类型定义可以使用它。
{{< expand "原文" >}}
<p>In practice this constraint would likely be defined and exported in a new standard library package, <code>constraints</code>, so that it could be used by function and type definitions.</p>
{{< /expand >}}

给定该约束，我们可以编写此函数，该函数现在有效：
{{< expand "原文" >}}
<p>Given that constraint, we can write this function, now valid:</p>
{{< /expand >}}

```go
// Smallest 返回切片中的最小元素。
// 切片为空会 panic。
func Smallest(type T constraints.Ordered)(s []T) T {
	r := s[0] // 切片为空则 panic
	for _, v := range s[1:] {
		if v < r {
			r = v
		}
	}
	return r
}
```

#### 约束中的`Comparable`类型
前面我们提到，运算符只能与语言预先声明的类型一起使用的规则中只有两个例外：`==`和`!=`。这是结构，数组和接口类型所允许的。这些足够有用，我们希望能够编写一个接受任何可比较类型的约束。
{{< expand "原文" >}}
<p>Earlier we mentioned that there are two exceptions to the rule that operators may only be used with types that are predeclared by the language. The exceptions are <code>==</code> and <code>!=</code>, which are permitted for struct, array, and interface types. These are useful enough that we want to be able to write a constraint that accepts any comparable type.</p>
{{< /expand >}}

为此，我们引入了一个新的预先声明的类型约束：`Comparable`。具有`Comparable`约束的类型参数接受任何可比类型作为类型实参。它允许将`==`和`!=`与该类型参数的值一起使用。
{{< expand "原文" >}}
<p>To do this we introduce a new predeclared type constraint: <code>comparable</code>. A type parameter with the comparable constraint accepts as a type argument any comparable type. It permits the use of <code>==</code> and <code>!=</code> with values of that type parameter.</p>
{{< /expand >}}

例如，可以使用任何可比较的类型实例化此函数：
{{< expand "原文" >}}
<p>For example, this function may be instantiated with any comparable type:</p>
{{< /expand >}}

```go
// Index 返回 x 在 s 中的索引，如果未找到则返回-1。
func Index(type T comparable)(s []T, x T) int {
	for i, v := range s {
		// v 和 x 是 T 型，具有可比性约束，
		// 所以我们可以在这里使用 ==
		if v == x {
			return i
		}
	}
	return -1
}
```

与所有约束一样，`Comparable`是一种接口类型，因此可以将其嵌入用作约束的另一种接口类型中：
{{< expand "原文" >}}
<p>Since <code>comparable</code>, like all constraints, is an interface type, it can be embedded in another interface type used as a constraint:</p>
{{< /expand >}}

```go
// ComparableHasher 是一种类型约束，
// 它使用 Hash 方法匹配所有 comparable 类型。
type ComparableHasher interface {
	comparable
	Hash() uintptr
}
```

约束`ComparableHasher`由任何可比较的类型实现，并且也具有`Hash() uintptr`方法。使用`ComparableHasher`作为约束的泛型函数可以比较该类型的值，并可以调用`Hash`方法。
{{< expand "原文" >}}
<p>The constraint <code>ComparableHasher</code> is implemented by any type that is comparable and also has a <code>Hash() uintptr</code> method. A generic function that uses <code>ComparableHasher</code> as a constraint can compare values of that type and can call the <code>Hash</code> method.</p>
{{< /expand >}}

#### 接口类型中的类型列表
具有类型列表的接口类型只能用作对类型参数的约束。它们可能不能用作普通接口类型。预先声明的`comparable`接口类型也是如此。
{{< expand "原文" >}}
<p>Interface types with type lists may only be used as constraints on type parameters. They may not be used as ordinary interface types. The same is true of the predeclared interface type <code>comparable</code>.</p>
{{< /expand >}}

在将来的语言版本中可能会取消此限制。具有类型列表的接口类型可用作求和类型的一种形式，尽管它的值可以为`nil`。可能需要一些替代语法来匹配相同类型而不是基础类型；也许是`type ==`。目前，这是不允许的。
{{< expand "原文" >}}
<p>This restriction may be lifted in future language versions. An interface type with a type list may be useful as a form of sum type, albeit one that can have the value <code>nil</code>. Some alternative syntax would likely be required to match on identical types rather than on underlying types; perhaps <code>type ==</code>. For now, this is not permitted.</p>
{{< /expand >}}

### 函数参数类型推断
在许多情况下，当调用带有类型参数的函数时，我们可以使用类型推断来避免必须显式写出类型参数。
{{< expand "原文" >}}
<p>In many cases, when calling a function with type parameters, we can use type inference to avoid having to explicitly write out the type arguments.</p>
{{< /expand >}}

看看之前的简单调用`Print`函数的[示例](#类型参数)：
{{< expand "原文" >}}
<p>Go back to the example of a call to the simple <code>Print</code> function:</p>
{{< /expand >}}

```go
	Print(int)([]int{1, 2, 3})
```
函数调用中的类型实参`int`可以从非类型实参的类型推断出来。
{{< expand "原文" >}}
<p>The type argument <code>int</code> in the function call can be inferred from the type of the non-type argument.</p>
{{< /expand >}}

仅当所有函数的类型参数都用作函数（非类型）输入参数的类型时，才可以这样做。如果有一些类型参数仅用于函数的结果参数类型，或者仅在函数的主体中使用，则我们的算法不会推断函数的类型参数，因为没有值可用来推断类型。
{{< expand "原文" >}}
<p>This can only be done when all the function‘s type parameters are used for the types of the function’s (non-type) input parameters. If there are some type parameters that are used only for the function's result parameter types, or only in the body of the function, then our algorithm does not infer the type arguments for the function, since there is no value from which to infer the types.</p>
{{< /expand >}}

当可以推断函数的类型实参时，Go将使用统一类型。在调用方，我们有实际（非类型）参数的类型列表，对于`Print`示例，该列表是简单的`[]int`。在函数方面，是该功能的非类型参数的类型列表，对于`Print`，该列表为`[]T`。在列表中，我们丢弃函数侧未使用类型参数的各个参数。然后，我们必须统一其余的参数类型。
{{< expand "原文" >}}
<p>When the function‘s type arguments can be inferred, the language uses type unification. On the caller side we have the list of types of the actual (non-type) arguments, which for the <code>Print</code> example is simply <code>[]int</code>. On the function side is the list of the types of the function’s non-type parameters, which for <code>Print</code> is <code>[]T</code>. In the lists, we discard respective arguments for which the function side does not use a type parameter. We must then unify the remaining argument types.</p>
{{< /expand >}}

类型统一是一种两遍算法。在第一遍中，我们忽略了调用方的无类型常量及其在函数定义中的对应类型。
{{< expand "原文" >}}
<p>Type unification is a two-pass algorithm. In the first pass, we ignore untyped constants on the caller side and their corresponding types in the function definition.</p>
{{< /expand >}}

我们在列表中比较相应的类型。它们的结构必须相同，除了函数一侧的类型参数与出现在调用者一侧的类型参数相匹配。如果相同类型的参数在函数侧多次出现，则它将在调用方匹配多个参数类型。这些调用者类型必须相同，否则类型统一失败，我们将报告错误。
{{< expand "原文" >}}
<p>We compare corresponding types in the lists. Their structure must be identical, except that type parameters on the function side match the type that appears on the caller side at the point where the type parameter occurs. If the same type parameter appears more than once on the function side, it will match multiple argument types on the caller side. Those caller types must be identical, or type unification fails, and we report an error.</p>
{{< /expand >}}

第一次通过后，我们在调用方检查所有无类型常量。如果没有无类型常量，或者相应函数类型中的类型参数与其他输入类型匹配，则类型统一完成。
{{< expand "原文" >}}
<p>After the first pass, we check any untyped constants on the caller side. If there are no untyped constants, or if the type parameters in the corresponding function types have matched other input types, then type unification is complete.</p>
{{< /expand >}}

否则，对于第二遍，对于尚未设置相应函数类型的任何无类型常量，我们将以[通用方式](https://golang.org/ref/spec#Constants)确定无类型常量的默认类型。然后我们再次运行类型统一算法，这次将没有任何无类型常量。

在这个例子中
{{< expand "原文" >}}
<p>Otherwise, for the second pass, for any untyped constants whose corresponding function types are not yet set, we determine the default type of the untyped constant in the usual way. Then we run the type unification algorithm again, this time with no untyped constants.</p>
   
<p>In this example</p>
{{< /expand >}}

```go
	s1 := []int{1, 2, 3}
	Print(s1)
```

我们将`[]int`与`[]T`进行比较，完成`T`与`int`的匹配。单个类型参数`T`是`int`，因此我们推断对`Print`的调用实际上是对`Print(int)`的调用。

请考虑一个更复杂的示例
{{< expand "原文" >}}
<p>we compare <code>[]int</code> with <code>[]T</code>, match <code>T</code> with <code>int</code>, and we are done. The single type parameter <code>T</code> is <code>int</code>, so we infer that the call to <code>Print</code> is really a call to <code>Print(int)</code>.</p>
<p>For a more complex example, consider</p>
{{< /expand >}}

```go
// Map 在切片 s 的每个元素上调用函数 f，
// 返回新的切片结果。
func Map(type F, T)(s []F, f func(F) T) []T {
	r := make([]T, len(s))
	for i, v := range s {
		r[i] = f(v)
	}
	return r
}
```

输入参数使用两个类型参数`F`和`T`，因此可以进行类型推断。在调用时
{{< expand "原文" >}}
<p>The two type parameters <code>F</code> and <code>T</code> are both used for input parameters, so type inference is possible. In the call</p>
{{< /expand >}}

```go
	strs := Map([]int{1, 2, 3}, strconv.Itoa)
```

我们将`[]int`与`[]F`统一，匹配`F`与`int`。我们将`strconv.Itoa`的类型统一为`func(int) string`和`func(F) T`，匹配`F`与`int`，`T`与`string`。类型参数`F`两次都匹配`int`。统一成功，因此对`Map`的调用本质上是对`Map(int，string)`的调用。
{{< expand "原文" >}}
<p>we unify <code>[]int</code> with <code>[]F</code>, matching <code>F</code> with <code>int</code>. We unify the type of <code>strconv.Itoa</code>, which is <code>func(int) string</code>, with <code>func(F) T</code>, matching <code>F</code> with <code>int</code> and <code>T</code> with <code>string</code>. The type parameter <code>F</code> is matched twice, both times with <code>int</code>. Unification succeeds, so the call written as <code>Map</code> is a call of <code>Map(int, string)</code>.</p>
{{< /expand >}}

看看有效的无类型常量规则，请考虑：
{{< expand "原文" >}}
<p>To see the untyped constant rule in effect, consider:</p>
{{< /expand >}}

```go
// NewPair 返回一对相同类型的值。
func NewPair(type F)(f1, f2 F) *Pair(F) { ... }
```

在调用`NewPair(1, 2)`时，两个参数都是无类型常量，因此在第一遍中都将忽略它们，没有什么可以统一的。第一次通过后，我们还有两个无类型常量。两者均设置为其默认类型`int`。类型统一传递的第二次运行将`F`与`int`统一，因此最终调用为`NewPair(int)(1, 2)`。
{{< expand "原文" >}}
<p>In the call <code>NewPair(1, 2)</code> both arguments are untyped constants, so both are ignored in the first pass. There is nothing to unify. We still have two untyped constants after the first pass. Both are set to their default type, int. The second run of the type unification pass unifies <code>F</code> with <code>int</code>, so the final call is <code>NewPair(int)(1, 2)</code>.</p>
{{< /expand >}}

在调用`NewPair(1，int64(2))`中，第一个参数是无类型常量，因此我们在第一遍中将其忽略。然后，我们用`F`统一`int64`。在这一点上，与无类型常量相对应的类型参数已完全确定，因此最终调用为`NewPair(int64)(1，int64(2))`。
{{< expand "原文" >}}
<p>In the call <code>NewPair(1, int64(2))</code> the first argument is an untyped constant, so we ignore it in the first pass. We then unify <code>int64</code> with <code>F</code>. At this point the type parameter corresponding to the untyped constant is fully determined, so the final call is <code>NewPair(int64)(1, int64(2))</code>.</p>
{{< /expand >}}

在调用`NewPair(1, 2.5)`时，两个参数都是无类型常量，因此我们继续第二遍。这次我们将第一个常量设置为`int`，第二个常量设置为`float64`。然后，我们尝试同时使用`int`和`float64`统一`F`，因此统一失败，我们将报告编译错误。
{{< expand "原文" >}}
<p>In the call <code>NewPair(1, 2.5)</code> both arguments are untyped constants, so we move on the second pass. This time we set the first constant to <code>int</code> and the second to <code>float64</code>. We then try to unify <code>F</code> with both <code>F</code> and <code>float64</code>, so unification fails, and we report a compilation error.</p>
{{< /expand >}}

注意，类型推断是在不考虑约束的情况下完成的。首先，我们使用类型推断来确定要用于该函数的类型参数，然后，如果成功，则检查这些类型参数是否实现了约束（如果有）。
{{< expand "原文" >}}
<p>Note that type inference is done without regard to constraints. First we use type inference to determine the type arguments to use for the function, and then, if that succeeds, we check whether those type arguments implement the constraints (if any).</p>
{{< /expand >}}

请注意，在成功进行类型推断之后，对于任何函数调用，编译器仍必须检查是否可以将实参分配给形参。
{{< expand "原文" >}}
<p>Note that after successful type inference, the compiler must still check that the arguments can be assigned to the parameters, as for any function call.</p>
{{< /expand >}}

（注意：类型推断是一种便利功能。尽管我们认为这是一项重要功能，但它并未为设计添加任何功能，只是为使用提供了便利。可以从初始实现中将其省略，并查看是否也就是说，此功能不需要其他语法，并且可以生成更具可读性的代码。）
{{< expand "原文" >}}
<p>(Note: type inference is a convenience feature. Although we think it is an important feature, it does not add any functionality to the design, only convenience in using it. It would be possible to omit it from the initial implementation, and see whether it seems to be needed. That said, this feature doesn't require additional syntax, and produces more readable code.)</p>
{{< /expand >}}

### 使用在约束中引用自己的类型
对于泛型函数来说，要求类型自变量及其方法本身就是类型的方法可能是有用的。例如，这在比较方法中自然会出现。（请注意，我们在这里谈论的是方法，而不是运算符。）假设我们要编写一个使用`Equal`方法检查是否已找到所需值的`Index`方法。我们想这样写：
{{< expand "原文" >}}
<p>It can be useful for a generic function to require a type argument with a method whose argument is the type itself. For example, this arises naturally in comparison methods. (Note that we are talking about methods here, not operators.) Suppose we want to write an <code>Index</code> method that uses an <code>Equal</code> method to check whether it has found the desired value. We would like to write that like this:</p>
{{< /expand >}}

```go
// Index 返回 e 在 s 中的索引；如果未找到，则返回-1。
func Index(type T Equaler)(s []T, e T) int {
	for i, v := range s {
		if e.Equal(v) {
			return i
		}
	}
	return -1
}
```

为了编写`Equaler`约束，我们必须编写一个可以引用要传入的类型参数的约束。虽然无法直接执行约束，但是我们可以做的是编写一个使用类型参数的接口类型。
{{< expand "原文" >}}
<p>In order to write the <code>Equaler</code> constraint, we have to write a constraint that can refer to the type argument being passed in. There is no way to do that directly, but what we can do is write an interface type that use a type parameter.</p>
{{< /expand >}}

```go
// Equaler 是使用 Equal 方法的类型的类型约束。
type Equaler(type T) interface {
	Equal(T) bool
}
```

为此，`Index`将`T`作为类型参数传递给`Equaler`。规则是，如果类型约束具有单个类型参数，并且在没有显式类型参数的情况下用于函数的类型参数列表，则类型参数是要约束的类型参数。换句话说，在上面的`Index`的定义中，约束`Equaler`被视为`Equaler(T)`。
{{< expand "原文" >}}
<p>To make this work, <code>Index</code> will pass <code>T</code> as the type argument to <code>Equaler</code>. The rule is that if a type contraint has a single type parameter, and it is used in a function's type parameter list without an explicit type argument, then the type argument is the type parameter being constrained. In other words, in the definition of <code>Index</code> above, the constraint <code>Equaler</code> is treated as <code>Equaler(T)</code>.</p>
{{< /expand >}}

此版本的`Index`将与在此处定义的`equalInt`之类的类型一起使用：
{{< expand "原文" >}}
<p>This version of <code>Index</code> would be used with a type like <code>equalInt</code> defined here:</p>
{{< /expand >}}

```go
// equalInt 是实现 Equaler 的 int 版本。
type equalInt int

// Equal方法让 equalInt 实现 Equalizer 约束。
func (a equalInt) Equal(b equalInt) bool { return a == b }

// indexEqualInts 返回 e 在 s 中的索引，如果未找到则返回-1。
func indexEqualInt(s []equalInt, e equalInt) int {
	return Index(equalInt)(s, e)
}
```

在此示例中，当我们将`equalInt`传递给`Index`时，我们检查`equalInt`是否实现约束`Equaler`。由于`Equaler`具有类型参数，因此我们将`Index`的`equal`参数（等于`equalInt`）传递给`Equaler`。这样，约束就是`Equaler(equalInt)`，任何类型的方法`Equal(equalInt) bool`都可以满足该约束。 `equalInt`类型具有`Equal`方法，该方法接受`equalInt`类型的参数，因此一切都很好，并且编译成功。
{{< expand "原文" >}}
<p>In this example, when we pass <code>equalInt</code> to <code>Index</code>, we check whether <code>equalInt</code> implements the constraint <code>Equaler</code>. Since <code>Equaler</code> has a type parameter, we pass the type argument of <code>Index</code>, which is <code>equalInt</code>, as the type argument to <code>Equaler</code>. The constraint is, then, <code>Equaler(equalInt)</code>, which is satisfied by any type with a method <code>Equal(equalInt) bool</code>. The <code>equalInt</code> type has a method <code>Equal</code> that accepts a parameter of type <code>equalInt</code>, so all is well, and the compilation succeeds.</p>
{{< /expand >}}

### 相互引用类型参数
在单个类型参数列表中，约束可以引用任何其他类型参数，即使是稍后在同一列表中声明的参数也是如此。 （类型参数的范围从参数列表的`type`关键字开始，并扩展到封闭函数或类型声明的末尾。）
{{< expand "原文" >}}
<p>Within a single type parameter list, constraints may refer to any of the other type parameters, even ones that are declared later in the same list. (The scope of a type parameter starts at the <code>type</code> keyword of the parameter list and extends to the end of the enclosing function or type declaration.)</p>
{{< /expand >}}

例如，考虑一个通用图包，其中包含可用于图的通用算法。该算法使用两种类型，即`Node`和`Edge`。`Node`应具有`Edges() []Edge`方法。`Edge`应具有方法`Nodes() (Node, Node)`。图可以表示为`[]Node`。
{{< expand "原文" >}}
<p>For example, consider a generic graph package that contains generic algorithms that work with graphs. The algorithms use two types, <code>Node</code> and <code>Edge</code>. <code>Node</code> is expected to have a method <code>Edges() []Edge</code>. <code>Edge</code> is expected to have a method <code>Nodes() (Node, Node)</code>. A graph can be represented as a <code>[]Node</code>.</p>
{{< /expand >}}

这种简单的表示足以实现诸如查找最短路径之类的图形算法。
{{< expand "原文" >}}
<p>This simple representation is enough to implement graph algorithms like finding the shortest path.</p>
{{< /expand >}}

```go
package graph

// NodeConstraint 是图节点的类型约束：
// 它们必须具有 Edges 方法，该方法返回连接到此 Node 的 Edge。
type NodeConstraint(type Edge) interface {
	Edges() []Edge
}

// EdgeConstraint 是图形边的类型约束：
// 它们必须具有 Nodes 方法，该方法返回此边连接的两个 Nodes。
type EdgeConstraint(type Node) interface {
	Nodes() (from, to Node)
}

// Graph 是由节点和边组成的图。
type Graph(type Node NodeConstraint(Edge), Edge EdgeConstraint(Node)) struct { ... }

// New 返回给定节点列表的新图。
func New(
	type Node NodeConstraint(Edge), Edge EdgeConstraint(Node)) (
	nodes []Node) *Graph(Node, Edge) {
	...
}

// ShortestPath 返回两个节点之间的最短路径，作为边的列表。
func (g *Graph(Node, Edge)) ShortestPath(from, to Node) []Edge { ... }
```

这里有很多类型参数和实例化。在图的节点约束中，传递给类型约束`NodeConstraint`的`Edge`是图的第二种类型参数。这使用类型参数`Edge`实例化`NodeConstraint`，因此我们看到`Node`必须具有一个`Edges`方法，该方法返回`Edge`的切片，这正是我们想要的。这同样适用于`Edge`上的约束，并且对函数`New`重复相同的类型参数和约束。我们并不是说这很简单，而是我们认为这是可能的。
{{< expand "原文" >}}
<p>There are a lot of type arguments and instantiations here. In the constraint on <code>Node</code> in <code>Graph</code>, the <code>Edge</code> being passed to the type constraint <code>NodeConstraint</code> is the second type parameter of <code>Graph</code>. This instantiates <code>NodeConstraint</code> with the type parameter <code>Edge</code>, so we see that <code>Node</code> must have a method <code>Edges</code> that returns a slice of <code>Edge</code>, which is what we want. The same applies to the constraint on <code>Edge</code>, and the same type parameters and constraints are repeated for the function <code>New</code>. We aren't claiming that this is simple, but we are claiming that it is possible.</p>
{{< /expand >}}

值得注意的是，乍一看，这看起来像是接口类型的典型用法，而`Node`和`Edge`是具有特定方法的非接口类型。为了使用`graph.Graph`，用于`Node`和`Edge`的类型参数必须定义遵循特定模式的方法，但实际上不必使用接口类型。特别是，这些方法不返回接口类型。
{{< expand "原文" >}}
<p>It‘s worth noting that while at first glance this may look like a typical use of interface types, <code>Node</code> and <code>Edge</code> are non-interface types with specific methods. In order to use <code>graph.Graph</code>, the type arguments used for <code>Node</code> and <code>Edge</code> have to define methods that follow a certain pattern, but they don’t have to actually use interface types to do so. In particular, the methods do not return interface types.</p>
{{< /expand >}}

例如，在其他软件包中考虑以下类型定义：
{{< expand "原文" >}}
<p>For example, consider these type definitions in some other package:</p>
{{< /expand >}}

```go
// Vertex 是图中的节点。
type Vertex struct { ... }

// Edges 返回连接到 v 的边。
func (v *Vertex) Edges() []*FromTo { ... }

// FromTo 是图中的边。
type FromTo struct { ... }

// Nodes 返回 ft 连接的节点。
func (ft *FromTo) Nodes() (*Vertex, *Vertex) { ... }
```

这里没有接口类型，但是我们可以使用类型参数`*Vertex`和`*FromTo`实例化`graph.Graph`。
{{< expand "原文" >}}
<p>There are no interface types here, but we can instantiate <code>graph.Graph</code> using the type arguments <code>*Vertex</code> and <code>*FromTo</code>.</p>
{{< /expand >}}

```go
var g = graph.New(*Vertex, *FromTo)([]*Vertex{ ... })
```

`*Vertex`和`*FromTo`不是接口类型，但是当一起使用时，它们定义实现`graph.Graph`约束的方法。请注意，我们无法将普通的`Vertex`或`FromTo`传递给`graph.New`，因为`Vertex`和`FromTo`没有实现约束。 `Edges`和`Nodes`方法是在指针类型`*Vertex`和`*FromTo`上定义的； `Vertex`和`FromTo`类型没有任何方法。
{{< expand "原文" >}}
<p><code>*Vertex</code> and <code>*FromTo</code> are not interface types, but when used together they define methods that implement the constraints of <code>graph.Graph</code>. Note that we couldn't pass plain <code>Vertex</code> or <code>FromTo</code> to <code>graph.New</code>, since <code>Vertex</code> and <code>FromTo</code> do not implement the constraints. The <code>Edges</code> and <code>Nodes</code> methods are defined on the pointer types <code>*Vertex</code> and <code>*FromTo</code>; the types <code>Vertex</code> and <code>FromTo</code> do not have any methods.</p>
{{< /expand >}}

当使用泛型接口类型作为约束时，我们首先使用类型参数列表中提供的类型实参实例化该类型，然后将对应的类型实参与实例化的约束进行比较。在此示例中，`graph.New`的`Node`类型参数具有约束`NodeConstraint(Edge)`。当我们使用`*Vertex`的`Node`类型参数和`*FromTo`的`Edge`类型参数调用`graph.New`时，为了检查对`Node`的约束，编译器将使用`*FromTo`类型的参数实例化`NodeConstraint`。这产生了一个实例化的约束，在这种情况下，要求`Node`具有`Edges() []*FromTo`方法，并且编译器将验证`*Vertex`满足该约束。
{{< expand "原文" >}}
<p>When we use a generic interface type as a constraint, we first instantiate the type with the type argument(s) supplied in the type parameter list, and then compare the corresponding type argument against the instantiated constraint. In this example, the <code>Node</code> type argument to <code>graph.New</code> has a constraint <code>NodeConstraint(Edge)</code>. When we call <code>graph.New</code> with a <code>Node</code> type argument of <code>*Vertex</code> and a <code>Edge</code> type argument of <code>*FromTo</code>, in order to check the constraint on Node the compiler instantiates <code>NodeConstraint</code> with the type argument <code>*FromTo</code>. That produces an instantiated constraint, in this case a requirement that Node have a method <code>Edges() []*FromTo</code>, and the compiler verifies that <code>*Vertex</code> satisfies that constraint.</p>
{{< /expand >}}

尽管不必使用接口类型实例化`Node`和`Edge`，但也可以根据需要使用接口类型。
{{< expand "原文" >}}
<p>Although <code>Node</code> and <code>Edge</code> do not have to be instantiated with interface types, it is also OK to use interface types if you like.</p>
{{< /expand >}}

```go
type NodeInterface interface { Edges() []EdgeInterface }
type EdgeInterface interface { Nodes() (NodeInterface, NodeInterface) }
```

我们可以实例化类型为`NodeInterface`和`EdgeInterface`的`graph.Graph`，因为它们实现了类型约束。没有太多理由以这种方式实例化类型，但这是允许的。
{{< expand "原文" >}}
<p>We could instantiate <code>graph.Graph</code> with the types <code>NodeInterface</code> and <code>EdgeInterface</code>, since they implement the type constraints. There isn't much reason to instantiate a type this way, but it is permitted.</p>
{{< /expand >}}

类型参数引用其他类型参数的能力说明了一个重要的观点：对Go添加泛型的任何尝试都应该是必须的，即可以使用多个相互引用的类型实参来实例化泛型代码，编译器可以检查。
{{< expand "原文" >}}
<p>This ability for type parameters to refer to other type parameters illustrates an important point: it should be a requirement for any attempt to add generics to Go that it be possible to instantiate generic code with multiple type arguments that refer to each other in ways that the compiler can check.</p>
{{< /expand >}}

### 指针方法
在某些情况下，仅当类型参数`A`具有在指针类型`*A`上定义的方法时，泛型函数才能按预期工作。在编写期望调用修改值的方法的泛型函数时会发生这种情况。
{{< expand "原文" >}}
<p>There are cases where a generic function will only work as expected if a type argument <code>A</code> has methods defined on the pointer type <code>*A</code>. This happens when writing a generic function that expects to call a method that modifies a value.</p>
{{< /expand >}}

考虑一个函数示例，该函数期望类型`T`具有一个`Set(string)`方法，该方法根据字符串初始化值。
{{< expand "原文" >}}
<p>Consider this example of a function that expects a type T that has a Set(string) method that initializes the value based on a string.</p>
{{< /expand >}}

```go
// Setter 是一个类型约束，要求类型实现一个Set方法，
// 该方法从字符串中设置值。
type Setter interface {
	Set(string)
}

// FromStrings 提取字符串切片，并返回 T 切片，
// 调用 Set 方法设置每个返回的值。
//
// 请注意，因为 T 仅用于结果参数，所以调用此函数时类型推断不起作用。
// 必须在调用时显式传递 type 参数。
//
// 该示例可以编译，但不太可能按预期工作。
func FromStrings(type T Setter)(s []string) []T {
	result := make([]T, len(s))
	for i, v := range s {
		result[i].Set(v)
	}
	return result
}
```

现在，让我们看一下其他程序包中的一些代码（此示例无效）。
{{< expand "原文" >}}
<p>Now let's see some code in a different package (this example is invalid).</p>
{{< /expand >}}

```go
// Settable 是可以从字符串设置的整数类型。
type Settable int

// Set 从字符串设置 *p 的值。
func (p *Settable) Set(s string) {
	i, _ := strconv.Atoi(s) // 实际代码不应忽略该错误
	*p = Settable(i)
}

func F() {
	// 无效
	nums := FromStrings(Settable)([]string{"1", "2"})
	// 在这里，我们希望 nums 为 []Settable{1, 2}。
	...
}
```

目的是使用`FromStrings`来获取`[]Settable`类型的切片。不幸的是，该示例无效，无法编译。

问题出在`FromStrings`需要具有`Set(string)`方法的类型。函数`F`试图使用`Settable`实例化`FromStrings`，但是`Settable`没有`Set`方法。具有`Set`方法的类型为`*Settable`。

因此，让我们重写`F`来使用`*Settable`。
{{< expand "原文" >}}
<p>The goal is to use <code>FromStrings</code> to get a slice of type <code>[]Settable</code>. Unfortunately, this example is not valid and will not compile.</p>
<p>The problem is that <code>FromStrings</code> requires a type that has a <code>Set(string)</code> method. The function <code>F</code> is trying to instantiate <code>FromStrings</code> with <code>Settable</code>, but <code>Settable</code> does not have a <code>Set</code> method. The type that has a <code>Set</code> method is <code>*Settable</code>.</p>
<p>So let's rewrite <code>F</code> to use <code>*Settable</code> instead.</p>
{{< /expand >}}

```go
func F() {
	// Compiles but does not work as desired.
	// This will panic at run time when calling the Set method.
	// 能编译但无法按需工作。 
	// 运行时调用 Set 方法时，会出现 panic。
	nums := FromStrings(*Settable)([]string{"1", "2"})
	...
}
```

这能编译，但不幸的是，它将在运行时`panic`。问题是`FromStrings`创建了`[]T`类型的切片。当用`*Settable`实例化时，表示切片类型为`[]*Settable`。当`FromStrings`调用`result[i].Set(v)`时，会将存储在`result[i]`中的指针传递给`Set`方法。该指针为`nil`。 `Settable.Set`方法将由`nil`接收器调用，并且由于`nil`解除引用错误而将引起`panic`。
{{< expand "原文" >}}
<p>This compiles but unfortunately it will panic at run time. The problem is that <code>FromStrings</code> creates a slice of type <code>[]T</code>. When instantiated with <code>*Settable</code>, that means a slice of type <code>[]*Settable</code>. When <code>FromStrings</code> calls <code>result[i].Set(v)</code>, that passes the pointer stored in <code>result[i]</code> to the <code>Set</code> method. That pointer is <code>nil</code>. The <code>Settable.Set</code> method will be invoked with a <code>nil</code> receiver, and will raise a panic due to a <code>nil</code> dereference error.</p>
{{< /expand >}}

我们需要的是一种编写`FromStrings`的方法，以便它可以将`Settable`类型用作参数，但是可以调用指针方法。重复一遍，我们不能使用`Settable`，因为它没有`Set`方法，而我们不能使用`*Settable`，因为那样我们就无法创建类型为`Settable`的切片。

一种可行的方法是使用两个不同的类型参数：`Settable`和`*Settable`。
{{< expand "原文" >}}
<p>What we need is a way to write <code>FromStrings</code> such that it can take the type <code>Settable</code> as an argument but invoke a pointer method. To repeat, we can‘t use <code>Settable</code> because it doesn’t have a <code>Set</code> method, and we can‘t use <code>*Settable</code> because then we can’t create a slice of type <code>Settable</code>.</p>
<p>One approach that could work would be to use two different type parameters: both <code>Settable</code> and <code>*Settable</code>.</p>
{{< /expand >}}

```go
package from

// Setter2 是一个类型约束，它要求类型实现一个 Set 方法，
// 该方法从 string 中设置值，并且还要求该类型是指向其类型参数的指针。
type Setter2(type B) interface {
	Set(string)
	type *B
}

// FromStrings2 提取字符串切片，并返回 T 切片，
// 调用 Set 方法设置每个返回的值。
//
// 我们使用两个不同的类型参数，以便我们可以返回 T 类型的切片，但是在 *T 上调用方法。
// Setter2 约束确保 PT 是指向 T 的指针。
func FromStrings2(type T interface{}, PT Setter2(T))(s []string) []T {
	result := make([]T, len(s))
	for i, v := range s {
		// ＆result[i] 的类型是 *T，它位于 Setter2 的类型列表中，
		// 因此我们可以将其转换为 PT。
		p := PT(&result[i])
		// PT 有 Set 方法
		p.Set(v)
	}
	return result
}
```

我们将这样调用`FromStrings2`：
{{< expand "原文" >}}
<p>We would call <code>FromStrings2</code> like this:</p>
{{< /expand >}}

```go
func F2() {
	// FromStrings2 具有两个类型参数。
	// 第二个参数必须是第一个参数的指针。
	// Settable 如上.
	nums := FromStrings2(Settable, *Settable)([]string{"1", "2"})
	// 现在 nums 是 []Settable{1, 2}.
	...
}
```

这种方法可以正常工作，但是很尴尬。它通过传递两个类型参数来强制`F2`解决`FromStrings2`中的问题。第二种类型的参数必须是第一种类型的参数的指针。对于看起来应该是相当简单的情况，却是一个复杂的要求。

另一种方法是传递函数而不是调用方法。
{{< expand "原文" >}}
<p>This approach works as expected, but it is awkward. It forces <code>F2</code> to work around a problem in <code>FromStrings2</code> by passing two type arguments. The second type argument is required to be a pointer to the first type argument. This is a complex requirement for what seems like it ought to be a reasonably simple case.</p>
<p>Another approach would be to pass in a function rather than calling a method.</p>
{{< /expand >}}

```go
// FromStrings3 提取字符串切片，并返回 T 切片，
// 调用 set 函数设置每个返回值。
func FromStrings3(type T)(s []string, set func(*T, string)) []T {
	results := make([]T, len(s))
	for i, v := range s {
		set(&results[i], v)
	}
	return results
}
```

我们将这样调用`Strings3`：
{{< expand "原文" >}}
<p>We would call <code>Strings3</code> like this:</p>
{{< /expand >}}

```go
func F3() {
	// FromStrings3 使用一个函数来设置值。
	// Settable 同上.
	nums := FromStrings3(Settable)([]string{"1", "2"},
		func(p *Settable, s string) { p.Set(s) })
	// 现在 nums 是 []Settable{1, 2}.
}
```

这种方法也可以按预期工作，但也很尴尬。调用方必须传入一个函数才可以调用`Set`方法。这是我们在使用泛型时希望避免的样板代码。
{{< expand "原文" >}}
<p>This approach also works as expected, but it is also awkward. The caller has to pass in a function just to call the <code>Set</code> method. This is the kind of boilerplate code that we would hope to avoid when using generics.</p>
{{< /expand >}}

尽管这些方法很尴尬，但它们确实有效。就是说，我们建议另一个解决此类问题的功能：一种表示对类型参数的指针（而不是对类型参数本身）约束的方法，将类型参数写为指针类型：（`type *T Constraint`）。
{{< expand "原文" >}}
<p>Although these approaches are awkward, they do work. That said, we suggest another feature to address this kind of issue: a way to express constraints on the pointer to the type parameter, rather than on the type parameter itself. The way to do this is to write the type parameter as though it were a pointer type: (<code>type *T Constraint</code>).</p>
{{< /expand >}}

在类型参数列表中用`*T`代替`T`改变了两件事。假设调用时的类型参数为`A`，并且约束为`Constraint`（可以使用此语法而没有约束，但是没有理由这样做）。
{{< expand "原文" >}}
<p>Writing <code>*T</code> instead of <code>T</code> in a type parameter list changes two things. Let's assume that the type argument at the call site is <code>A</code>, and the constraint is <code>Constraint</code> (this syntax may be used without a constraint, but there is no reason to do so).</p>
{{< /expand >}}

第一个变化是将约束应用于`*A`而不是`A`。也就是说，`*A`必须实现约束。如果`A`实现了`Constraint`，则可以，但是要求`*A`实现它。请注意，如果`Constraint`有任何方法，则意味着`A`一定不能是指针类型：如果`A`是指针类型，则`*A`是指向指针的指针，并且此类类型永远不会有任何方法。
{{< expand "原文" >}}
<p>The first thing that changes is that Constraint is applied to <code>*A</code> rather than <code>A</code>. That is, <code>*A</code> must implement Constraint. It's OK if <code>A</code> implements <code>Constraint</code>, but the requirement is that <code>*A</code> implement it. Note that if <code>Constraint</code> has any methods, this implies that <code>A</code> must not be a pointer type: if <code>A</code> is a pointer type, then <code>*A</code> is a pointer to a pointer, and such types never have any methods.</p>
{{< /expand >}}

第二个变化是，在函数体内，`Constraint`中的任何方法都被视为指针方法。它们只能在`*T`类型的值或`T`类型的可寻址值上调用。
{{< expand "原文" >}}
<p>The second thing that changes is that within the body of the function, any methods in <code>Constraint</code> are treated as though they were pointer methods. They may only be invoked on values of type <code>*T</code> or addressable values of type <code>T</code>.</p>
{{< /expand >}}

```go
// FromStrings 提取字符串切片，并返回 T 切片，
// 调用 Set 方法设置每个返回的值。
//
// 我们写 *T，表示给定类型参数 A，
// 指针类型 *A 必须实现 Setter。
//
// 请注意，因为 T 仅用于结果参数，
// 所以调用此函数时类型推断不起作用。
// 必须在调用时显式传递类型参数。
func FromStrings(type *T Setter)(s []string) []T {
	result := make([]T, len(s))
	for i, v := range s {
		// result[i] 是类型T的可寻址值，
		// 因此可以调用 Set。
		result[i].Set(v)
	}
	return result
}
```

同样，这里使用`*T`意味着给定类型参数`A`，类型`*A`必须实现约束`Setter`。在这种情况下，`Set`必须位于`*A`的方法集中。在`FromStrings`中，使用`*T`表示只能在类型为`T`的可寻址值上调用`Set`方法。

我们现在可以这样用
{{< expand "原文" >}}
<p>Again, using <code>*T</code> here means that given a type argument <code>A</code>, the type <code>*A</code> must implement the constraint <code>Setter</code>. In this case, <code>Set</code> must be in the method set of <code>*A</code>. Within <code>FromStrings</code>, using <code>*T</code> means that the <code>Set</code> method may only be called on an addressable value of type <code>T</code>.</p>
<p>We can now use this as</p>
{{< /expand >}}

```go
func F() {
	// 使用重写的 FromStrings，现在可以了。
	// *Settable 实现了 Setter.
	nums := from.Strings(Settable)([]string{"1", "2"})
	// 这里的 nums 是 []Settable{1, 2}.
	...
}
```

明确地说，使用`*T Setter`类型并不意味着`Set`方法只能是指针方法。 `Set`可能仍然是值方法，因为所有值方法也都在指针类型的方法集中。在此示例中，只有将`Set`可以写作值方法才有意义，在包含指针字段的结构上定义方法时可能就是这种情况。
{{< expand "原文" >}}
<p>To be clear, using type <code>*T Setter</code> does not mean that the <code>Set</code> method must only be a pointer method. <code>Set</code> could still be a value method. That would be OK because all value methods are also in the pointer type's method set. In this example that only makes sense if <code>Set</code> can be written as a value method, which might be the case when defining the method on a struct that contains pointer fields.</p>
{{< /expand >}}

### 使用泛型类型作为未命名的函数参数类型
在将实例化类型解析为未命名函数参数类型时，存在解析歧义。
{{< expand "原文" >}}
<p>When parsing an instantiated type as an unnamed function parameter type, there is a parsing ambiguity.</p>
{{< /expand >}}

```go
var f func(x(T))
```

在此示例中，我们不知道该函数是具有实例化类型`x(T)`的单个未命名参数，或者是类型`(T)`的命名参数`x`（带括号）。
{{< expand "原文" >}}
<p>In this example we don't know whether the function has a single unnamed parameter of the instantiated type x(T), or whether this is a named parameter x of the type (T) (written with parentheses).</p>
{{< /expand >}}

我们希望这表示前者：实例化类型`x(T)`的未命名参数。这实际上与当前语言并不向后兼容，现在意味着后者。但是，`gofmt`程序当前将`func(x(T))`重写为`func(x T)`，因此`func(x(T))`在普通Go代码中非常罕见。
{{< expand "原文" >}}
<p>We would prefer that this mean the former: an unnamed parameter of the instantiated type <code>x(T)</code>. This is not actually backward compatible with the current language, where it means the latter. However, the gofmt program currently rewrites <code>func(x(T))</code> to <code>func(x T)</code>, so <code>func(x(T))</code> is very unusual in plain Go code.</p>
{{< /expand >}}

因此，我们建议更改语言，以便`func(x(T))`现在表示类型为`x(T)`的单个参数。这可能会破坏一些现有程序，但解决方法仅仅是运行`gofmt`。这可能会改变编写`func(x(T))`的程序的含义，这些程序不使用`gofmt`，而是选择引入与具有括号类型的函数参数同名的泛型类型`x`。我们认为，此类程序将极为罕见。

尽管如此，这仍然是一种风险，如果风险太大，我们可以避免进行此更改。
{{< expand "原文" >}}
<p>Therefore, we propose that the language change so that func(x(T)) now means a single parameter of type x(T). This will potentially break some existing programs, but the fix will be to simply run gofmt. This will potentially change the meaning of programs that write func(x(T)), that don't use gofmt, and that choose to introduce a generic type x with the same name as a function parameter with a parenthesized type. We believe that such programs will be exceedingly rare.</p>
<p>Still, this is a risk, and if the risk seems too large we can avoid making this change.</p>
{{< /expand >}}

### 类型参数的值未装箱
在Go的当前实现中，接口值始终包含指针。将非指针值放在接口变量中会使该值被*装箱*。这意味着实际值存储在堆或堆栈上的其他位置，并且接口值保存指向该位置的指针。
{{< expand "原文" >}}
<p>In the current implementations of Go, interface values always hold pointers. Putting a non-pointer value in an interface variable causes the value to be <I>boxed</I>. That means that the actual value is stored somewhere else, on the heap or stack, and the interface value holds a pointer to that location.</p>
{{< /expand >}}

在这种设计中，泛型类型的值未装箱。例如，让我们回顾一下前面的`from.Strings`示例。当用`Settable`类型实例化它时，它返回`[]Settable`类型的值。例如，我们可以这样写
{{< expand "原文" >}}
<p>In this design, values of generic types are not boxed. For example, let's look back at our earlier example of <code>from.Strings</code>. When it is instantiated with type <code>Settable</code>, it returns a value of type <code>[]Settable</code>. For example, we can write</p>
{{< /expand >}}

```go
// Settable 是可以从字符串设置的整数类型。
type Settable int

// Set 从字符串中设置 *p 的值。
func (p *Settable) Set(s string) (err error) {
	// 同上
}

func F() {
	// nums 的类型是 []Settable.
	nums, err := from.Strings(Settable)([]string{"1", "2"})
	if err != nil { ... }
	// 可将 Settable 直接转换为 int 。
	// 这将 first 设置为 1。
	first := int(nums[0])
	...
}
```

当我们调用类型为`Settable`的`from.Strings`时，我们会返回一个`[]Settable`（和一个错误）。该切片的元素将是可设置的值，也就是说，它们将是整数。即使它们是由通用函数创建和设置的，也不会被装箱。

同样，当实例化泛型类型时，它将具有预期的类型作为组件。
{{< expand "原文" >}}
<p>When we call <code>from.Strings</code> with the type <code>Settable</code> we get back a <code>[]Settable</code> (and an error). The elements of that slice will be <code>Settable</code> values, which is to say, they will be integers. They will not be boxed, even though they were created and set by a generic function.</p>
<p>Similarly, when a generic type is instantiated it will have the expected types as components.</p>
{{< /expand >}}

```go
type Pair(type F1, F2) struct {
	first  F1
	second F2
}
```

实例化该字段时，这些字段将不会被装箱，并且不会发生意外的内存分配。 `Pair(int, string)`类型可以转换为`struct { first int; second string }`。
{{< expand "原文" >}}
<p>When this is instantiated, the fields will not be boxed, and no unexpected memory allocations will occur. The type <code>Pair(int, string)</code> is convertible to <code>struct { first int; second string }</code>.</p>
{{< /expand >}}

### More on type lists


















## 示例

#### 没有参数化的方法

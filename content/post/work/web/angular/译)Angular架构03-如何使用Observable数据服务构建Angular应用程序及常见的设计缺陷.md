---
title: (译)Angular架构03-如何使用`Observable`数据服务构建`Angular`应用程序及常见的设计缺陷
tags: [angular, architecture, service, rxjs]
categories: [web, angular]
date: 2018-10-17 08:25:57
comment: true
---
这篇文章是正在进行的`Angular`架构系列的一部分，我们将在视图层和服务层一级介绍常见的设计问题和解决方案。 这是完整系列：
- 视图层架构-智能组件与展示组件
- 视图层架构-容器与展示组件常见的设计缺陷
- 服务层架构-如何使用`Observable`数据服务构建`Angular`应用程序
- 服务层架构-`Redux`和`Ngrx Store`-何时使用`Store`？为什么？
- 服务层架构-`Ngrx Store`-架构指南

在这篇文章中，我们将看到如何围绕`Observable`数据服务的概念构建`Angular`应用程序。 这是构建应用程序服务层的几种策略之一。 我们来看看以下主题：
- 用于构建`Angular`应用程序的替代架构
- 什么是`Observable`数据服务
- 如何使用它
- `RxJs`的`subject`以及如何使用它
- `BehaviourSubject`以及如何使用它
- 如何构建`Observable`数据服务
- 要避免的陷阱
- 结论

如果您想看一个非常简单的方法来调试`RxJs Observables`，请看一下这篇文章 - [如何调试`RxJs`——一种调试`Rxjs Observables`的简单方法](https://blog.angular-university.io/debug-rxjs/)。

<!-- more -->

## 用于构建`Angular`应用程序的替代架构
有几种可能性可用于构建`Angular`应用程序。 最近有一种趋势，用类似于`Redux`的风格构建具有单个原子状态的类似`Flux`的应用程序。 以下是以这种方式构建应用程序的几种替代方法：
- 如果使用集中存储模式构建应用程序的应用程序，建议使用[`@ngrx/store`指南](https://blog.angular-university.io/angular-ngrx-store-and-effects-crash-course/)。
- 如果使用`Redux`本身构建应用程序，请参阅此[文章](https://angular-university.io/angular-2-application-architecture-building-flux-like-apps-using-redux-and-immutable-js-js/)以获取更多详细信息和示例应用程序
- 如果使用`Redux`和单个状态原子的概念构建应用程序，但在`Rxjs`中实现它。 请参阅此其他[文章](https://angular-university.io/angular-2-application-architecture-building-applications-using-rxjs-and-functional-reactive-programming-vs-redux/)，了解其执行方式和示例应用

这篇文章将提供一个不使用单个状态原子的替代方案，并且包含使用`Observable`数据服务。 如果你开始使用`Observables`和`Angular`，你可能想看看这篇文章，我们将讨论一些常见的故障情况。

## 什么是`Observable`数据服务
`Observable`数据服务是`Angular`可注入服务，可用于向应用程序的多个部分提供数据。 可以将名为`store`的服务注入到需要数据的任何位置：
```ts
export class App {
    constructor(private todoStore: TodoStore, 
                private uiStateStore: UiStateStore) {
    }
}
```

在这种情况下，我们注入两个服务，一个包含应用程序数据，这是一个待办事项列表，另一个服务包含`UI`的当前状态：例如，当前显示给用户的错误消息。

## 如何使用`Observable`数据服务
数据服务公开了一个`observable`，例如`TodoStore`公开了`todos observable`。 这个`observable`的每个值都是一个新的待办事项列表。

然后可以使用数据服务直接在模板中使用`async`管道：
```html
<ul id="todo-list">
    <li *ngFor="let todo of todoStore.todos | async" >
        ...
    </li>
</ul>
```

## 如何修改服务的数据
服务中的数据通过调用它们的动作方法来修改，例如：
```ts
onAddTodo(description) {
    this.todoStore.addTodo(newTodo)
        .subscribe(
            res => {},
            err => {
                this.uiStateStore.endBackendAction();
            }
        );
}
```

然后，数据存储将根据操作方法调用为其数据发出新值，并且所有订户将接收新值并相应地更新。

### 关于`Observable`数据服务的一些有趣的事情
请注意，`TodoStore`的用户不知道是什么触发了新的`todos`列表：添加`todo`，删除`todo`或切换`todo`状态。 `store`的消费者只知道可以获得新值，并且视图将相应地进行调整。 这有效地解耦了应用程序的多个部分，因为数据的使用者不知道何时发生了修改。

另请注意，注入存储的应用程序的智能组件没有任何状态变量，这是一件好事，因为这些是编程错误的常见来源。

另外值得注意的是，智能组件中没有一个是直接使用`Http`后端服务的，只有对存储的调用才能触发数据修改。

现在我们已经了解了如何使用`Observable`数据服务，让我们看看如何使用`RxJ`构建。

## `RxJs`的`subject`以及如何使用它
`Observable`数据服务的核心是`RxJs`的`subject`。 `subject`实现`Observer`和`Observable`接口，这意味着我们可以使用它们来发出值以及注册订阅者。

`subject`不仅是传统的事件总线，而且更强大，因为它为所有`RxJs`功能操作提供了它。 但从本质上讲，我们只是使用它来订阅，就像一个常规的`observable`：
```ts
let subject = new Subject();
subject.subscribe(value => console.log('Received new subject value: '))
```

但与常规`observable`不同，`Subject`也可用于向其订阅者发送值：
```ts
subject.next(newValue);
```

`Subject`有一个特殊性，妨碍我们使用它来构建`Observable`数据服务：如果我们订阅它，我们将得不到最后一个值，我们不得不等到应用程序的某个部分调用next()。

这引起了一个问题，特别是在程序引导情况下，应用程序仍在初始化并且并非所有订户都已注册，例如并非所有`async`管道都有机会自行注册，因为并非所有模板都已初始化。

## `BehaviorSubject`以及如何使用它
解决方案是使用`BehaviorSubject`。 这种类型的主题将在订阅时返回流的最后一个值，或者如果尚未发出值则返回初始状态：
```ts
let BehaviorSubject = new BehaviorSubject(initialState);
```

`BehaviorSubject`还有另一个有趣的属性：我们可以随时检索流的当前值：
```ts
let currentValue = behaviorSubject.getValue();
```

这使得`BehaviorSubject`成为`Observable`数据服务的核心。 我们来看一个具体的例子。

## 如何构建`Observable`数据服务
您可以在[此处](https://github.com/jhades/angular2-rxjs-observable-data-services/blob/master/src/state/TodoStore.ts)找到`store`的完整示例，但这是该服务中最重要的部分：
```ts
@Injectable()
export class TodoStore {
    private _todos: BehaviorSubject<List<Todo>> = new BehaviorSubject(List([]));

    public readonly todos: Observable<List<Todo>> = this._todos.asObservable();

    constructor(private todoBackendService: TodoBackendService) {
        this.loadInitialData();
    }
    ...
}
```

我们可以看到`store`包含一个私有成员变量`_todos`，它是一个`BehaviorSubject`，其初始状态为`Todos`的空列表。

构造函数注入了`Http`后端服务，这是应用程序中使用此服务的唯一位置，应用程序的其余部分将注入`TodoStore`。

`store`在构建时被初始化，所以我们再次使用`BehaviorSubject`非常重要，否则这将无效。

但是使用额外的公共成员变量`todos`背后的原因是什么？

## 陷阱＃1 - 不要直接暴露`subject`
在此示例中，我们不直接将`subject`公开给`store`客户端，而是公开一个`observable`。

这是为了防止服务客户端自己直接发出存储值而不是调用操作方法，从而绕过存储。

### 避免`event soup`
直接暴露`subject`可能导致`event soup`应用，其中事件以难以理解的方式链接在一起。

直接访问`subject`的内部实现细节就像返回对对象的内部数据结构的内部引用：暴露内部意味着产生对象的控制并允许第三方发出值。

可能有一些有效的用例，但这很可能几乎不是预期的。

## 写一个`action`方法
在这种类型的应用程序中，操作只是`store`提供的方法。 让我们看看如何构建`addTodo`操作：
```ts
addTodo(newTodo:Todo):Observable {
    let obs = this.todoBackendService.saveTodo(newTodo);

    obs.subscribe(
            res => {
                this._todos.next(this._todos.getValue().push(newTodo));
            });

    return obs;
}
```

这只是一种方法。 我们称后端服务本身返回一个可观察的成功或错误。

我们订阅了相同的`observable`，并且在成功时我们通过将新`todo`添加到当前列表来计算新的待办事项列表。

## 陷阱＃2 - 避免重复的`HTTP`调用
在这个例子中要记住的一件事是，`Http`的可观察返回将有两个订阅者：一个在`addTodo`方法中，一个用户调用`addTodo`。

这将导致（由于`observable`默认工作的方式）重复的`HTTP`调用，因为设置了两个单独的处理链。 有关此观点以及观察者可能会让我们感到惊讶的其他方式的详细信息，请参阅此[文章]()。

要解决此问题，我们可以执行以下操作，以确保不会发生重复的`http`调用：
```ts
saveTodo(newTodo: Todo) : Observable> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.post('/todo', JSON.stringify(newTodo.toJS()),{headers}).publishLast().refCount();
}
```

要注意直接返回热可观察而不是`HTTP`冷可观察的权衡：没有重复的网络调用，但`saveTodo`的调用者可能无法自己执行某些操作（如重试）。

## 结论
`Observable`数据服务或存储是一种简单直观的模式，可以在不引入太多新概念的情况下利用`Angular`中功能响应式编程的强大功能。

熟悉的概念，如`subject`，基本上是一个事件总线，是这种模式的基础，这使得它比其他需要其他几个`RxJs`构造的模式更容易学习。

不直接暴露`subject`的一些预防措施可能足以使应用程序易于理解，但这取决于用例。

正如我们在陷阱部分中看到的那样，需要熟悉`RxJs`以及可观察的工作方式。 查看以前的[文章](https://angular-university.io/functional-reactive-programming-for-angular-2-developers-rxjs-and-observables/)了解更多详情。

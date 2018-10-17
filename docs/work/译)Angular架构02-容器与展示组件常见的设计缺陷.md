---
title: (译)Angular架构02-容器与展示组件常见的设计缺陷
tag: [angular, architecture, component]
category: [angular, architecture]
date: 2018-10-15 20:36:31
comment: true
---
这篇文章是正在进行的`Angular`架构系列的一部分，我们将在视图层和服务层一级介绍常见的设计问题和解决方案。 这是完整系列：
- 视图层架构-智能组件与展示组件
- 视图层架构-容器与展示组件常见的设计缺陷
- 服务层架构-如何使用`Observable`数据服务构建`Angular`应用程序
- 服务层架构-`Redux`和`Ngrx Store`-何时使用`Store`？为什么？
- 服务层架构-`Ngrx Store`-架构指南

接下来我们来谈谈`Angular`组件架构：我们将介绍非常常见的组件设计和潜在的设计问题，您可能会在应用它时遇到这些问题。
<!-- more -->

## 通用组件设计（以及它的潜在问题）
`Angular`应用程序开发的一个非常重要的方面是应用程序组件设计：如何将不同类型的组件组合在一起，何时使用组件与指令，如何以及何时将组件中的功能提取到指令等。

`Angular`组件提供了许多可以以多种不同方式使用和组合的功能。 这使我们可以根据情况采用各种各样的应用程序设计。

在这篇文章中，我们将讨论我们经常听到的一种特殊类型的设计。

### 容器组件与展示组件
我们将要讨论的设计方案是容器组件与展示组件之间的组件分离。

这是一种流行的设计，现在`Angular`生态系统中越来越多地使用它，因为现在`Angular`支持`Component`模型。 该设计在[Dan Abramov(@dan_abramov)](https://twitter.com/dan_abramov)的博客文章中介绍：

[展示和容器组件](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

该文章适用于`React`，但这些概念也适用于任何允许基于组件的设计模型的生态系统，如`Angular`。

## 容器与展示设计的一个例子
因此，让我们举一个这个设计的快速示例，请记住，不同的术语用于命名不同类型的组件。

设计的核心思想是有不同类型的组件。 使用与上述博客文章相同的术语，我们有：

- 容器组件：这些组件知道如何从服务层检索数据。 请注意，路由的顶级组件通常是容器组件，这就是为什么这种类型的组件最初这样命名的原因
- 展示组件 - 这些组件只是将数据作为输入，并知道如何在屏幕上显示它。 他们还可以发出自定义事件

让我们举一个这个设计的简单例子，它实际上已经包含了潜在的设计问题。 为了让它更有趣，我建议如下：尝试在我提供示例时发现设计问题，我们将在本文后面讨论该问题。

如果您已经尝试过使用此设计，很可能您遇到了这个问题。

### 以响应式编写的顶级组件
那么让我们开始使用我们路由的顶级组件。 让我们看一下用响应式编写的简单路由顶级组件：
```ts
@Component({
  selector: 'course-detail',
  templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent implements OnInit {
  user$: Observable<User>;
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  constructor(private route: ActivatedRoute, private coursesService: CoursesService,
     private newsletterService: NewsletterService, private userService:UserService) {}

  ngOnInit() {
      this.user$ = this.userService.user$;

      this.course$ = this.route.paramMap
          .map(params => params.get('id'))
          .switchMap(courseUrl => this.coursesService.findCourseByUrl(courseUrl));

      this.lessons$ = this.course$
         .switchMap(course => this.coursesService.findLessonsForCourse(course.id));
  }

    onSubscribe(email:string) {
        this.newsletterService.subscribeToNewsletter(email)
            .subscribe(
                () => alert('Subscription successful ...'),
                console.error);
    }
}
```

这是一个简单的组件，它显示了课程的详细信息：包含一个标题，其中包含课程摘要（以及新闻通讯框）和`lesson`列表。

因此，让我们分解一下我们在这个顶级组件中所拥有的内容以及它当前的设计方式：
- 该组件注入了路由器依赖项，但也有一些特定于应用程序的服务
- 该组件没有任何可以直接引用数据的变量，如`lessons`或`courses`
- 相反，组件在`ngOnInit`上声明了一些`observable`，它们是从服务层获得的其他`observable`派生的

### 顶级组件设计概述
此顶级组件将根据路由标识符参数定义如何从服务层获取数据。

这是响应式样式应用程序中的典型顶级组件，它不使用路由器数据预取（稍后将详细介绍）。 此组件最初将不显示任何数据，它将对服务层执行一次或多次调用以获取数据。

请注意，组件只是定义了一组`Observable`，但是在组件类中没有进行任何订阅：那么数据如何显示呢？

### 顶级组件的模板
现在让我们看一下这个组件的模板，看看这些`observable`是如何被使用的：
```html
<div class="screen-container">

    <course-detail-header [course]="course$ | async" [lessons]="lessons$ | async"
        [firstName]="(user$  | async).firstName" (subscribe)="onSubscribe($event)">
    </course-detail-header>

    <table class="table lessons-list card card-strong">
        <tbody>
        <tr *ngFor="let lesson of (lessons$ | async)">....</tr>
        </tbody>
    </table>
  
</div>
```

我们可以看到，我们正在使用`observable`，我们通过`async`管道订阅它们。 然后，数据将应用于存在于此路由的顶级组件下的本地组件树：

多种类型的数据，包括用户，`lessons`和`courses`，将被传递到`course-detail-header`组件，以及`lesson`列表。
这些组件负责呈现顶级组件检索的数据

#### 关于多个订阅的说明
一件重要的事情：`lessons$`这个`observable`订阅了两次。 在这种情况下，它不会造成问题，因为来自服务层的`observable`旨在防止对后端的多个请求，例如使用`publishLast().refCount()`。

请注意，这只是确保多个订阅不成问题的一种可能解决方案。 现在让我们来看看顶层组件模板中使用的其中一个本地组件。 我们将看到他们的设计非常不同。

## 研究展示组件的设计
顶级组件是一个容器组件，但是模板中使用的其他组件呢？

展示组件将负责获取输入数据并将其呈现给用户。 例如，`course-detail-header`是一个展示组件。 我们来看看这个组件的样子：
```ts
@Component({
    selector: 'course-detail-header',
    template: `
    <h2>{{course?.description}}</h2>
    <h5>Total lessons: {{lessons?.length}}</h5>
    <newsletter [firstName]="firstName" (subscribe)="onSubscribe($event)"></newsletter>
`, 
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseDetailHeaderComponent {
    @Input()
    course: Course;
    @Input()
    lessons: Lesson[];
    @Input()
    firstName:string;
    @Output()
    subscribe = new EventEmitter();

    onSubscribe(email:string) {
        this.subscribe.emit(email);
    }
}
```

> 提醒：尝试通过此设计发现问题

正如我们所看到的，组件将一些数据作为`input`，然后呈现给屏幕。 此组件与应用程序的服务层没有依赖关系，而是通过`input`接收其数据。

它还发出`output`，例如订阅`output`事件。 但是这个事件来自哪里？ 我们可以看到，这是为了响应来自简报组件的具有相同名称的事件而被触发。

新闻通讯组件的外观如何，它是如何设计的？ 我们来看一下。

## 展示组件更深一层组件树
新闻通讯组件也是一个展示组件，因为它需要输入，显示订阅表单并在订阅时发出事件：
```ts
@Component({
    selector: 'newsletter',
    template: `
<fieldset class="newsletter">
    <legend>Newsletter</legend>
    <h5>Hello {{firstName}}, enter your email below to subscribe:</h5>
    <form>
        <input #email type="email" name="email">
        <input  type="button" class="button button-primary" value="Subscribe"
               (click)="subscribeToNewsletter(email)">
    </form>
</fieldset>
`,
    styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent {

    @Input()
    firstName:string;

    @Output()
    subscribe = new EventEmitter();

    subscribeToNewsletter(emailField) {
        this.subscribe.emit(emailField.value);
        emailField.value = '';
    }
}
```

因此，这是我们目前为新闻通讯组件设计的设计，所以让我们更详细地查看它，看看问题可能是什么。

## 这个设计的潜在问题
您可能已经注意到新闻稿组件中的一些与`course-detail-header`组件类似的内容：
- `input`属性`firstName`
- `output`事件`subscribe`

在这两个组件中重复这两个元素。 所以看起来我们在这个设计中做了一些事情，这些事情可能无法在更大的组件树中很好地扩展，因为涉及很多重复。

让我们回顾一下这两个问题，看看我们怎么可能设计这个问题。

## 设计问题1 - 中间组件中的外来属性
看起来我们正在传递像`firstName`这样的`input`而不是本地组件树，以便像新闻稿组件这样的叶子组件使用它们。 但是中间组件本身并没有使用`input`，它们只是将它们传递给子组件。

通常，本地组件树比此示例大得多，因此该问题可能会导致大量重复输入。

此外，更重要的是：如果我们使用第三方窗口小部件库并且我们使用其中一些组件作为中间组件，我们可能无法通过组件树传递所有必要的数据，具体取决于库的设计方式。

还有另一个与产出有关的类似问题。

## 设计问题2 - 在本地组件树上冒泡的自定义事件
正如我们所看到的，订阅事件也在组件树的多个层次上重复，这是因为设计自定义事件不会冒泡。

所以在这里我们还有一个代码重复问题，对于一个更大的例子，它不能很好地扩展，并且不能与第三方库一起工作 - 在这种情况下我们无法应用这种技术。

此外，订阅新闻通讯（对`newsletterService`的调用）的逻辑是在顶级路由组件上，而不是在新闻通讯组件上。

这是因为只有顶级组件才能访问服务层，但最终导致该组件可能会保留很多逻辑。

那么我们如何在`Angular`中解决这些问题呢？ 我们来看看可能的解决方案。

## 防止自定义事件冒泡
如果我们发现自己处于组件树中手动冒泡事件的情况，那么对于某些更简单的情况可能会很好。 但是，如果事件冒泡/外来属性开始变得难以维护的话，这里有一个替代方案。

我们将通过一步一步的重构来呈现替代方案。 让我们再次从顶级组件开始重构，看看新解决方案如何避免我们发现的问题。

如果您想查看与此类似的重构版本的视频版本，请查看此[视频(Youtube)](https://youtu.be/9m3_HHeP9Ko)。

### 重构的顶级组件
让我们更改顶级组件，使其不再传递尽可能多的数据或从本地组件树接收尽可能多的事件。 我们还删除新闻订阅逻辑。

新版本的顶级组件现在拥有的代码比以前少得多：
```ts
@Component({
  selector: 'course-detail',
  templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent implements OnInit {
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  constructor(private route: ActivatedRoute,
              private coursesService: CoursesService) {}

  ngOnInit() {

      this.course$ = this.route.paramMap
         .map(params => params.get('id'))
         .switchMap(courseUrl => this.coursesService.findCourseByUrl(courseUrl));

      this.lessons$ = this.course$
        .switchMap(course => this.coursesService.findLessonsForCourse(course.id));
  }
}
```

所以这看起来是一个好的开始。 那么顶级组件模板呢？ 重构后新模板大部分相同，但`course-detail-header`组件除外：
```html
<course-detail-header  [course]="course$ | async" [lessons]="lessons$ | async">
</course-detail-header>
```

这看起来比我们以前的版本好：我们看不到`firstName`的传递或者`subscribe`事件的冒泡。

那么在重构之后，`course-detail-header`中间组件现在是什么样子？

### 重构的中间组件
我们在这里可以看到，在重构之后，新版本的`course-detail-header`组件现在变得更加简单：
```ts
@Component({
    selector: 'course-detail-header',
    template: `
    <h2>{{course?.description}}</h2>
    <h5>Total lessons: {{lessons?.length}}</h5>
    <newsletter></newsletter>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseDetailHeaderComponent {
    @Input()
    course: Course;

    @Input()
    lessons: Lesson[];
}
```

该组件的新版本仍包含新闻通讯，但它不再是冒泡事件并传递组件本身不需要的数据。

所以这看起来比我们最初提出的版本要好很多。 但现在订阅新闻通讯的功能在哪里？

现在让我们看看这个重构中的最后一个组件：叶子组件。

### 重构的叶子组件
正如我们所看到的，新闻通讯组件现在以完全不同的方式设计：
```ts
@Component({
    selector: 'newsletter',
    template: `
<fieldset class="newsletter">
    <legend>Newsletter</legend>
    <h5>Hello {{firstName}}, enter your email below to subscribe:</h5>
    <form>
        <input #email type="email" name="email">
        <input  type="button" class="button button-primary" value="Subscribe"
               (click)="subscribeToNewsletter(email)">
    </form>
</fieldset>
`})
export class NewsletterComponent implements OnInit {

    firstName:string;

    constructor(private userService: UserService,
        private newsletterService: NewsletterService) {}

    ngOnInit() {
        this.userService.user$.subscribe(user => this.firstName = user.firstName );
    }

    subscribeToNewsletter(email:string) {
        this.newsletterService.subscribeToNewsletter(email)
            .subscribe(
                () => alert('Subscription successful ...'),
                console.error);
    }
}
```

那么现在这个新版新闻通讯组件的最大设计差异是什么呢？

> 最大的区别实际上是这个新版本看起来很像容器组件！

正如我们所看到的，有时最好的解决方案是将服务深入到组件树中。 这真的简化了本例中涉及的所有多个组件。

但是叶子组件的这种实现可以进一步改进，所以让我们进一步详细介绍这个设计，看看如何。

### 查看新的组件设计解决方案
这个特定组件树的新设计似乎更易于维护。 不再冒泡自定义事件或通过组件树传递无关的`input`属性。

新闻通讯组件现在知道服务层，正在从中获取所有数据。 它引用了新闻通讯服务，因此可以直接调用它。 请注意，如果需要，此组件仍可以接收输入，稍后将详细说明。

### 利用`Angular`功能来获得更简单的设计
我们可以看到，在组件树的这个新版本中，我们现在正在利用`Angular`依赖注入系统在本地组件树中深入注入服务。

这允许深度嵌套的组件（如新闻通讯组件）直接从服务层接收数据，而不必通过输入接收数据。

这使得顶级组件和中间组件都更简单，并避免代码重复。 它还允许将与服务层交互的逻辑深深地放入组件树中，如果这是最有意义的话。

#### 当前新闻通讯组件实现的一个问题
这个新版本的新闻通讯组件只有一个问题：与以前版本的表现组件不同：

> 这个新版本不适用于OnPush变化检测！

## 使新闻通讯组件与`OnPush`兼容
在此之前您可能已经注意到，当我们切换组件以使用`OnPush`更改检测时，事情就会停止工作 - 即使我们没有在组件级别进行本地数据变动。

其中一个例子是当前版本的新闻通讯组件，它确实是不会反映模板上名字的新版本。

但是这里有一个与`OnPush`兼容的组件版本：
```ts
@Component({
    selector: 'newsletter',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<fieldset class="newsletter">
    <legend>Newsletter</legend>
    <h5>Hello {{firstName$ | async }}, enter your email below to subscribe:</h5>
    ...
</fieldset>`})
export class NewsletterComponent implements OnInit {

    firstName$: Observable<string>;

    constructor( private userService: UserService,
        private newsletterService: NewsletterService) {}

    ngOnInit() {
        this.firstName$ = this.userService.user$.map(user =>  user.firstName );
    }

    subscribeToNewsletter(email:string) {
        this.newsletterService.subscribeToNewsletter(email)
            .subscribe(
                () => alert('Subscription successful ...'),
                console.error);
    }
}
```

那么这个新实现有什么不同呢？ 在这个版本的组件中，我们定义了一个名为`firstName$`的`observable`，我们已经使用`async`管道在模板中使用了它。

使用`async`管道将确保在发出新版本的`firstName`时（例如，当用户登录时）重新呈现组件，即使组件没有`input` - 因为`sync`管道将检测到`observable`发出了一个新值，因此它将标记该组件以进行重新渲染。

## 结论
因此，我们可以看到有许多可能的组件设计，具体取决于具体情况。 如果需要，使用`Angular`依赖注入系统确实可以很容易地在组件树中深入注入服务。

因此，我们不一定必须通过组件树的多个级别传递数据和事件，因为这可能会因代码重复（以及其他问题）而导致可维护性问题。

但是，为什么在尝试应用容器+展示设计时，这种情况最终会如此发生？

### 因为自定义事件冒泡问题
这个设计可能最终被使用的一个主要原因可能是：在软件设计中，我们提供的名称可能会产生很大的影响。

而容器组件这个名称让我们认为只有路由的顶层组件应该具有这种类型的设计，并且它所使用的所有其他组件应该是展示性的，而事实并非如此。

容器这个名称并没有让我们想到像新闻通讯组件那样的叶子组件。

所以为了避免这个问题，这里有一个建议：如果我们需要为知道服务层的组件命名，并且有一个名称有助于应用程序设计讨论，我们可以调用它们，例如智能组件， 并将术语容器保留为路由的顶级组件。

在实践中，根据需要混合和匹配多种类型的组件设计实际上更加实用，并且在必要时在树的不同级别使用不同类型的组件 - 根据需要混合不同的功能。

我希望你喜欢这篇文章，并且它有助于开始使用视图层设计。 请务必查看上面架构系列上的其他文章！
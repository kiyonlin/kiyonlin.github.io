---
title: PHPUnit
tag: [phpunit]
category:
  - 技术
  - 测试
date: 2017-03-06 13:17:59
updated: 2017-03-06 13:17:59
---
# 编写PHPUnit测试
- 针对类 Class 的测试写在类 ClassTest中。
- ClassTest（通常）继承自 PHPUnit\Framework\TestCase。
- 测试都是命名为 test* 的公用方法。也可以在方法的文档注释块(docblock)中使用 @test 标注将其标记为测试方法。
- 在测试方法内，类似于 assertEquals()这样的断言方法用来对实际值与预期值的匹配做出断言。


> 	
当你想把一些东西写到 print 语句或者调试表达式中时，别这么做，将其写成一个测试来代替。--Martin Fowler

## 测试的依赖关系
- 生产者(producer)，是能生成被测单元并将其作为返回值的测试方法。
- 消费者(consumer)，是依赖于一个或多个生产者及其返回值的测试方法。

使用 `@depends` 标注来表达测试方法之间的依赖关系。

	默认情况下，生产者所产生的返回值将“原样”传递给相应的消费者。这意味着，如果生产者返回的是一个对象，那么传递给消费者的将是一个指向此对象的引用。如果需要传递对象的副本而非引用，则应当用 @depends clone 替代 @depends。	
	
测试可以使用多个 `@depends` 标注。PHPUnit 不会更改测试的运行顺序，因此你需要自行保证某个测试所依赖的所有测试均出现于这个测试之前。

拥有多个 `@depends` 标注的测试，其第一个参数是第一个生产者提供的基境，第二个参数是第二个生产者提供的基境，以此类推。

```PHP
<?php
use PHPUnit\Framework\TestCase;

class MultipleDependenciesTest extends TestCase
{
    public function testProducerFirst()
    {
        $this->assertTrue(true);
        return 'first';
    }

    public function testProducerSecond()
    {
        $this->assertTrue(true);
        return 'second';
    }

    /**
     * @depends testProducerFirst
     * @depends testProducerSecond
     */
    public function testConsumer()
    {
        $this->assertEquals(
            ['first', 'second'],
            func_get_args()
        );
    }
}
?>
```

## 数据供给器
使用 `@dataProvider` 标注来指定使用哪个数据供给器方法。
最好逐个用字符串键名对其命名。

```PHP
<?php
use PHPUnit\Framework\TestCase;

class DataTest extends TestCase
{
    /**
     * @dataProvider additionProvider
     */
    public function testAdd($a, $b, $expected)
    {
        $this->assertEquals($expected, $a + $b);
    }

    public function additionProvider()
    {
        return [
            'adding zeros'  => [0, 0, 0],
            'zero plus one' => [0, 1, 1],
            'one plus zero' => [1, 0, 1],
            'one plus one'  => [1, 1, 3]
        ];
    }
}
?>
```


	所有的数据供给器方法的执行都是在对 setUpBeforeClass 静态方法的调用和第一次对 setUp 方法的调用之前完成的。因此，无法在数据供给器中使用创建于这两个方法内的变量。这是必须的，这样 PHPUnit 才能计算测试的总数量。

## 对异常进行测试
使用 `@expectException` 标注来测试被测代码中是否抛出了异常。

```PHP
<?php
use PHPUnit\Framework\TestCase;

class ExceptionTest extends TestCase
{
    public function testException()
    {
        $this->expectException(InvalidArgumentException::class);
    }
}
?>
```

除了 `expectException()` 方法外，还有 `expectExceptionCode()`、`expectExceptionMessage() `和 `expectExceptionMessageRegExp()` 方法可以用于为被测代码所抛出的异常建立预期。

或者，也可以用 `@expectedException`、`@expectedExceptionCode`、`@expectedExceptionMessage` 和 `@expectedExceptionMessageRegExp` 标注来为被测代码所抛出的异常建立预期。


# 命令行测试执行器
- `.` 当测试成功时输出。
- `F` 当测试方法运行过程中一个断言失败时输出。
- `E` 当测试方法运行过程中产生一个错误时输出。
- `R` 当测试被标记为有风险时输出。
- `S` 当测试被跳过时输出。
- `I` 当测试被标记为不完整或未实现时输出。

## 命令行选项
- `--group` 只运行来自指定分组（可以多个）的测试。可以用 `@group` 标注为测试标记其所属的分组。`@author` 标注是 `@group` 的一个别名，允许按作者来筛选测试。
- `--disallow-todo-tests` 不执行文档注释块中含有 `@todo` 标注的测试。
- `--stop-on-error` 首次错误出现后停止执行。
- `--stop-on-failure` 首次错误或失败出现后停止执行。
- `--stop-on-risky` 首次碰到有风险的测试时停止执行。
- `--stop-on-skipped` 首次碰到跳过的测试时停止执行。
- `--stop-on-incomplete` 首次碰到不完整的测试时停止执行。
- `--verbose` 输出更详尽的信息，例如不完整或者跳过的测试的名称。
- `--debug` 输出调试信息，例如当一个测试开始执行时输出其名称。

# 基境(fixture)
在编写测试时，最费时的部分之一是编写代码来将整个场景设置成某个已知的状态，并在测试结束后将其复原到初始状态。这个已知的状态称为测试的 *基境(fixture)*。

PHPUnit 支持共享建立基境的代码。在运行某个测试方法前，会调用一个名叫 `setUp()` 的模板方法。`setUp()` 是创建测试所用对象的地方。当测试方法运行结束后，不管是成功还是失败，都会调用另外一个名叫 `tearDown()` 的模板方法。`tearDown()` 是清理测试所用对象的地方。测试类的每个测试方法都会运行一次 `setUp()` 和 `tearDown()` 模板方法。

`setUpBeforeClass()` 与 `tearDownAfterClass()` 模板方法将分别在测试用例类的第一个测试运行之前和测试用例类的最后一个测试运行之后调用。

# 组织测试
## 用文件系统来编排测试套件
```
src                                 tests
`-- Currency.php                    `-- CurrencyTest.php
`-- IntlFormatter.php               `-- IntlFormatterTest.php
`-- Money.php                       `-- MoneyTest.php
`-- autoload.php
```

```bash
phpunit --bootstrap src/autoload.php tests
PHPUnit 6.0.0 by Sebastian Bergmann.

.................................

Time: 636 ms, Memory: 3.50Mb

OK (33 tests, 52 assertions)
```

## 用 XML 配置来编排测试套件
### PHPUnit
`<phpunit>` 元素的属性用于配置 PHPUnit 的核心功能。

```xml
<phpunit
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://schema.phpunit.de/4.5/phpunit.xsd"
         backupGlobals="true"
         backupStaticAttributes="false"
         <!--bootstrap="/path/to/bootstrap.php"-->
         cacheTokens="false"
         colors="false"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         forceCoversAnnotation="false"
         mapTestClassNameToCoveredClassName="false"
         printerClass="PHPUnit_TextUI_ResultPrinter"
         <!--printerFile="/path/to/ResultPrinter.php"-->
         processIsolation="false"
         stopOnError="false"
         stopOnFailure="false"
         stopOnIncomplete="false"
         stopOnSkipped="false"
         stopOnRisky="false"
         testSuiteLoaderClass="PHPUnit_Runner_StandardTestSuiteLoader"
         <!--testSuiteLoaderFile="/path/to/StandardTestSuiteLoader.php"-->
         timeoutForSmallTests="1"
         timeoutForMediumTests="10"
         timeoutForLargeTests="60"
         verbose="false">
  <!-- ... -->
</phpunit>
```

### 测试套件
带有一个或多个 `<testsuite>` 子元素的 `<testsuites>` 元素用于将测试套件及测试用例组合出新的测试套件。

```xml
<testsuites>
  <testsuite name="My Test Suite">
    <directory>/path/to/*Test.php files</directory>
    <file>/path/to/MyTest.php</file>
    <exclude>/path/to/exclude</exclude>
  </testsuite>
</testsuites>
```

### 分组
`<groups>` 元素及其 `<include>`、`<exclude>`、`<group>` 子元素用于从带有 `@group` 标注的测试中选择需要运行（或不运行）的分组。

```xml
<groups>
  <include>
    <group>name</group>
  </include>
  <exclude>
    <group>name</group>
  </exclude>
</groups>
```

### Whitelisting Files for Code Coverage
`<filter>` 元素及其子元素用于配置代码覆盖率报告所使用的白名单。

```xml
<filter>
  <whitelist processUncoveredFilesFromWhitelist="true">
    <directory suffix=".php">/path/to/files</directory>
    <file>/path/to/file</file>
    <exclude>
      <directory suffix=".php">/path/to/files</directory>
      <file>/path/to/file</file>
    </exclude>
  </whitelist>
</filter>
```

### Logging （日志记录）
`<logging>` 元素及其 `<log>` 子元素用于配置测试执行期间的日志记录。

```xml
<logging>
  <log type="coverage-html" target="/tmp/report" lowUpperBound="35"
       highLowerBound="70"/>
  <log type="coverage-clover" target="/tmp/coverage.xml"/>
  <log type="coverage-php" target="/tmp/coverage.serialized"/>
  <log type="coverage-text" target="php://stdout" showUncoveredFiles="false"/>
  <log type="json" target="/tmp/logfile.json"/>
  <log type="tap" target="/tmp/logfile.tap"/>
  <log type="junit" target="/tmp/logfile.xml" logIncompleteSkipped="false"/>
  <log type="testdox-html" target="/tmp/testdox.html"/>
  <log type="testdox-text" target="/tmp/testdox.txt"/>
</logging>
```

### 测试监听器
`<listeners>` 元素及其 `<listener>` 子元素用于在测试执行期间附加额外的测试监听器。

```xml
<listeners>
  <listener class="MyListener" file="/optional/path/to/MyListener.php">
    <arguments>
      <array>
        <element key="0">
          <string>Sebastian</string>
        </element>
      </array>
      <integer>22</integer>
      <string>April</string>
      <double>19.78</double>
      <null/>
      <object class="stdClass"/>
    </arguments>
  </listener>
</listeners>
```

以上 XML 配置对应于将 `$listener` 对象（见下文）附到测试执行过程上。

```xml
$listener = new MyListener(
    ['Sebastian'],
    22,
    'April',
    19.78,
    null,
    new stdClass
);
```

### 设定 PHP INI 设置、常量、全局变量
`<php>` 元素及其子元素用于配置 PHP 设置、常量以及全局变量。同时也可用于向 `include_path` 前部置入内容。

```xml
<php>
  <includePath>.</includePath>
  <ini name="foo" value="bar"/>
  <const name="foo" value="bar"/>
  <var name="foo" value="bar"/>
  <env name="foo" value="bar"/>
  <post name="foo" value="bar"/>
  <get name="foo" value="bar"/>
  <cookie name="foo" value="bar"/>
  <server name="foo" value="bar"/>
  <files name="foo" value="bar"/>
  <request name="foo" value="bar"/>
</php>
```

# 有风险的测试
## 无用测试
PHPUnit 可以更严格对待事实上不测试任何内容的测试。此项检查可以用命令行选项 `--report-useless-tests` 或在 PHPUnit 的 XML 配置文件中设置 `beStrictAboutTestsThatDoNotTestAnything="true"` 来启用。

在启用本项检查后，如果某个测试未进行任何断言，它将被标记为有风险。仿件对象中的预期和诸如 `@expectedException` 这样的标注同样视为断言。

## 意外的代码覆盖
PHPUnit 可以更严格对待意外的代码覆盖。此项检查可以用命令行选项 `--strict-coverage` 或在 PHPUnit 的 XML 配置文件中设置 `checkForUnintentionallyCoveredCode="true"` 来启用。

在启用本项检查后，如果某个带有 `@covers` 标注的测试执行了未在 `@covers` 或 `@uses` 标注中列出的代码，它将被标记为有风险。

## 测试执行期间产生的输出
PHPUnit 可以更严格对待测试执行期间产生的输出。 此项检查可以用命令行选项 `--disallow-test-output` 或在 PHPUnit 的 XML 配置文件中设置 `beStrictAboutOutputDuringTests="true"` 来启用。

在启用本项检查后，如果某个测试产生了输出，例如，在测试代码或被测代码中调用了 `print`，它将被标记为有风险。

## 测试执行时长的超时限制
如果安装了 `PHP_Invoker` 包并且 `pcntl` 扩展可用，那么可以对测试的执行时长进行限制。此时间限制可以用命令行选项 `--enforce-time-limit` 或在 PHPUnit 的 XML 配置文件中设置 `beStrictAboutTestSize="true"` 来启用。

带有 `@large` 标注的测试如果执行时间超过60秒将视为失败。此超时限制可以通过XML配置文件中的 `timeoutForLargeTests` 属性进行配置。

带有 `@medium` 标注的测试如果执行时间超过10秒将视为失败。此超时限制可以通过XML配置文件中的 `timeoutForMediumTests` 属性进行配置。

没有 `@medium` 或 `@large` 标注的测试都将视同为带有 `@small` 标注，这类测试如果执行时间超过1秒将视为失败。此超时限制可以通过XML配置文件中的 `timeoutForSmallTests` 属性进行配置。

## 全局状态篡改
PHPUnit 可以更严格对待篡改全局状态的测试。此项检查可以用命令行选项 `--strict-global-state` 或在 PHPUnit 的 XML 配置文件中设置 `beStrictAboutChangesToGlobalState="true"` 来启用。

# 未完成的测试
`void markTestIncomplete([string $message])` 将当前测试标记为未完成，并用 `$message` 作为说明信息。

```PHP
<?php
use PHPUnit\Framework\TestCase;

class SampleTest extends TestCase
{
    public function testSomething()
    {
        // 可选：如果愿意，在这里随便测试点什么。
        $this->assertTrue(true, '这应该已经是能正常工作的。');

        // 在这里停止，并将此测试标记为未完成。
        $this->markTestIncomplete(
          '此测试目前尚未实现。'
        );
    }
}
?>
```

# 跳过测试
`void markTestSkipped([string $message])` 将当前测试标记为已跳过，并用 `$message` 作为说明信息。

```PHP
<?php
use PHPUnit\Framework\TestCase;

class DatabaseTest extends TestCase
{
    protected function setUp()
    {
        if (!extension_loaded('mysqli')) {
            $this->markTestSkipped(
              'MySQLi 扩展不可用。'
            );
        }
    }

    public function testConnection()
    {
        // ...
    }
}
?>
```

# 测试替身
PHPUnit 提供的 `createMock($type)` 和 `getMockBuilder($type)` 方法可以在测试中用来自动生成对象，此对象可以充当任意指定原版类型（接口或类名）的测试替身。在任何预期或要求使用原版类的实例对象的上下文中都可以使用这个测试替身对象来代替。

`createMock($type)` 方法直接返回指定类型（接口或类）的测试替身对象实例。此测试替身的创建使用了最佳实践的默认值（不执行原始类的 `__construct()` 和 `__clone()` 方法，且不对传递给测试替身的方法的参数进行克隆）。如果这些默认值非你所需，可以用 `getMockBuilder($type)` 方法并使用流畅式接口来定制测试替身的生成过程。

	final、private 和 static 方法无法对其进行上桩(stub)或模仿(mock)。PHPUnit 的测试替身功能将会忽略它们，并维持它们的原始行为。
	
## Stubs （桩件）
将对象替换为（可选地）返回配置好的返回值的测试替身的实践方法称为*上桩(stubbing)*。可以用*桩件(stub)*来“替换掉被测系统所依赖的实际组件，这样测试就有了对被测系统的间接输入的控制点。这使得测试能强制安排被测系统的执行路径，否则被测系统可能无法执行”。

**需要对其上桩的类**

```PHP
<?php
use PHPUnit\Framework\TestCase;

class SomeClass
{
    public function doSomething()
    {
        // 随便做点什么。
    }
}
?>
```

**对某个方法的调用上桩，返回固定值**

```PHP
<?php
use PHPUnit\Framework\TestCase;

class StubTest extends TestCase
{
    public function testStub()
    {
        // 为 SomeClass 类创建桩件。
        $stub = $this->createMock(SomeClass::class);

        // 配置桩件。
        $stub->method('doSomething')
             ->willReturn('foo');

        // 现在调用 $stub->doSomething() 将返回 'foo'。
        $this->assertEquals('foo', $stub->doSomething());
    }
}
?>
```

**使用可用于配置生成的测试替身类的仿件生成器 API**

```PHP
<?php
use PHPUnit\Framework\TestCase;

class StubTest extends TestCase
{
    public function testStub()
    {
        // 为 SomeClass 类建立桩件。
        $stub = $this->getMockBuilder($originalClassName)
                     ->disableOriginalConstructor()
                     ->disableOriginalClone()
                     ->disableArgumentCloning()
                     ->disallowMockingUnknownTypes()
                     ->getMock();

        // 配置桩件。
        $stub->method('doSomething')
             ->willReturn('foo');

        // 现在调用 $stub->doSomething() 将返回 'foo'。
        $this->assertEquals('foo', $stub->doSomething());
    }
}
?>
```
---
id: 189
title: Awaited
lang: zh
level: easy
tags: promise
---

## 挑战

如果我们有一个包装类型，比如`Promise` 我们如何获得包装类型的内部类型? 例如，如果
我们有`Promise<ExampleType>`如何得到`ExampleType` ?

## 解答

这是一个非常有趣的挑战，它要求我们了解 TypeScript 的一个被低估的特性，恕我直言。

但是，在说明我的意思之前，让我们来分析一下这个挑战。作者要求我们展开类型。什么是
展开? 展开是从另一个类型中提取内部类型。

让我用一个例子来说明。如果你有一个类型`Promise<string>`，展开`Promise`类型将得到
类型`string`。我们从外部类型得到其内部类型。

注意，你还需要递归地展开类型。例如，如果你有类型`Promise<Promise<string>>`，你需
要返回类型`string`。

现在，言归正传。我将从最简单的例子开始。如果我们的`Awaited`类型得
到`Promise<string>`，我们需要返回`string`，否则我们返回`T`本身，因为它不是一个
Promise:

```ts
type Awaited<T> = T extends Promise<string> ? string : T;
```

但是有一个问题。这样，我们只能处理`string`类型在`Promise`中的情况，而我们需要的
是可以处理任何情况。怎么做呢? 在我们不知道类型的情况下，如何从`Promise`获取类型?

出于这些目的，TypeScript 在条件类型中有类型推断功能! 你可以对编译器说"嘿，一旦你
知道了类型是什么，请把它赋给我的类型参数"。你可以在这里阅读更多关
于[条件类型中的类型推断](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types)。

了解了类型推断之后，我们可以更新我们的解答。我们没有在条件类型中检
查`Promise<string>`，而是将`string`替换为`infer R`，因为我们不知道那里必须有什么
。我们只知道它是`Promise<T>`，其内部包含某种类型。

一旦 TypeScript 确定了`Promise`中的类型，它就会把它赋给我们的类型参数`R`，并在
“true”分支中可用。我们正是从这里返回它的：

```ts
type Awaited<T> = T extends Promise<infer R> ? R : T;
```

我们几乎完成了，但从类型`Promise<Promise<string>>`我们得到类
型`Promise<string>`。因此，我们需要递归地重复相同的过程，这是通过调用`Awaited`本
身来实现的:

```ts
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type Inference in Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 533
title: Concat
lang: zh
level: easy
tags: array
---

## 挑战

在类型系统中实现 JavaScript 的`Array.concat`函数。它接收 2 个参数并将输入按顺序
输出为一个新数组。

例如：

```ts
type Result = Concat<[1], [2]>; // expected to be [1, 2]
```

## 解答

在 TypeScript 中处理数组时，变参元组类型通常会在某些情况下发挥作用。他们允许我们
进行泛型展开。稍后我会试着说明。

让我向你展示在 JavaScript 中连接两个数组的实现:

```js
function concat(arr1, arr2) {
  return [...arr1, ...arr2];
}
```

我们可以使用展开操作符将`arr1`中的所有元素放入另外一个数组中。我们可以对`arr2`进
行同样的操作。这里的关键是，它迭代数组或元组中的元素，并将它们粘贴到使用展开操作
符的地方。

可变元组类型允许我们在类型系统中建模相同的行为。如果我们想要连接两个泛型数组，可
以使用展开操作符返回合并后的新数组:

```ts
type Concat<T, U> = [...T, ...U];
```

我们遇到一个错误“A rest element type must be an array type.”。让我们来修复它并让
编译器知道这些类型是数组：

```ts
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];
```

## 参考

- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 43
title: Exclude
lang: zh
level: easy
tags: built-in
---

## 挑战

实现内置的`Exclude<T, U>`。从`T`中排除`U`指定的类型。例如：

```ts
type T0 = Exclude<"a" | "b" | "c", "a">; // expected "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // expected "c"
```

## 解答

这里重要的细节是 TypeScript 中的条件类型
是[可分配的](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)。

所以当你在写`T extends U`且`T`是联合类型时，实际上发生的是 TypeScript 遍历联合类
型`T`并将条件应用到每个元素上。

因此，这个解答是非常直接的。我们检查`T`如果可以分配给`U`则跳过：

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

## 参考

- [Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 14
title: First of Array
lang: zh
level: easy
tags: array
---

## 挑战

实现一个泛型`First<T>`，接收一个数组`T`然后返回它的第一个元素的类型。

例如：

```ts
type arr1 = ["a", "b", "c"];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // expected to be 'a'
type head2 = First<arr2>; // expected to be 3
```

## 解答

首先我们想到的就是使用查询类型，然后写出`T[0]`：

```ts
type First<T extends any[]> = T[0];
```

但是这里有个临界情况我们需要去处理。如果我们传入一个空数组，`T[0]`不能正常工作，
因为它没有元素。

因此，在访问数组中的第一个元素之前，我们需要检查数组是否为空。为此，我们可以在
TypeScript 中使
用[条件类型](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)。

它们背后的理念非常简单。如果我们可以将该类型分配给条件类型，它将进入“true”分支，
否则它将采取“false”分支。

我们接下来检查，如果数组为空，则什么也不返回，否则返回数组的第一个元素:

```ts
type First<T extends any[]> = T extends [] ? never : T[0];
```

## 参考

- [Indexed Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 268
title: If
lang: zh
level: easy
tags: utils
---

## 挑战

实现一个工具`If`，它接受一个条件`C`，为真返回类型`T`，为假返回类型`F`。`C`期望值
为`true`或`false`，而`T`和`F`可以为任意类型。

例如：

```ts
type A = If<true, "a", "b">; // expected to be 'a'
type B = If<false, "a", "b">; // expected to be 'b'
```

## 解答

如果你不确定什么时候在 TypeScript 中使
用[条件类型](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)，
那就是你需要对类型使用“if”语句的时候。这正是我们这里要做的。

如果条件类型的计算结果为`true`，我们需要取“true”分支，否则“false”分支:

```ts
type If<C, T, F> = C extends true ? T : F;
```

这样我们会得到一个编译错误，因为我们试图将`C`赋值给布尔类型，而没有一个显式的约
束。因此，让我们通过在类型参数`C`中添加`extends boolean`来修复它:

```ts
type If<C extends boolean, T, F> = C extends true ? T : F;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 898
title: Includes
lang: zh
level: easy
tags: array
---

## 挑战

在类型系统种实现 JavaScript 的`Array.includes`函数，接收 2 个参数。它的输出应该
是布尔类型`true`或`false`。例如：

```typescript
// expected to be `false`
type isPillarMen = Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Dio">;
```

## 解答

我们首先编写接受两个参数的类型:`T`(元组)和`U`(我们正在寻找的)。

```typescript
type Includes<T, U> = never;
```

在我们真正能在元组中找到一些东西之前，将其“转换”为联合（union）比会元组（tuple）
更容易一些。为此，我们可以使用索引类型（indexed types）。如果我们访
问`T[number]`，TypeScript 会返回`T`中所有元素的联合（union）。例如，如果你有一
个`T = [1, 2, 3]`，通过`T = [1, 2, 3]`访问将返回`1 | 2 | 3`。

```typescript
type Includes<T, U> = T[number];
```

但是，这里有一个错误，“Type ‘number’ cannot be used to index type ‘T’”。这是因为
类型`T`没有约束。我们需要告诉 TypeScript，`T`是一个数组。

```typescript
type Includes<T extends unknown[], U> = T[number];
```

我们有了元素的联合（union）。我们如何检查元素是否存在于联合（union）中？条件类型
分配（Distributive）!我们可以为联合（union）编写条件类型，TypeScript 会自动将条
件应用到联合（union）的每个元素上。

例如，如果你写`2 extends 1 | 2`，TypeScript 实际上会把它替换成 2 个条件语
句`2 extends 1`和`2 extends 2`。

我们可以利用它检查`U`是否在`T[number]`中，如果在则返回 true。

```typescript
type Includes<T extends unknown[], U> = U extends T[number] ? true : false;
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
- [Index Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 3312
title: Parameters
lang: zh
level: easy
tags: infer tuple built-in
---

## 挑战

实现内置的 `Parameters<T>` 泛型而不使用它。

## 解答

这个挑战要求我们从函数中获取部分信息。更确切地说，是函数的参数。我们首先声明一个
接受泛型类型 `T` 的类型，我们将使用它来获取参数:

```typescript
type MyParameters<T> = any;
```

那么，“获得我们还不知道的类型”的正确方法是什么? 通过使用推断! 但在使用它之前，让
我们先从一个简单的条件类型来匹配函数:

```typescript
type MyParameters<T> = T extends (...args: any[]) => any ? never : never;
```

这里，我们检查类型 `T` 是否与函数的任何参数和任何返回类型匹配。现在，我们可以利
用推断替换掉参数列表中的 `any[]`:

```typescript
type MyParameters<T> = T extends (...args: infer P) => any ? never : never;
```

这样，TypeScript 编译器就会推断出函数的参数列表，并将其赋值给类型 `P`。剩下的就
是从分支返回类型:

```typescript
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 4
title: Pick
lang: zh
level: easy
tags: union built-in
---

## 挑战

实现内置的`Pick<T, K>`而不使用它。

通过从`T`中选取属性集`K`来构建一个类型。

例如：

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
```

## 解答

为了解出这个挑战，我们需要使用查找类型和映射类型。

查找类型允许我们通过名称从另一个类型中提取一个类型。类似于使用键值从一个对象中获
取值。

映射类型允许我们将一个类型中的每个属性转换为一个新类型。

你可以在 TypeScript 网
站[lookup types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)和[mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)上
了解更多它们得信息，并了解它们在做什么。

现在，我们知道 TypeScript 中有查找类型和映射类型。如何实现所需的类型?

我们需要从联合（union）`K`取得所有内容，进行遍历，并返回一个仅包含这些键的新类型
。这正是映射类型所做的事。

尽管我们需要从原始类型中获取它的类型，值的类型本身并没有变化。这就是查找类型的用
处所在：

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

我们说“从`K`中获取所有内容，命名为`P`并将其作为我们新对象的一个新键，其值类型取
自输入类型”。一开始理解很难，所以你一旦不理解什么，就尝试重读一遍，再一步步的在
脑海里思考。

## 参考

- [Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Indexed Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 3057
title: Push
lang: zh
level: easy
tags: array
---

## 挑战

实现泛型版本的`Array.push`。例如：

```typescript
type Result = Push<[1, 2], "3">; // [1, 2, '3']
```

## 解答

这个实际上很简单。要实现一个将元素插入数组的类型，我们需要做 2 件事。第一件事是
获取数组的所有元素，第二件事是向它们插入一个额外的元素。

要从数组中获取所有元素，可以使用可变参数元组类型。因此，让我们返回一个具有输入类
型`T`中相同元素的数组:

```typescript
type Push<T, U> = [...T];
```

得到一个编译错误“A rest element type must be an array type”。这意味着我们不能在
非数组类型上使用可变元组类型。因此，让我们添加一个通用的约束来表明我们只处理数组
:

```typescript
type Push<T extends unknown[], U> = [...T];
```

现在，我们有一个类型参数`T`传入的数组副本。剩下的就是添加传入的元素`U`:

```typescript
type Push<T extends unknown[], U> = [...T, U];
```

这样，我们就在类型系统中实现了一个 push 操作。

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 7
title: Readonly
lang: zh
level: easy
tags: built-in readonly object-keys
---

## 挑战

实现内置的`Readonly<T>`泛型而不使用它。

构造一个将`T`所有属性设置为`readonly`的类型，这意味着该类型的属性不可以重新赋值
。

例如：

```ts
interface Todo {
  title: string;
  description: string;
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar",
};

todo.title = "Hello"; // Error: cannot reassign a readonly property
todo.description = "barFoo"; // Error: cannot reassign a readonly property
```

## 解答

我们需要使对象中的所有属性都是只读的。因此，我们需要迭代所有的属性，并为它们添加
一个修饰符。

我们将在这里使
用[映射类型](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)，
很简单。对于该类型的每个属性，我们获取它的键并为其添加一个`readonly`修饰符：

```ts
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
```

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 18
title: Length of Tuple
lang: zh
level: easy
tags: tuple
---

## 挑战

对于给定的元组，你需要创建一个泛型`Length`类型，取得元组的长度。

例如：

```ts
type tesla = ["tesla", "model 3", "model X", "model Y"];
type spaceX = [
  "FALCON 9",
  "FALCON HEAVY",
  "DRAGON",
  "STARSHIP",
  "HUMAN SPACEFLIGHT"
];

type teslaLength = Length<tesla>; // expected 4
type spaceXLength = Length<spaceX>; // expected 5
```

## 解答

我们知道在 JavaScript 中可以使用属性`length`来访问数组的长度。我们也可以在类型上
做同样的事情:

```ts
type Length<T extends any> = T["length"];
```

但是按照这种方式，我们将得到编译错误“Type 'length' cannot be used to index type
'T'.”。所以我们需要给 TypeScript 一个提示，告知我们的输入类型参数有这个属性:

```ts
type Length<T extends { length: number }> = T["length"];
```

## 参考

- [Indexed Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 11
title: Tuple to Object
lang: zh
level: easy
tags: tuple
---

## 挑战

将给定的数组转换为对象类型，键/值必须在给定数组中。

例如：

```ts
const tuple = ["tesla", "model 3", "model X", "model Y"] as const;

// expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
const result: TupleToObject<typeof tuple>;
```

## 解答

我们需要从数组中获取所有的值，并将其作为新对象中的键和值。

这个使用索引类型很容易。我们可以通过使用`T[number]`从数组中获取值。在映射类型的
帮助下，我们可以迭代`T[number]`中的这些值，并返回一个新的类型，其中键和值
是`T[number]`的类型:

```ts
type TupleToObject<T extends readonly PropertyKey[]> = { [K in T[number]]: K };
```

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Indexed Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 3060
title: Unshift
lang: zh
level: easy
tags: array
---

## 挑战

实现类型版本`Array.unshift()`。

例如：

```typescript
type Result = Unshift<[1, 2], 0>; // [0, 1, 2]
```

## 解答

这个挑战和[Push challenge](./easy-push.md)有很多相似之处。在这里，我们使用可变元
组类型（Variadic Tuple Types）来获取数组中的所有元素。

这里我们做的差不多，但顺序不同。首先，让我们从传入的数组中获取所有元素:

```typescript
type Unshift<T, U> = [...T];
```

在这段代码中，我们得到了编译错误“A rest element type must be an array type”。让
我们通过在类型参数上添加一个约束来修正这个错误:

```typescript
type Unshift<T extends unknown[], U> = [...T];
```

现在，我们有了与传入的数组相同的数组。我们只需要在元组的开头添加一个元素。让我们
这样做:

```typescript
type Unshift<T extends unknown[], U> = [U, ...T];
```

这样，我们在类型系统中创建了一个“unshift”函数!

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 114
title: CamelCase
lang: zh
level: hard
tags: template-literal
---

## 挑战

将字符串转换为驼峰式。例如：

```typescript
type camelCased = CamelCase<"foo-bar-baz">; // expected "fooBarBaz"
```

## 解答

有一个常见的模式，我们可以用来推断字符串的连字符（-）部分。我们可以取得连字符
（-）之前的部分-头部，和连字符（-）之后的部分-尾部。让我们来推断这些部分。

```typescript
type CamelCase<S> = S extends `${infer H}-${infer T}` ? never : never;
```

如果没有这种模式呢？我们返回输入的字符串，不做任何更改。

```typescript
type CamelCase<S> = S extends `${infer H}-${infer T}` ? never : S;
```

但是如果有这样的模式，我们需要删除连字符并将尾部首字母大写。另外，我们不会忘记可
能还有其他子字符串需要处理，所以我们递归地处理。

```typescript
type CamelCase<S> = S extends `${infer H}-${infer T}`
  ? `${H}${CamelCase<Capitalize<T>>}`
  : S;
```

现在的问题是我们不处理尾部已经首字母大写的情况。我们可以通过检查尾部首字母是否大
写来解决这个问题。

```typescript
type CamelCase<S> = S extends `${infer H}-${infer T}`
  ? T extends Capitalize<T>
    ? never
    : `${H}${CamelCase<Capitalize<T>>}`
  : S;
```

如果我们得到首字母大写的尾部，我们会怎么做? 我们需要保留连字符，跳过这个。当然，
我们也需要递归。

```typescript
type CamelCase<S> = S extends `${infer H}-${infer T}`
  ? T extends Capitalize<T>
    ? `${H}-${CamelCase<T>}`
    : `${H}${CamelCase<Capitalize<T>>}`
  : S;
```

我们得到了一个可以“驼峰式”模板的字面量类型，很好!

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
title: Type Challenges Solutions
description: >-
  该项目旨在帮助您更好地理解类型系统是如何工作的，编写自己的实用工具，或者只是为了享受挑战。
keywords: "type, challenges, solutions, typescript, javascript"
lang: zh
comments: false
---

什么是 Type Challenges?
[Type Challenges](https://github.com/type-challenges/type-challenges) 是一个
由[Anthony Fu](https://github.com/antfu)开发和维护的项目。该项目的主要目标是收集
并提供有趣的 TypeScript 挑战。这些挑战不能使用运行时，必须通过使用 TypeScript 类
型系统才能解出。

这些挑战有时会很困难，尤其是如果你是类型和 TypeScript 的初学者。

所以，这个网站提供了一个地方，在那里你可以找到解出这些挑战的方法，并解释它们是如
何被解出的。如果想更深入地研究，可以阅读下方提供的参考资料。如果你通过其它方式解
出了这个挑战(不同于本网站)，你可以在评论中留言。

如果你有任何疑问或发现问题，请在本仓
库[提交一个 issue](https://github.com/ghaiklor/type-challenges-solutions/issues)。

现在，我建议你从"热身"开始，逐渐地向"很难"级别前进。首先，打开"挑战"链接并尝试自
己解出。如果你无法解出，请返回此处并打开"解答"。

事不宜迟，慢慢来，享受挑战！

{% assign challenges = site.pages | where: "lang", "zh" %}
{% include challenges.html challenges = challenges %}
<div STYLE="page-break-after: always;"></div>---
id: 529
title: Absolute
lang: zh
level: medium
tags: math template-literal
---

## 挑战

实现`Absolute`类型。该类型接受一个`string`,`number`或`bigint`类型，返回值是一个
正数的字符串形式。

例如:

```typescript
type Test = -100;
type Result = Absolute<Test>; // expected to be "100"
```

## 解答

获得一个数字的绝对值最简单的方法是将其转换为字符串并去掉“-”号。我不是在开玩笑，
只是去掉“-”号。

我们可以通过检查该类型模板字面量中是否含有“-”号来处理。如果有，则推断出没有“-”号
的部分，否则返回类型本身：

```typescript
type Absolute<T extends number | string | bigint> = T extends `-${infer N}`
  ? N
  : T;
```

因此，如果我们给定类型`T = “-50”`，它将匹配到`“-<N>”`，其中`N`恰好就是“50”。这就
是它的工作原理。

现在，我们可以看到一些测试仍然失败。这是因为我们并不是每次都返回字符串。当提供一
个正数时，它将不会匹配到字面量并返回数字，但是我们需要返回的是字符串。

让我们通过将`T`包装在字面量类型中来解决这个问题：

```typescript
type Absolute<T extends number | string | bigint> = T extends `-${infer N}`
  ? N
  : `${T}`;
```

尽管如此，一些测试还是失败了。我们没有处理`T`为负数（number）的情况。数字
（number）不会匹配到该字面量条件类型，所以它会将负数作为字符串返回。为了克服这个
问题，我们可以将数字转换为字符串：

```typescript
type Absolute<T extends number | string | bigint> = `${T}` extends `-${infer N}`
  ? N
  : `${T}`;
```

结果，我们得到了一个接受任意`number`, `string`, `bigint`类型并将其转换为字符串。
然后推导出没有“-”号的数字并返回，或者只是返回没有更改的字符串。

## 参考

- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 949
title: AnyOf
lang: zh
level: medium
tags: array
---

## 挑战

在类型系统实现类似于 Python 的 `any` 函数。这个类型接受一个数组，如果数组中的任
一元素为真，则类型返回 `true`。如果数组为空，则返回 `false`。例如：

```typescript
type Sample1 = AnyOf<[1, "", false, [], {}]>; // expected to be true
type Sample2 = AnyOf<[0, "", false, [], {}]>; // expected to be false
```

## 解答

看到这个挑战后，我第一个想法是使用
[distributive conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types).

我们可以使用 `T[number]` 语法来获取一个元组中所有元素组成的联合。有了这元素组成
的联合后，我们对它进行迭代，得出一个 `false` 或 `true` 联合。如果所有元素都返回
`false`，我们会得出 `false` 的类型字面量。但是，即使只有一个 `true`-y 元素，结果
也就产生了 `true` 的类型字面量。因此，`false` 和 `true` 类型字面量构成了我们的联
合类型，其产出则是 `boolean`。通过检查联合类型的产出与 `false` 类型字面量之间的
继承关系，以判断是否存在 `true` 元素。

但是，这个实现被证明是非常古怪的。我不喜欢它，看一看：

```typescript
type AnyOf<T extends readonly any[], I = T[number]> = (
  I extends any ? (I extends Falsy ? false : true) : never
) extends false
  ? false
  : true;
```

所以我开始思考，我们是否可以让它更易于维护呢？事实证明我们可以。让我们回忆一下从
元组类型中推断与可变元组类型相结合的情况。记得我们在解 [Last](./medium-last.md)
挑战或 [Pop](./medium-pop.md) 之类的问题时使用过这些。

我们从推断元组中的单一元素开始，并推断族中其余的元素：

```typescript
type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? never
  : never;
```

我们如何检查推断的元素 `H` 是否为 false-y？首先，我们可以构造一个表示 false-y 的
类型。我们称它为 `Falsy`：

```typescript
type Falsy = 0 | "" | false | [] | { [P in any]: never };
```

有了一个表示 falsy-y 值的类型，我们可以只使用条件类型来检查 `H` 是否从该类型中扩
展：

```typescript
type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? H extends Falsy
    ? never
    : never
  : never;
```

如果元素是 false-y，我们该怎么做？这意味着，我们仍在试图检查是否至少有一个
true-y 元素。所以我们可以继续递归：

```typescript
type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? H extends Falsy
    ? AnyOf<T>
    : never
  : never;
```

最后，一旦我们看到有元素不是 false-y，就意味着它是 true-y。由于我们已经知道存在
true-y 元素，因此继续递归就没有意思了。所以我们只需要通过返回 `true` 类型字面量
来退出递归：

```typescript
type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? H extends Falsy
    ? AnyOf<T>
    : true
  : never;
```

最后的状态是当我们有一个空元组时。在这种情况下，我们的推断将不起作用，这意味着绝
对没有 true-y 元素。在这种情况下，我们可以返回 `false`。

```typescript
type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? H extends Falsy
    ? AnyOf<T>
    : true
  : false;
```

这就是我们在类型系统中实现的 `AnyOf` 函数的方式。以下是整个实现，供参考：

```typescript
type Falsy = 0 | "" | false | [] | { [P in any]: never };

type AnyOf<T extends readonly any[]> = T extends [infer H, ...infer T]
  ? H extends Falsy
    ? AnyOf<T>
    : true
  : false;
```

## 参考

- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 191
title: Append Argument
lang: zh
level: medium
tags: arguments
---

## 挑战

对于给定的函数类型`Fn`和任何类型`A`（在此上下文中,任何类型意味着我们不限制类型，
并且我不考虑任何类型）创建一个将`Fn`作为第一个参数，`A`作为第二个参数的泛型函数
，将生成函数类型`G`，它与`Fn`相同，但附加参数`A`作为最后一个参数。

例如:

```ts
type Fn = (a: number, b: string) => number;

// 期待结果为 (a: number, b: string, x: boolean) => number
type Result = AppendArgument<Fn, boolean>;
```

## 解答

这是一个有趣的挑战, 其中包含了类型推断，可变元组类型，条件类型以及其他很多有趣的
东西。

让我们从推断函数参数及其返回类型开始, 条件类型将帮助我们完成这点。一旦类型被推断
出来，我们可以返回我们自己输入的函数签名，例如:

```ts
type AppendArgument<Fn, A> = Fn extends (args: infer P) => infer R
  ? (args: P) => R
  : never;
```

显然, 目前的答案还没达到我们想要的结果. 为什么呢? 因为我们检查了 `Fn` 是否可以赋
值给具有单个参数 `args` 的函数。这并不合理，我们可以有多个参数或没有参数的函数。

为了解决这个问题，我们可以使用展开参数：

```ts
type AppendArgument<Fn, A> = Fn extends (...args: infer P) => infer R
  ? (args: P) => R
  : never;
```

现在，条件类型中的条件求值为真，因此进入带有类型参数`P`（函数参数）和类型参
数`R`（返回类型）的`真`分支。虽然如此，目前方案还是有问题。类型参数 `P` 有一个带
有函数参数的元组，但我们需要将它们视为单独的参数。通过应用可变元组类型，我们可以
展开元组:

```ts
type AppendArgument<Fn, A> = Fn extends (...args: [...infer P]) => infer R
  ? (args: P) => R
  : never;
```

类型参数`P`有我们现在需要的。唯一剩下的事情就是从推断的类型中构造出新的函数签名:

```ts
type AppendArgument<Fn, A> = Fn extends (...args: [...infer P]) => infer R
  ? (...args: [...P]) => R
  : never;
```

我们有一个类型，它接受一个输入函数并返回一个具有推断类型的新函数。有了它，我们现
在可以将所需的 `A` 参数添加到参数列表中:

```ts
type AppendArgument<Fn, A> = Fn extends (...args: [...infer P]) => infer R
  ? (...args: [...P, A]) => R
  : never;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
- [Rest parameters in function type](https://www.typescriptlang.org/docs/handbook/2/functions.html#rest-parameters-and-arguments)
<div STYLE="page-break-after: always;"></div>---
id: 527
title: Append to Object
lang: zh
level: medium
tags: object-keys
---

## 挑战

实现一个向接口添加新字段的类型。该类型接受三个参数。输出应该是一个带有新字段的对
象。

例如：

```ts
type Test = { id: "1" };
type Result = AppendToObject<Test, "value", 4>; // expected to be { id: '1', value: 4 }
```

## 解答

当我们试图改变 TypeScript 中的对象接口时，通常交叉（intersection）类型会很有帮助
。这一挑战也不例外。我试着写了一个类型，它接受整个`T`和一个带有新属性的对象:

```typescript
type AppendToObject<T, U, V> = T & { [P in U]: V };
```

不幸的是，这个方案不能满足测试。它们期望的是一个普通（flat）类型而不是交叉
（intersection）类型。因此我们需要返回一个对象类型，其中包含所有属性和我们的新属
性。我将从映射`T`的属性开始:

```typescript
type AppendToObject<T, U, V> = { [P in keyof T]: T[P] };
```

现在，我们需要在`T`的属性中添加新属性`U`。这里有一个诀窍。没有什么可以阻止你将联
合传递给`in`操作符:

```typescript
type AppendToObject<T, U, V> = { [P in keyof T | U]: T[P] };
```

这样，我们就能得到`T`的所有属性加上属性`U`，这正是我们需要的。现在让我们通过
在`U`上添加一个约束来修复小错误:

```typescript
type AppendToObject<T, U extends string, V> = { [P in keyof T | U]: T[P] };
```

现在 TypeScript 唯一不能处理的是`P`可能不在`T`中，因为`P`是`T`和`U`的并集。我们
需要处理下这种情况，如果`P`来自于`T`，我们取`T[P]`，否则取`V`：

```typescript
type AppendToObject<T, U extends string, V> = {
  [P in keyof T | U]: P extends keyof T ? T[P] : V;
};
```

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
<div STYLE="page-break-after: always;"></div>---
id: 3326
title: BEM Style String
lang: zh
level: medium
tags: template-literal union tuple
---

## 挑战

块（Block）、元素（Element）、修饰符（Modifier）方法（BEM）是 CSS 中类的一种流行
的命名规范。

例如，块组件将被表示为 `btn`，依赖于块的元素将被表示为 `btn_price`，变更块的样式
的修饰符将被表示为 `btn--big` 或 `btn__price-warning`。

实现 `BEM<B, E, M>`，从这三个参数生成字符串联合。其中 `B` 是一个字符串字面量
，`E` 和 `M` 是字符串数组（可以为空）。

## 解答

在这个挑战中，我们被要求按照规则来制作一个特定的字符串。我们必须遵循 3 条规则：
块、元素和修饰符。为了简化解决方案的整体外观，我提议将它们分为三个独立的类型。

我们从第一条开始 - 块（Block）：

```typescript
type Block<B extends string> = any;
```

这个很简单，因为我们需要做的只是返回一个包含输入类型参数的模板字符量类型：

```typescript
type Block<B extends string> = `${B}`;
```

下一个是元素（Element）。它不像块一那样是一个模板字面量类型，因为有一种情况，即
元素数组是空的。所以我们需要检查数组是不回为空，如果是，就构造一个字符串。由于知
道空数组作为 `T[number]` 访问时会返回 `never` 类型，我们可以使用一个条件类型来检
查它：

```typescript
type Element<E extends string[]> = E[number] extends never ? never : never;
```

如果元素数组是空的，我们只需要返回一个空的字符串字面是不是类型（不需要一个字符串
前缀 `__`）：

```typescript
type Element<E extends string[]> = E[number] extends never ? `` : never;
```

一旦我们知道一个数组不是空的，我们需要添加一个前缀 `__`，然后在一个模板字面量类
型中组合这些元素：

```typescript
type Element<E extends string[]> = E[number] extends never
  ? ``
  : `__${E[number]}`;
```

同样的逻辑我们也适用于最后一个 -- 修饰符（Modifier）。如果带有修饰符的数组是空的
，就返回空的字符串字面量类型。否则，返回一个带有修饰符的联合的前缀：

```typescript
type Modifier<M extends string[]> = M[number] extends never
  ? ``
  : `--${M[number]}`;
```

剩下的就是在我们的初始类型中结合这三个类型：

```typescript
type BEM<
  B extends string,
  E extends string[],
  M extends string[]
> = `${Block<B>}${Element<E>}${Modifier<M>}`;
```

完整的解答，包括所有 4 个类型，像这样：

```typescript
type Block<B extends string> = `${B}`;
type Element<E extends string[]> = E[number] extends never
  ? ``
  : `__${E[number]}`;
type Modifier<M extends string[]> = M[number] extends never
  ? ``
  : `--${M[number]}`;
type BEM<
  B extends string,
  E extends string[],
  M extends string[]
> = `${Block<B>}${Element<E>}${Modifier<M>}`;
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 110
title: Capitalize
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `Capitalize<T>` 将字符串的第一个字母转换为大写，其余部分保持原样。

例如：

```ts
type capitalized = Capitalize<"hello world">; // expected to be 'Hello world'
```

## 解答

起初，我并不明白这个挑战。我们无法为字符串字面量实现字符大写的通用解答。因此，如
果使用内置的 `Capitalize` 类型，就很直接了当了：

```ts
type MyCapitalize<S extends string> = Capitalize<S>;
```

我相信，这不是本意。我们不能使用内置的 `Capitalize` 类型，我们也无法实现通用的解
答。没有这些，我们怎么能让字符大写呢？当然，使用字典！

为了使解答更简单，我只为需要的字符制作了一个字典，即 `f`：

```ts
interface CapitalizedChars {
  f: "F";
}
```

现在，我们有了一个字典，让我们来推断类型的第一个字符。我们使用经典的条件类型来构
造并推断：

```ts
type Capitalize<S> = S extends `${infer C}${infer T}` ? C : S;
```

现在类型参数 `C` 有了第一个字符。我们需要检查这个字符是否存在于我们的字典中。如
果是，我们从字典中返回大写的字符，否则我们返回第一个字符且不做任何变更。

```ts
interface CapitalizedChars {
  f: "F";
}
type Capitalize<S> = S extends `${infer C}${infer T}`
  ? `${C extends keyof CapitalizedChars ? CapitalizedChars[C] : C}${T}`
  : S;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
- [keyof and Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
<div STYLE="page-break-after: always;"></div>---
id: 12
title: Chainable Options
lang: zh
level: medium
tags: application
---

## 挑战

在 JavaScript 中我们通常会使用到可串联（Chainable/Pipline）的函数构造一个对象，
但在 TypeScript 中，你能合理的给它附上类型吗？

在这个挑战中，你可以使用任何你喜欢的方式实现这个类型 -- Interface, Type 或 Class
都行。你需要提供两个函数 `option(key, value)` 和 `get()`。在 `option` 中你需要使
用提供的 key 和 value 来扩展当前的对象类型，通过 `get()` 获取最终结果。

例如：

```ts
declare const config: Chainable;

const result = config
  .option("foo", 123)
  .option("name", "type-challenges")
  .option("bar", { value: "Hello World" })
  .get();

// expect the type of result to be:
interface Result {
  foo: number;
  name: string;
  bar: {
    value: string;
  };
}
```

你只需要在类型层面实现这个功能，不需要实现任何 JS/TS 的实际逻辑。

你可以假设 `key` 只接受字符串而 `value` 接受任何类型，你只需要暴露它传递的类型而
不需要进行任何处理。同样的 `key` 只会被使用一次。

## 解答

这是一个非常有趣的挑战，并且在现实世界中也实际使用。就我个人而言，我在实现不同的
Builder 模式时经常使用它。

作者要求我们做什么？我们需要实现两个方法 `options(key, value)` 和 `get()`。每次
调用 `option(key, value)` 都必须在某处累加 `key` 和 `value` 的类型信息。累加操作
必须持续进行，直到调用 `get` 函数将累加的信息作为一个对象类型返回。

让我们从作者提供的接口开始：

```ts
type Chainable = {
  option(key: string, value: any): any;
  get(): any;
};
```

在我们开始累加类型信息前，如果能先得到它，那就太好了。所以我们把 `key` 的
`string` 和 `value` 的 `any` 替换成类型参数，以便 TypeScript 可以推断出它们的类
型并将其分配给类型参数：

```ts
type Chainable = {
  option<K, V>(key: K, value: V): any;
  get(): any;
};
```

很好！我们现在有了关于 `key` 和 `value` 的类型信息。 TypeScript 会将 `key` 推断
为字符串字面量类型，而将 `value` 推断为常见的类型。例如，调用
`option('foo', 123)` 将得出的类型为：`key = 'foo'` 和 `value = number`。

我们有了信息后，把它存储在哪里呢？它必须是一个在若干次方法调用中保持其状态的地方
。唯一的地方便是 `Chainable` 类型本身！

让我们为 `Chainable` 类型添加一个新的类型参数 `O`，并且不能忘记默认它是一个空对
象。

```ts
type Chainable<O = {}> = {
  option<K, V>(key: K, value: V): any;
  get(): any;
};
```

现在最有趣的部分来了，注意！我们希望 `option(key, value)` 返回 `Chainable` 类型
本身（我们希望有可能进行链式调用，对吧），但是要将类型信息累加到其类型参数中。让
我们使用
[intersection types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
将新的类型添加到累加器中：

```ts
type Chainable<O = {}> = {
  option<K, V>(key: K, value: V): Chainable<O & { [P in K]: V }>;
  get(): any;
};
```

还有一些小事情。我们收到编译错误 "Type ‘K’ is not assignable to type ‘string |
number | symbol’."。这是因为我们没有约束类型参数 `K`，即它必须是一个 `string`；

```ts
type Chainable<O = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<O & { [P in K]: V }>;
  get(): any;
};
```

一切都准备好了！现在，当开发人员调用 `get()` 函数时，它必须从 `Chainable` 返回类
型参数 `O`，该参数有之前的 `option(key, value)` 数次调用后累加的类型信息：

```ts
type Chainable<O = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<O & { [P in K]: V }>;
  get(): O;
};
```

## 参考

- [Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
<div STYLE="page-break-after: always;"></div>---
id: 4499
title: Chunk
lang: zh
level: medium
tags: tuple
---

## 挑战

你知道 `lodash` 吗？ `Chunk` 是其中一个非常有用的函数，现在我们来实现它。
`Chunk<T, N>` 接受两个必要类型参数，`T` 必须是一个元组，`N` 必须是大于等于 1 的
整型。比如说：

```typescript
type R0 = Chunk<[1, 2, 3], 2>; // expected to be [[1, 2], [3]]
type R1 = Chunk<[1, 2, 3], 4>; // expected to be [[1, 2, 3]]
type R2 = Chunk<[1, 2, 3], 1>; // expected to be [[1], [2], [3]]
```

## 解答

这个挑战是个难题。但最后，依我看，我终于找到了一个很容易的解答。我们从一个声明契
约的初始类型开始：

```typescript
type Chunk<T, N> = any;
```

因为我们需要积累元组的块，所以有一个可选类型参数 `A` 来积累大小为 `N` 的块似乎是
合理的。默认情况下，类型参数 `A` 将是一个空元组：

```typescript
type Chunk<T, N, A extends unknown[] = []> = any;
```

有一个空的累加器，我们将用于一个临时的大块，我们可以开始将 `T` 分割成若干部分。
这些部分是元组的第一个元素和剩余的部分：

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? never
  : never;
```

有部分元组 `T`，我们可以检查累加器的大小是否符合要求。为了达到这个目的，我们在其
类型上查询 `length` 属性。这有效，因为我们对类型参数 `A` 有一个通用约束，它表示
一个元组。

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? never
    : never
  : never;
```

如果我们的累加器是空的或没有足够的项目，我们需要继续切分 `T` 直到累加器达到所需
要的大小。为了做到这一点，我们继续递归地调用 `Chunk` 类型，并建产一个新的累加器
。在这个累加器中，我们推送之前的 `A` 和 `T` 中的项目 `H`。

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? never
    : Chunk<T, N, [...A, H]>
  : never;
```

递归调用继续进行，直到我们得到一种情况，即累加器的大小达到了所需的 `N`。这正是我
们的累加器 `A` 中的所有所有元素都有适当大小的情况下。这是我们需要存储在结果中的
第一个块。所以我们返回一个新的元组，其中包含累加器：

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A]
    : Chunk<T, N, [...A, H]>
  : never;
```

这样做，我们忽略了其余的元组 `T`。所以我们需要对我们的结果 `[A]` 增加一个递归调
用，以清除累加器并重新开始同样的过程：

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A, Chunk<T, N>]
    : Chunk<T, N, [...A, H]>
  : never;
```

这个递归魔法一直持续到我们得到元组 `T` 中没有更多元素的情况。在这种情况下，我们
只需返回累加器中剩余的任何元素。这样做的原因是，我们可能会遇到累加器的大小小于
`N` 的情况。所以在这种情况下不返回累加器就意味着失去了这些项目。

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A, Chunk<T, N>]
    : Chunk<T, N, [...A, H]>
  : [A];
```

还有一种情况是我们失去了 `H` 的元素。这种情况是我们得到了所需大小的累加器，但忽
略了推断出的 `H`。我们的块失去了一些元素，这是不对的。为了解决这个问题，我们需要
在有一个大小为 `N` 的累加器时不要忘记 `H` 元素：

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A, Chunk<[H, ...T], N>]
    : Chunk<T, N, [...A, H]>
  : [A];
```

这个解答解决了一些情况，这很棒。然而，我们有一种情况，即对 `Chunk` 类型的递归调
用返回元组中的元组（因为递归调用）。为了克服这个问题，让我们给我们的
`Chunk<[H, ...T], N>` 添加一个展开。

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A, ...Chunk<[H, ...T], N>]
    : Chunk<T, N, [...A, H]>
  : [A];
```

所以有的测试案例都通过了！哈哈...除了一个空元组的边缘案例。只是一个边缘案例，我
们可以添加条件类型来检查它。如果累加器在基本情况下变成了空的，我们就返回一个空元
组。否则，我们返回基本情况下的累加器：

```typescript
type Chunk<T, N, A extends unknown[] = []> = T extends [infer H, ...infer T]
  ? A["length"] extends N
    ? [A, ...Chunk<[H, ...T], N>]
    : Chunk<T, N, [...A, H]>
  : A[number] extends never
  ? []
  : [A];
```

这就是我们在类型系统中实现的 lodash 版本的 `.chunk()` 函数所需要的全部内容！

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
- [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 9
title: Deep Readonly
lang: zh
level: medium
tags: readonly object-keys deep
---

## 挑战

实现一个通用的 `DeepReadonly<T>` 以递归的方式只读化（`readonly`）对象及其子对象
的每个属性。

你可以假设在这个挑战中我们只处理对象。无需要考虑数组、函数、类等。但是，你仍然可
以通过尽可能多的覆盖不同的案例来挑战自己。

例如：

```ts
type X = {
  x: {
    a: 1;
    b: "hi";
  };
  y: "hey";
};

type Expected = {
  readonly x: {
    readonly a: 1;
    readonly b: "hi";
  };
  readonly y: "hey";
};

const todo: DeepReadonly<X>; // should be same as `Expected`
```

## 解答

在这个挑战中，我们需要创建相同的 [`Readonly<T>`](./easy-readonly.md) 类型。唯一
的区别是我们需要使它递归化。

让我们从经典开始，实现常规的 [`Readonly<T>`](./easy-readonly.md) 类型：

```ts
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] };
```

但是，正如你已经知道的，这个类型不会将所有内容都设为只读，仅是没有深度的字段。原
因是当我们的 `T[P]` 不是原始类型，而是一个对象时，它会按原样传递它，且不会将其属
性设为只读。

因此，我们需要将 `T[P]` 替换为 `DeepReadonly<T>` 的递归用法。不过，在使用递归时
不要忘记基本情况。

算法很简单。如果 `T[P]` 是一个对象，我们继续调用 `DeepReadonly`，否则返回 `T[P]`

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Record<string, unknown>
    ? DeepReadonly<T[P]>
    : T[P];
};
```

## 参考

- [Index Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 645
title: Diff
lang: zh
level: medium
tags: object
---

## 挑战

获取两个接口类型中的差值属性。

例如：

```typescript
type Foo = {
  name: string;
  age: string;
};

type Bar = {
  name: string;
  age: string;
  gender: number;
};

type test0 = Diff<Foo, Bar>; // expected { gender: number }
```

## 解答

这个挑战要求我们基于对象进行操作。所以有极大可能，映射类型可以发挥作用。

让我们从映射类型开始，在这里我们迭代两个对象的属性联合（union）。毕竟在计算差值
之前，我们需要收集两个对象的所有属性。

```typescript
type Diff<O, O1> = { [P in keyof O | keyof O1]: never };
```

当我们遍历这些属性的时候，我们需要检查这个属性是否存在于`O` 或者 `O1`。所以我们
在这里需要添加一个条件类型来找出我们需要从哪里获取值类型。

```typescript
type Diff<O, O1> = {
  [P in keyof O | keyof O1]: P extends keyof O
    ? O[P]
    : P extends keyof O1
    ? O1[P]
    : never;
};
```

太棒了！我们得到了一个对象，它是两个对象所有属性的联合。剩下的最后一件事是过滤掉
那些在两个对象上都存在的属性。

我们如何获得两个对象上存在的所有属性呢？交叉类型！我们先获取交叉类型，然后把它从
我们的映射类型`P`中剔除

```typescript
type Diff<O, O1> = {
  [P in keyof O | keyof O1 as Exclude<P, keyof O & keyof O1>]: P extends keyof O
    ? O[P]
    : P extends keyof O1
    ? O1[P]
    : never;
};
```

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Key remapping in Mapped Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Index Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [keyof and Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
<div STYLE="page-break-after: always;"></div>---
id: 2070
title: Drop Char
lang: zh
level: medium
tags: template-literal infer
---

## 挑战

从字符串中剔除指定字符。

例如：

```typescript
type Butterfly = DropChar<" b u t t e r f l y ! ", " ">; // 'butterfly!'
```

## 解答

为了解决这个问题，我们需要了解模板字面量类型。你可以
在`TypeScript Handbook`中[了解更多](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)。

使用模板字面量类型时，我们可以从字符串中推断所需的部分，并检查其是否是我们期望的
部分。让我们从最简单的情况开始 - 推断字符串的左侧部分和右侧部分。它们之间的分隔
符是所需的字符本身。

```typescript
type DropChar<S, C> = S extends `${infer L}${C}${infer R}` ? never : never;
```

使用这样的表示方法，我们会得到一个编译错
误`Type ‘C’ is not assignable to type ‘string | number | bigint | boolean | null | undefined’.`添
加一个泛型约束去修复它。

```typescript
type DropChar<S, C extends string> = S extends `${infer L}${C}${infer R}`
  ? never
  : never;
```

现在我们有了左右两部分以及字符`C`。由于我们需要删除`C`，因此我们返回没有它的左右
部分。

```typescript
type DropChar<S, C extends string> = S extends `${infer L}${C}${infer R}`
  ? `${L}${R}`
  : never;
```

这样我们就将目标字符从字符串中剔除了，为了删除其他部分含有的目标字符，我们需要递
归地调用该类型。

```typescript
type DropChar<S, C extends string> = S extends `${infer L}${C}${infer R}`
  ? DropChar<`${L}${R}`, C>
  : never;
```

我们涵盖了所有的情况，除了要剔除的目标字符串为空, 这时我们将整个字符串返回即可。

```typescript
type DropChar<S, C extends string> = S extends `${infer L}${C}${infer R}`
  ? DropChar<`${L}${R}`, C>
  : S;
```

## 参考

- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 2693
title: EndsWith
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `EndsWith<T, U>` ，它接受两个字符串类型，并返回 `T` 是否以 `U` 结尾：

```typescript
type R0 = EndsWith<"abc", "bc">; // true
type R1 = EndsWith<"abc", "abc">; // true
type R2 = EndsWith<"abc", "d">; // false
```

## 解答

这个挑战属于中等难度，但我认为它不应该出现在这里。它更像一个简单难度的而不是中等
难度的。但是，我又有什么资格去评判。

我们需要检查字符串是否以特定的字符串结束。很明显模板字面量类型会很有用。

让我们从模板字面量类型开始，它可以包含任何字符串。目前，我们不关心内容，所以我们
在这里使用 `any` 类型：

```typescript
type EndsWith<T extends string, U extends string> = T extends `${any}`
  ? never
  : never;
```

在这个语句中，我们说“嘿，编译器，检查字面量类型 `T` 是否从 `any` 类型扩展的”。结
果为真，它是扩展的。

现在，让我们添加一个需要检查的子字符串。我们通过类型参数 `U` 传递子字符串，我们
需要检查它是否在字符串的结尾。就这样：

```typescript
type EndsWith<T extends string, U extends string> = T extends `${any}${U}`
  ? never
  : never;
```

通过使用这样的结构，我们检查字符串是否从 `any` 扩展，以 `U` 结尾。简单，剩下的就
是根据结果返回布尔类型。

```typescript
type EndsWith<T extends string, U extends string> = T extends `${any}${U}`
  ? true
  : false;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 459
title: Flatten
lang: zh
level: medium
tags: array
---

## 挑战

在这个挑战中，你需要编写一个接受数组并返回展平数组类型的泛型函数, 例如:

```ts
type flatten = Flatten<[1, 2, [3, 4], [[[5]]]> // [1, 2, 3, 4, 5]
```

## 解答

该挑战的基本用例是一个空数组的情况。当我们输入一个空数组时，我们返回一个空数组，
反正它已经被展平了。否则，返回`T` 本身:

```typescript
type Flatten<T> = T extends [] ? [] : T;
```

但是，如果 `T` 不是一个空数组，这意味着我们有一个包含元素的数组或元素本身。当它
是一个包含元素的数组时，我们需要做什么？我们需要从它和尾部推断出其中一项。现在，
我们可以只返回推断的项:

```typescript
type Flatten<T> = T extends []
  ? []
  : T extends [infer H, ...infer T]
  ? [H, T]
  : [T];
```

顺便说一句，请注意`T`不是带有元素的数组的情况。这意味着它根本不是一个数组，因此
我们将其视为元素本身并包裹在一个数组中返回。

知道了我们数组的头部和尾部，我们可以一次又一次地递归调用`Flatten`并将这些推断出
的项作为参数传过去。这样，我们将每一项展平，直到它不是数组并返回`[T]`该项本身：

```typescript
type Flatten<T> = T extends []
  ? []
  : T extends [infer H, ...infer T]
  ? [...Flatten<H>, ...Flatten<T>]
  : [T];
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 3196
title: Flip Arguments
lang: zh
level: medium
tags: array
---

## 挑战

在类型系统中实现 Lodash 的 `_.flip` 方法。

类型 `FlipArguments<T>` 需接收函数类型 `T` 并返回新的函数类型。新函数类型应与
`T` 的返回类型相同，但函数参数是倒序的。

例如：

```ts
type Flipped = FlipArguments<
  (arg0: string, arg1: number, arg2: boolean) => void
>;
// (arg0: boolean, arg1: number, arg2: string) => void
```

## 解答

这个挑战的解法并不复杂。首先我们需要判断类型 `T` 是否为函数类型；如果是，则仅需
翻转函数的参数类型，即可完成挑战。

```ts
type FlipArguments<T> = T extends (...args: [...infer P]) => infer R
  ? never
  : never;
```

在上述代码中，我们从函数类型中获取参数类型，记为 `P`；同时获取返回类型，记为
`R`。接下来我们翻转参数，并保持最终的函数返回类型为 `R`：

```ts
type MyReverse<T extends unknown[]> = T extends [...infer F, infer S]
  ? [S, ...MyReverse<F>]
  : [];

type FlipArguments<T> = T extends (...args: [...infer P]) => infer R
  ? (...args: MyReverse<P>) => R
  : never;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 4179
title: Flip
lang: zh
level: medium
tags: object-keys
---

## 挑战

在类型系统中实现 `翻转对象的键与值`，例如：

```ts
Flip<{ a: "x"; b: "y"; c: "z" }>; // {x: 'a', y: 'b', z: 'c'}
Flip<{ a: 1; b: 2; c: 3 }>; // {1: 'a', 2: 'b', 3: 'c'}
Flip<{ a: false; b: true }>; // {false: 'a', true: 'b'}
```

在这个挑战中，我们不需要处理对象嵌套的情况，也不需要处理原对象值（如数组）不能用
作新对象键的情况。

## 解答

我们先来实现第一步，把原对象的键用作新对象的值：

```ts
type Flip<T> = { [P in keyof T]: P };
// {key: key, ...}
```

接下来，我们只需要把新对象的键改成原对象的值即可完成挑战。这里我们需要使用
[“as” 语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)：

```ts
type Flip<T> = {
  [P in keyof T as T[P] extends AllowedTypes ? T[P] : never]: P;
};
// {value: key, ...}
```

这里 `AllowedTypes` 需包含可用作对象键的所有类型。根据题目的测试用例，我们需要包
含 `string`、`number` 和 `boolean`：

```ts
type AllowedTypes = string | number | boolean;
```

但目前我们还不能通过测试，因为在这个挑战中，新对象的键只能为字符串。因此我们只需
要把 `T[P]` 转成字符串即可：

```ts
type Flip<T> = {
  [P in keyof T as T[P] extends AllowedTypes ? `${T[P]}` : never]: P;
};
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Key remapping in mapped types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 3376
title: InOrder Traversal
lang: zh
level: medium
tags: object-keys
---

## 挑战

实现类型版本的二叉树按顺序遍历。例如：

```typescript
const tree1 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: {
      val: 3,
      left: null,
      right: null,
    },
    right: null,
  },
} as const;

type A = InOrderTraversal<typeof tree1>; // [1, 3, 2]
```

## 解答

在二叉树的有序遍历中，我们遍历一个节点的子树，然后“访问”这个节点，然后遍历它的另
一个子树。通常，我们会先遍历左子树，然后再遍历节点的右子树。

下面是二叉树按顺序遍历的伪代码：

```text
procedure in_order(p : reference to a tree node)
    if p !== null
        in_order(p.left)
        Visit the node pointed to by p
        in_order(p.right)
    end if
end procedure
```

下面是一个二叉树有序遍历示例：

```text
      A
    /   \
   B     C
 /   \
D     E

In-order Traversal: D, B, E, A, C
```

所以让我们先从实现伪代码开始。

```ts
type InOrderTraversal<T extends TreeNode | null> = T extends TreeNode
  ? never
  : never;
```

如果没有 `TreeNode`，则返回一个空数组。

```ts
type InOrderTraversal<T extends TreeNode | null> = T extends TreeNode
  ? never
  : [];
```

根据伪代码，我们递归遍历左子树直到碰到 `null`，这个时候，我们打印根节点并遍历右
子树。

我们先创建一个帮助类型，它将递归遍历一个节点，直到遇到 `null`时返回一个空数组。

```ts
type Traverse<F, S extends keyof F> = F[S] extends TreeNode
  ? InOrderTraversal<F[S]>
  : [];
```

最后，我们利用这个帮助类型完成挑战。

```ts
type InOrderTraversal<T extends TreeNode | null> = T extends TreeNode
  ? [...Traverse<T, "left">, T["val"], ...Traverse<T, "right">]
  : [];
```

## 参考

- [Binary Tree Traversal](https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 1042
title: IsNever
lang: zh
level: medium
tags: union utils
---

## 挑战

实现类型 `IsNever<T>`，该类型接受输入类型`T`。如果 T 的类型解析为`never`，请返
回`true`，否则返回`false`。

例如：

```typescript
type A = IsNever<never>; // expected to be true
type B = IsNever<undefined>; // expected to be false
type C = IsNever<null>; // expected to be false
type D = IsNever<[]>; // expected to be false
type E = IsNever<number>; // expected to be false
```

## 解答

这里最直观的解法是利用条件类型来检查该类型是否可以赋值给`never`

如果类型`T`可以赋值给`never`，返回`true`，否则返回`false`。

```typescript
type IsNever<T> = T extends never ? true : false;
```

遗憾的是，我们没有通过`never`本身的测试用例，这是为什么呢？

`never`类型表示从未出现的值的类型。`never`类型是 TypeScript 中任何其他类型的子类
型，因此可以将`never`类型赋值给任何类型。然而，没有类型是`never`的子类型，这意味
着除了`never`本身以外，不能将其他类型赋值给`never`。

这就引出了另一个问题：如果我们不能将除`never`外的其他类型赋值给`never`，那么我们
如何检查某类型是否可以赋值给`never`呢？

我们何不创建内部含有`never`的另外一种类型呢? 如果我们不是检查类型`T`能否赋值
给`never`，而是检查该类型能否赋值给包含`never`的元组类型呢?在这种情况下，在形式
上我们不会将任何类型赋值给`never`。

```typescript
type IsNever<T> = [T] extends [never] ? true : false;
```

有了上述名为`<IsNever>`的解决方案，我们可以通过测试并实现泛型类型来检查传入类型
是否为`never`。

## 参考

- [never type](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
<div STYLE="page-break-after: always;"></div>---
id: 1097
title: IsUnion
lang: zh
level: medium
tags: union
---

## 挑战

实现一个类型`IsUnion`，它接受输入类型`T`，并返回`T`是否解析为联合类型。

例如：

```typescript
type case1 = IsUnion<string>; // false
type case2 = IsUnion<string | number>; // true
type case3 = IsUnion<[string | number]>; // false
```

## 解答

当我看到这样的挑战时，我总是感到沮丧。因为没有通用的解决方案可以用来实现这样的类
型，也没有可以使用的内置类型或`intrinsic`。

这样我们就必须创造性地结合我们所掌握的知识，我们首先思考联合类型及其代表的含义。

当你指定一个普通类型，例如`string`，它将永远是字符串。但是，当你指定一个联合类型
时，例如`string | number`，你可以从中取得一组潜在的值。

普通类型并不能表示一组值，但联合类型可以。在普通类型上进行分布式迭代是没有意义的
，但对于联合来说是有意义的。

这就是我们如何检测一个类型是否为联合类型所依赖的关键区别。当对类型`T`（不是联合
类型）进行分布式迭代时，它没有任何改变。但是，如果`T`是联合类型的话，它的变化会
很大。

TypeScript 有一个很棒的类型特性——分布式条件类型。当你编写这样的构造
：`T extends string ? true : false`，其中`T`是一个适用于分布式条件类型的联合类型
。粗略地说，这看起来就像将条件类型应用于联合类型中的每个元素。

```typescript
type IsString<T> = T extends string ? true : false;

// For example, we provide type T = string | number
// It is the same as this
type IsStringDistributive = string extends string
  ? true
  : false | number extends string
  ? true
  : false;
```

你明白我的意思了吧?如果类型`T`是一个联合类型，通过使用分布式条件类型，我们可以分
离该联合类型并将其与输入类型`T`进行比较。如果`T`不是一个联合类型，那么在这种情况
下，二者是一样的。但是，当它是一个联合类型时，它们二者的结果就不一样了，因
为`string`不是由`string | number` 扩展而来，当然`number`也不是。

让我们动手实现这个类型吧!首先，我们将复制输入类型 T，这样就可以保留 m 没有经过任
何修改的输入类型`T`，稍后我们将对它们进行比较。

```typescript
type IsUnion<T, C = T> = never;
```

通过应用条件类型，我们得到了分布式语义。在条件类型的 true 分支中，我们将获取联合
类型中的每一项。

```typescript
type IsUnion<T, C = T> = T extends C ? never : never;
```

现在是最重要的部分——将每一项与原来的输入类型`T`进行比较。在没有应用分布式迭代的
情况下(`T`不是联合类型)，`[C]`与`[T]`是相同的，因此为`false`。否则，`T`是一个联
合类型，因此将应用分配式迭代，将联合类型中的单项与联合类型本身进行比较，因此
为`true`。

```typescript
type IsUnion<T, C = T> = T extends C ? ([C] extends [T] ? false : true) : never;
```

齐活儿!

为了更清楚地阐述，接下向你展示 `[C]` 和 `[T]` 在分布式条件类型中`true`分支中代表
什么。

当我们传入的不是联合类型时，例如`string`，它们包含相同的类型。意思是，它不是联合
类型，因此返回`false`。

```typescript
[T] = [string][C] = [string];
```

但是，如果我们传入一个联合类型，例如`string | number`，它们包含不同的类型。我们
的副本`C`保存了一个内部有联合类型的元组类型，而我们的`T`保存了一个内部元素是元组
类型的联合类（这要归功于分布条件类型），因此它是一个联合类型。

```typescript
[T] = [string] | [number]
[C] = [string | number]
```

## 参考

- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
- [Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-3.html#tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 5310
title: Join
lang: zh
level: medium
tags: array
---

## 挑战

在类型系统中实现 `Array.join` 。 `Join<T, U>` 接收一个数组 `T` 和一个分隔符 `U`
，并返回数组 `T` 中各元素与分隔符 `U` 连接后的结果。

例如：

```typescript
type Res = Join<["a", "p", "p", "l", "e"], "-">; // expected to be 'a-p-p-l-e'
type Res1 = Join<["Hello", "World"], " ">; // expected to be 'Hello World'
type Res2 = Join<["2", "2", "2"], 1>; // expected to be '21212'
type Res3 = Join<["o"], "u">; // expected to be 'o'
```

## 解答

乍一看，最简单的解决方案是枚举数组中的项并返回由其内容和分隔符组成的模板字符串类
型。

让我们从需要实现的空白类型开始：

```typescript
type Join<T, U> = any;
```

枚举数组的经典技巧是推断它的第一个元素和剩余元素，然后递归。让我们先添加推断逻辑
：

```typescript
type Join<T, U> = T extends [infer S, ...infer R] ? never : never;
```

这里我们推断了首个字符串元素（`S`）和剩余元素数组（`R`）。我们要如何处理推断出的
字符串呢？我们需要在它后面加上一个分隔符（来自类型参数`U`）。

```typescript
type Join<T, U> = T extends [infer S, ...infer R] ? `${S}${U}` : never;
```

有了这种类型，我们就可以在数组的第一个元素后添加分隔符。然后我们还需要递归连接数
组中剩余的元素，直至数组末尾。

```typescript
type Join<T, U> = T extends [infer S, ...infer R]
  ? `${S}${U}${Join<R, U>}`
  : never;
```

但是，当数组 `T` 中没有其他元素时，就会出现返回 `never` 的情况。在这种情况下，我
们应该返回一个空字符串，这样结果就是正常的字符串了。

```typescript
type Join<T, U> = T extends [infer S, ...infer R]
  ? `${S}${U}${Join<R, U>}`
  : "";
```

这似乎是一个可行的解决方案，但还存在一些编译器错误需要我们解决。第一个编译器错误
是
`Type 'S' is not assignable to type 'string | number | bigint | boolean | null | undefined'`
， 类型参数 `U` 也存在相同的错误。 我们可以给泛型加上类型约束来解决这个问题：

```typescript
type Join<T extends string[], U extends string | number> = T extends [
  infer S,
  ...infer R
]
  ? `${S}${U}${Join<R, U>}`
  : "";
```

上面的约束可以检查输入的类型参数是否符合我们的期望。但是我们推断的类型 `S` 和
`R` 还有编译错误，我们需要告诉编译器我们推断的这些类型是字符串：

```typescript
type Join<T extends string[], U extends string | number> = T extends [
  infer S extends string,
  ...infer R extends string[]
]
  ? `${S}${U}${Join<R, U>}`
  : "";
```

成功了，但是没有完全成功。。。我们得到的结果字符串尾部会多出一个不需要的分隔符。
参考下面例子的输入和结果：

```typescript
type R0 = Join<["a", "p", "p", "l", "e"], "-">;
// type R0 = "a-p-p-l-e-"
```

怎样将其移除呢？我们尝试将原来代码中直接拼接分隔符的逻辑，改为条件判断式的逻辑：

```typescript
type Join<T extends string[], U extends string | number> = T extends [
  infer S extends string,
  ...infer R extends string[]
]
  ? `${S}${R["length"] extends 0 ? never : never}${Join<R, U>}`
  : "";
```

我们通过查看剩余元素数组 `R` 的长度 `length` 属性来进行判断。如果其值为 0，那就
意味着剩余数组为空，我们就不需要分隔符：

```typescript
type Join<T extends string[], U extends string | number> = T extends [
  infer S extends string,
  ...infer R extends string[]
]
  ? `${S}${R["length"] extends 0 ? "" : never}${Join<R, U>}`
  : "";
```

剩余数组不为空的情况下，我们需要添加分隔符：

```typescript
type Join<T extends string[], U extends string | number> = T extends [
  infer S extends string,
  ...infer R extends string[]
]
  ? `${S}${R["length"] extends 0 ? "" : U}${Join<R, U>}`
  : "";
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
- [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 612
title: KebabCase
lang: zh
level: medium
tags: template-literal
---

## 挑战

将一个字符串转换为串式命名法（kebab-case）。例如：

```typescript
type kebabCase = KebabCase<"FooBarBaz">; // expected "foo-bar-baz"
```

## 解答

这个挑战与 ["CamelCase"](./hard-camelcase.md) 有很多共同之处。我们从类型推断开始
，我们需要知道首字母和剩下的尾部。

```typescript
type KebabCase<S> = S extends `${infer C}${infer T}` ? never : never;
```

一旦未匹配到就意味着我们全部转换完成。我们只需要原样返回输入的字符串。

```typescript
type KebabCase<S> = S extends `${infer C}${infer T}` ? never : S;
```

但是，一旦匹配到我们就需要处理 2 种情况。一种情况是没有首字母大写的尾部，一种情
况是有。为了检测这个，我们可以用内置类型 `Uncapitalize`。

```typescript
type KebabCase<S> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? never
    : never
  : S;
```

如果我们有非首字母大写的尾部怎么办？假设我们有 “Foo” 或 “foo”，我们将首字母变成
小写，尾部保持不变。不要忘了继续处理剩余的字符串。

```typescript
type KebabCase<S> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Uncapitalize<C>}${KebabCase<T>}`
    : never
  : S;
```

现在剩下的情况就是有首字母大写的尾部，比如“fooBar”。我们需要将首字母变小写，然后
是连字符（-），然后继续递归的处理尾部。我们不需要使尾部首字母小写的原因是因为
`Uncapitalize<C>` 始终会使它变小写。

```typescript
type KebabCase<S> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Uncapitalize<C>}${KebabCase<T>}`
    : `${Uncapitalize<C>}-${KebabCase<T>}`
  : S;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 15
title: Last of Array
lang: zh
level: medium
tags: array
---

## 挑战

实现一个通用的 `Last<T>`，它接受一个数组 `T` 并返回它的最后一个元素的类型。

例如：

```ts
type arr1 = ["a", "b", "c"];
type arr2 = [3, 2, 1];

type tail1 = Last<arr1>; // expected to be 'c'
type tail2 = Last<arr2>; // expected to be 1
```

## 解答

当你想从数组中获取最后一个元素时，你需要从头开始获取所有元素，直到找到最后一个元
素。这里提示使用
[variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)；
我们有一个数组，我们需要处理它的元素。

了解了可变元组类型，解答也就非常明显了。我们需要将数组中除最后一个元素的其余元素
排除出去。结合
[type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
可以很容易的推断出最后一个元素的类型了。

```ts
type Last<T extends any[]> = T extends [...infer X, infer L] ? L : never;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 5317
title: LastIndexOf
lang: zh
level: medium
tags: array
---

## 挑战

在类型系统中实现 `Array.lastIndexOf`。 `LastIndexOf<T, U>` 接收一个数组 `T` 和查
找项 `U` ，并且返回 `U` 在数组 `T` 中最后一次出现位置的索引，例如：

```typescript
type Res1 = LastIndexOf<[1, 2, 3, 2, 1], 2>; // 3
type Res2 = LastIndexOf<[0, 0, 0], 2>; // -1
```

## 解答

要找到元素在元组中最后一次出现位置的索引，只需要从右往左枚举元组项直至找到匹配项
。然后获取匹配项的索引。听起来很简单，让我们开始吧。

像往常一样，我们从一个空白类型开始:

```typescript
type LastIndexOf<T, U> = any;
```

在这个类型中，我们有 `T` 和 `U` 两个泛型，`T` 是元组，`U` 是我们要查找的项。让我
们从条件类型开始，我们将元组推断为两个部分。一部分是最后一项（`I`），另一部分是
前面的剩余项（`R`）：

```typescript
type LastIndexOf<T, U> = T extends [...infer R, infer I] ? never : never;
```

一旦我们推断出最右侧的项，我们就可以检查它是否和我们要查找的项相等。我们可以使用
一个内置的工具类型 `Equal` 来协助我们完成检查：

```typescript
type LastIndexOf<T, U> = T extends [...infer R, infer I]
  ? Equal<I, U> extends true
    ? never
    : never
  : never;
```

如果找到了匹配项意味着什么呢？意味着我们找到了要查找的项，但是如何获取其索引呢？
左侧剩余项元组的长度，正好就是我们需要的索引，是吗？所以我们使用左侧剩余项元组的
长度当做索引：

```typescript
type LastIndexOf<T, U> = T extends [...infer R, infer I]
  ? Equal<I, U> extends true
    ? R["length"]
    : never
  : never;
```

如果找不到匹配项，我们就继续递归寻找下去：

```typescript
type LastIndexOf<T, U> = T extends [...infer R, infer I]
  ? Equal<I, U> extends true
    ? R["length"]
    : LastIndexOf<R, U>
  : never;
```

最后，如果仍然没有找到匹配项，则返回 `-1` 作为答案：

```typescript
type LastIndexOf<T, U> = T extends [...infer R, infer I]
  ? Equal<I, U> extends true
    ? R["length"]
    : LastIndexOf<R, U>
  : -1;
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 5821
title: MapTypes
lang: zh
level: medium
tags: map object utils
---

## 挑战

实现类型 `MapTypes<T, R>`，将对象 `T` 中的类型转换成由类型 `R` 定义的类型，其结
构如下：

```typescript
type StringToNumber = {
  mapFrom: string; // value of key which value is string
  mapTo: number; // will be transformed for number
};
```

例如：

```typescript
type StringToNumber = { mapFrom: string; mapTo: number };
MapTypes<{ iWillBeANumberOneDay: string }, StringToNumber>; // gives { iWillBeANumberOneDay: number; }
```

注意用户可能提供类型的联合：

```typescript
type StringToNumber = { mapFrom: string; mapTo: number };
type StringToDate = { mapFrom: string; mapTo: Date };
MapTypes<{ iWillBeNumberOrDate: string }, StringToDate | StringToNumber>; // gives { iWillBeNumberOrDate: number | Date; }
```

如果该类型在映射中不存在，则保持原样：

```typescript
type StringToNumber = { mapFrom: string; mapTo: number };
MapTypes<
  { iWillBeANumberOneDay: string; iWillStayTheSame: Function },
  StringToNumber
>; // // gives { iWillBeANumberOneDay: number, iWillStayTheSame: Function }
```

## 解答

在这个挑战中，我们需要使用对象映射类型。我们需要枚举对象并将值类型从一个类型映射
到另一个。

让我们先从实现空白类型开始：

```typescript
type MapTypes<T, R> = any;
```

类型参数 `T` 是我们需要去映射的对象， 参数 `R` 表示其映射关系。我们先给映射类型
参数 `R` 增加泛型限制：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = any;
```

在实际进行映射之前，我们先从简单的映射类型复制输入类型 `T` 开始：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P];
};
```

现在，在“复制”对象类型的基础上，我们可以开始添加一些映射。根据挑战要求，首先我们
先检查值类型是否与 `mapFrom` 类型匹配：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P] extends R["mapFrom"] ? never : never;
};
```

在这种情况下我们有一个匹配，这意味着我们需要用 `mapTo` 的类型替换当前值类型：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P] extends R["mapFrom"] ? R["mapTo"] : never;
};
```

否则，如果没有匹配到，根据规则我们需要返回原类型：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P] extends R["mapFrom"] ? R["mapTo"] : T[P];
};
```

至此，我们通过了除了那个联合类型之外的所有的测试用例。在挑战说明中指出可能指定映
射为对象的联合类型。

因此，我们也需要对映射本身进行枚举。我们首先将 `R['mapTo']` 替换为条件类型
。Typescript 中的条件类型是可分发的（distributive），这意味着他会枚举联合类型中
的每个元素。然而，他作用于条件类型开始的类型。因此，我们以类型参数 `R` 开始，并
检查匹配的值类型：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P] extends R["mapFrom"]
    ? R extends { mapFrom: T[P] }
      ? never
      : never
    : T[P];
};
```

可分发（distributive）条件类型会对 `R` 进行枚举，如果有匹配到值类型 `T[P]`，则返
回对应的映射类型：

```typescript
type MapTypes<T, R extends { mapFrom: unknown; mapTo: unknown }> = {
  [P in keyof T]: T[P] extends R["mapFrom"]
    ? R extends { mapFrom: T[P] }
      ? R["mapTo"]
      : never
    : T[P];
};
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 599
title: Merge
lang: zh
level: medium
tags: object
---

## 挑战

将两个类型合并为一个新类型。第二个类型的键将覆盖第一个类型的键。

例如：

```typescript
type Foo = {
  a: number;
  b: string;
};

type Bar = {
  b: number;
};

type merged = Merge<Foo, Bar>; // expected { a: number; b: number }
```

## 解答

这个挑战让我想起了[“append to object”](./medium-append-to-object.md)。我们使用联
合操作符从对象和字符串中收集所有属性。

在这里，我们可以使用相同的技巧来收集两个对象的所有属性名称。因此，我们的映射类型
保存来自两个对象的属性:

```typescript
type Merge<F, S> = { [P in keyof F | keyof S]: never };
```

有了两个对象的属性名，我们就可以开始获取它们的值类型了。我们从 `S` 开始，因为它
具有更高的优先级，它可以覆盖 `F` 中的值类型。但我们还需要检查属性是否存在于 `S`
上:

```typescript
type Merge<F, S> = {
  [P in keyof F | keyof S]: P extends keyof S ? S[P] : never;
};
```

如果 `S` 中没有该属性，我们检查 `F` 上是否存在该属性，如果存在，我们从这里获得值
类型:

```typescript
type Merge<F, S> = {
  [P in keyof F | keyof S]: P extends keyof S
    ? S[P]
    : P extends keyof F
    ? F[P]
    : never;
};
```

这样我们就可以合并两个对象，并使 `S` 具有更高优先级。

## 参考

- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [keyof and Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 2793
title: Mutable
lang: zh
level: medium
tags: readonly object-keys
---

## 挑战

实现泛型 `Mutable<T>` ，使 `T` 中所有属性都是可变的。

比如：

```typescript
interface Todo {
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
}

// { title: string; description: string; completed: boolean; }
type MutableTodo = Mutable<T>;
```

## 解答

我认为这个挑战不应该属于中等类别。我毫无困难的解决了它。不管怎样，我们将解出所有
的挑战。

我们知道有一种类型在对象的属性上带有只读的修饰符。这个修饰符和我们之前
的[Readonly challenge](./easy-readonly.md)一样。然而，这次要求我们从类型中去掉该
修饰符。

让我们先从最简单的开始，使用映射类型原样复制这个类型：

```typescript
type Mutable<T> = { [P in keyof T]: T[P] };
```

现在它是带有只读修饰符的 `T` 的副本。我们怎样去掉他们呢？好吧，记得在上一次的挑
战中为了加上它们，我们只是把关键字 `readonly` 加到映射类型上：

```typescript
type Mutable<T> = { readonly [P in keyof T]: T[P] };
```

TypeScript 隐式地给 `readonly` 关键字加了一个 `+`，意思是我们向属性添加修饰符。
但在我们这个例子中，我们需要丢弃它，于是我们用 `-` 代替：

```typescript
type Mutable<T> = { -readonly [P in keyof T]: T[P] };
```

这样，我们实现了一种类型，可以从属性中丢弃只读修饰符。

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Mapping Modifiers](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers)
<div STYLE="page-break-after: always;"></div>---
id: 3
title: Omit
lang: zh
level: medium
tags: union built-in
---

## 挑战

实现内置的 `Omit<T, K>` 泛型而不使用它。通过从 `T` 中选取所有属性，然后删除 `K`
来构造一个类型。例如：

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyOmit<Todo, "description" | "title">;

const todo: TodoPreview = {
  completed: false,
};
```

## 解答

我们这里需要返回一个新的对象类型，但不指定键。显然，这提示我们需要在这里使
用[映射类型（mapped types）](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)。

我们需要映射对象的每个属性并构造一个新类型。让我们从基础开始，构建相同的对象：

```ts
type MyOmit<T, K> = { [P in keyof T]: T[P] };
```

在这里，我们遍历了 `T` 中的所有键，将其映射到类型 `P`，并使其成为新对象的键，同
时值为 `T[P]` 类型。

这样，我们就可以遍历所有的键，但是我们需要过滤掉那些我们不感兴趣的键。

为了实现这一点，我们可
以[使用 “as” 语法重新映射键类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types):

```ts
type MyOmit<T, K> = { [P in keyof T as P extends K ? never : P]: T[P] };
```

我们映射 `T` 的所有属性，如果属性在 `K` 联合中，我们返回 “never” 类型作为它的键
，否则返回键本身。这样，我们就可以过滤掉属性并获得所需的对象类型。

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Index Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Key remapping in mapped types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)
<div STYLE="page-break-after: always;"></div>---
id: 2595
title: PickByType
lang: zh
level: medium
tags: object
---

## 挑战

从 `T` 中选择一组类型可赋值给 `U` 的属性。例如:

```typescript
type OnlyBoolean = PickByType<
  {
    name: string;
    count: number;
    isReadonly: boolean;
    isEnable: boolean;
  },
  boolean
>; // { isReadonly: boolean; isEnable: boolean; }
```

## 解答

在这个挑战中，我们需要遍历对象，过滤出那些只可赋值给 `U` 的字段。很明显，我们确
实需要从映射类型开始。

我们从创建一个对象，复制对象 `T` 所有的键值开始：

```typescript
type PickByType<T, U> = { [P in keyof T]: T[P] };
```

首先，我们从 `T` 中获得所有的键，并对它们进行迭代。在每次迭代时，TypeScript 都会
将键赋值给类型 `P`。有了键，我们就可以通过查找类型 `T[P]` 来获取值类型。

现在，对迭代应用一个过滤器将允许我们只找到那些可赋值给 `U` 的。

当我说过滤器时，我指的是键的重新映射。我们可以利用它检查该键是否是我们需要的键:

```typescript
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : never]: T[P];
};
```

注意 `as` 关键字，它是重新映射开始的关键字。在该关键字之后，我们可以编写一个条件
类型来检查值类型。如果值类型可赋值给类型 `U`，则原样返回该键。但是，如果值类型不
能赋值给 `U`，则返回 `never`:

```typescript
type PickByType<T, U> = { [P in keyof T as T[P] extends U ? P : never]: T[P] };
```

这样，我们就创建了一个根据值类型过滤键的类型。

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Key remapping via as](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [keyof and Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
<div STYLE="page-break-after: always;"></div>---
id: 16
title: Pop
lang: zh
level: medium
tags: array
---

## 挑战

实现一个通用的 `Pop<T>`，它接受一个数组 `T` 并返回一个没有最后一个元素的数组。

例如：

```ts
type arr1 = ["a", "b", "c", "d"];
type arr2 = [3, 2, 1];

type re1 = Pop<arr1>; // expected to be ['a', 'b', 'c']
type re2 = Pop<arr2>; // expected to be [3, 2]
```

## 解答

我们需要将数组分成两部份：从头部到最后一个元素之前的所有内容和最后一个元素本身。
之后，我们就可以去掉最后一个元素并返回头部部分了。

为此，我们可以使用
[variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)。
结合
[type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)，
我们可以推断出需要的部分：

```ts
type Pop<T extends any[]> = T extends [...infer H, infer T] ? H : never;
```

如果 `T` 是可拆分为两部分的数组类型，则我们返回除最后一个以外的所有内容，否则返
回 `never`。

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
<div STYLE="page-break-after: always;"></div>---
id: 8
title: Readonly 2
lang: zh
level: medium
tags: readonly object-keys
---

## Challenge

实现一个通用的`MyReadonly2<T, K>`，它带有两种类型的参数`T`和`K`。`K`指定的`T`的
属性集，应该设置为只读。如果未提供`K`，则应使所有属性都变为只读，就像普通
的`Readonly<T>`一样。

例如:

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

const todo: MyReadonly2<Todo, "title" | "description"> = {
  title: "Hey",
  description: "foobar",
  completed: false,
};

todo.title = "Hello"; // Error: cannot reassign a readonly property
todo.description = "barFoo"; // Error: cannot reassign a readonly property
todo.completed = true; // OK
```

## 解答

这个挑战是`Readonly<T>`挑战的延续，除了需要添加一个新的类型参数`K`，以便我们可以
将指定的属性设为只读外，一切都基本相同。

我们从最简单的例子开始，即`K`是一个空集合，因此没有任何属性需要设置为只读。我们
只需要返回`T`就好了。

```ts
type MyReadonly2<T, K> = T;
```

现在我们需要处理这样一种情况：即在`K`中提供对应属性，我们利用`&`操作符使两种类型
产
生[交集](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)：
一个是之前提到的类型`T`,另一个是含有只读属性的类型。

```ts
type MyReadonly2<T, K> = T & { readonly [P in K]: T[P] };
```

看起来是一种解决方案，但是我们得到一个编译错误
：`Type ‘P’ cannot be used to index type ‘T’`。这是对的，因为我们没有对`K`设置约
束，它应该是 “`T`中的每一个键” :

```ts
type MyReadonly2<T, K extends keyof T> = T & { readonly [P in K]: T[P] };
```

正常工作啦? 🙅‍ 不!

我们还没有处理当`K`什么都没有设置的情况，该情况下我们的类型必须和通常
的`Readonly<T>`表现得一样。为了修复这个问题，我们将`K`的默认值设为"`T`的所有键
"。

```ts
// solution-1
type MyReadonly2<T, K extends keyof T = keyof T> = T & {
  readonly [P in K]: T[P];
};
// 即：
type MyReadonly2<T, K extends keyof T = keyof T> = Omit<T, K> & Readonly<T>;
```

你可能发现`solution-1`在 TypeScript 4.5 及以上的版本中不能正常工作，因为原本的行
为在 TypeScript 中是一个 bug（
在[microsoft/TypeScript#45122](https://github.com/microsoft/TypeScript/issues/45122)中
列出，
在[microsoft/TypeScript#45263](https://github.com/microsoft/TypeScript/pull/45263)中
被修复，在 TypeScript 4.5 版本中正式发布）。从概念上来说，交叉类型意味着 "与"，
因此`{readonly a: string} & {a: string}`与`{a: string}`应该是相等的，也就是说属
性`a`是可读且可写的。

在 TypeScript 4.5 之前， TypeScript 有着相反的不正确的行为，也就是说在交叉类型中
，一些成员的属性是只读的，但在另外成员中同名属性是可读可写的，最终对象的相应属性
却是只读的，这种行为是不正确的，但这已经被修复了。因此这也就解释了为什
么`solution-1`不能正常工作。想要解决这个问题，可以像下面这样写：

```ts
//Solution-2
type MyReadonly2<T, K extends keyof T = keyof T> = Omit<T, K> & {
  readonly [P in K]: T[P];
};
//i.e.
type MyReadonly2<T, K extends keyof T = keyof T> = Omit<T, K> & Readonly<T>;
```

因为`K`中的键都没有在`keyof Omit<T, K>`中出现过，因此`solution-2`能够向相应属性
添加`readonly`修饰符。

## 参考

- [Intersection types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Index Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Using type parameters in generic constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints)
<div STYLE="page-break-after: always;"></div>---
id: 116
title: Replace
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `Replace<S, From, To>` 将字符串 `S` 中的第一个子字符串 `From` 替换为 `To`。

例如:

```ts
type replaced = Replace<"types are fun!", "fun", "awesome">; // expected to be 'types are awesome!'
```

## 解答

我们有一个输入字符串`S`，我们需要找到`From` 的匹配并将其替换为`To`。这意味着我们
需要将输入字符串分成三部分，并对每一部分进行推断。

让我们开始吧。我们从字符串的左边开始推断，直到找到`From`, `From`本身和它后面的所
有内容都是右边的部分

```ts
type Replace<
  S,
  From extends string,
  To
> = S extends `${infer L}${From}${infer R}` ? S : S;
```

一旦推断成功，我们就找到了`From`和字符串周围的部分。因此，我们可以通过构造模板字
面量的各个部分并替换匹配项来返回一个新的模板字面量。

```ts
type Replace<
  S,
  From extends string,
  To extends string
> = S extends `${infer L}${From}${infer R}` ? `${L}${To}${R}` : S;
```

除了`From`是空字符串的情况，上述解答没有问题。这里，TypeScript 不会推断这部分，
我们通过为空字符串添加边界情况进行修复。

```ts
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${R}`
  : S;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 119
title: ReplaceAll
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `ReplaceAll<S, From, To>` 将一个字符串 `S` 中的所有子字符串 `From` 替换为
`To`。

例如:

```ts
type replaced = ReplaceAll<"t y p e s", " ", "">; // expected to be 'types'
```

## 解答

本解答将基于 [`Replace`](../en/medium-replace.md)类型的解答。

输入字符串 `S` 必须被分成三部分。在`From`之前的最左边部分，From 本身，From 之后
的最右边部分。我们可以用条件类型和类型推断来做到这一点。

一旦字符串推断成功，我们就知道了各部分的组成，就可以返回由这些部分和所需的`To`构
造的新的模板字面量类型

```ts
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${R}`
  : S;
```

这个解决方案将替换单个匹配，但我们需要替换所有匹配。通过将新字符串作为类型本身的
类型参数(递归地)很容易就能实现这一点。

```ts
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer L}${From}${infer R}`
  ? ReplaceAll<`${L}${To}${R}`, From, To>
  : S;
```

但是，在下一次递归调用中，字符可能会以意想不到的方式被替换。例如，调
用`ReplaceAll<"fooo", "fo", "f">`将导致`foo -> fo -> f`。因此，我们需要跟踪之前
的字符串。

```typescript
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string,
  Before extends string = ""
> = From extends ""
  ? S
  : S extends `${Before}${infer L}${From}${infer R}`
  ? ReplaceAll<`${Before}${L}${To}${R}`, From, To, `${Before}${L}${To}`>
  : S;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 1130
title: ReplaceKeys
lang: zh
level: medium
tags: object-keys
---

## 挑战

实现一个类型`ReplaceKeys`，替换联合类型中的键，如果某个类型没有这个键，只需跳过
替换。该类型有三个参数。例如:

```typescript
type NodeA = {
  type: "A";
  name: string;
  flag: number;
};

type NodeB = {
  type: "B";
  id: number;
  flag: number;
};

type NodeC = {
  type: "C";
  name: string;
  flag: number;
};

type Nodes = NodeA | NodeB | NodeC;

// would replace name from string to number, replace flag from number to string
type ReplacedNodes = ReplaceKeys<
  Nodes,
  "name" | "flag",
  { name: number; flag: string }
>;

// would replace name to never
type ReplacedNotExistKeys = ReplaceKeys<Nodes, "name", { aa: number }>;
```

## 解答

有一个由多个接口组成的联合类型，我们需要对它们进行迭代，并替换其中的键。分布式和
映射类型在这里肯定会有帮助。

首先要说明的是，TypeScript 中的映射类型也是分布式的。这意味着我们可以开始编写映
射类型来遍历接口的键，同时对联合类型具有分布性。但是，欲速则不达，我会稍稍解释一
下。

显然我们可以编写一个接受联合类型的条件类型，它将遍历联合类型的元素，它在之前的其
他挑战中帮助了我们很多。每次你写下形如`U extends any ? U[] : never`的代码时，实
际发生的是在每次迭代中`U`从真值分支中的联合类型`U`变成一个元素。

这同样适用于映射类型。我们可以编写一个映射类型，它迭代类型形参的键，实际发生的是
迭代联合类型的单个元素，而不是整个联合类型。

我们从最简单的开始。从联合类型`U`中取出所有元素(感谢分布性)，对每个元素遍历其键
并返回一个副本。

```typescript
type ReplaceKeys<U, T, Y> = { [P in keyof U]: U[P] };
```

这样我们就得到了所有类型参数`U`的键的副本。现在，我们需要过滤掉`T` 和`Y`中的键。

首先，我们将检查当前所在的属性是否在要更新的键列表中(在类型参数`T`中)。

```typescript
type ReplaceKeys<U, T, Y> = {
  [P in keyof U]: P extends T ? never : never;
};
```

如果是的话，这意味着开发人员要求更新对应的键，并提供了替换类型。但我们不能确定对
应的键是否存在。因此我们需要检查在`Y`中是否存在相同的键。

```typescript
type ReplaceKeys<U, T, Y> = {
  [P in keyof U]: P extends T ? (P extends keyof Y ? never : never) : never;
};
```

如果两个条件都为真，这意味着我们知道要替换的键和键的类型。所以我们返回在`Y`中指
定的类型。

```typescript
type ReplaceKeys<U, T, Y> = {
  [P in keyof U]: P extends T ? (P extends keyof Y ? Y[P] : never) : never;
};
```

但是，如果在类型参数`T`中有一个键需要更新，但是在类型参数`Y`中没有，我们需要返
回`never`(根据挑战规范)。最后一种情况是，在`T`和`Y`中都没有这样的键，在这种情况
下，我们只需要跳过替换，返回原始接口中的对应类型。

```typescript
type ReplaceKeys<U, T, Y> = {
  [P in keyof U]: P extends T ? (P extends keyof Y ? Y[P] : never) : U[P];
};
```

使用分布式映射类型确实可以获得可读性更强的解决方案。如果没有它们的话,我们将不得
不使用条件类型，并在`true`分支中使用映射类型遍历`U`。

## 参考

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 2
title: Get Return Type
lang: zh
level: medium
tags: infer built-in
---

## 挑战

不使用 ReturnType 实现 TypeScript 的 `ReturnType<T>` 泛型。

例如：

```ts
const fn = (v: boolean) => {
  if (v) return 1;
  else return 2;
};

type a = MyReturnType<typeof fn>; // should be "1 | 2"
```

## 解答

在[条件类型中使用类型推导](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)的
经验法则是当你不确定类型必须是什么的时候。这正好适用本次挑战的情况。我们不知道函
数所返回的类型，但是我们的任务是获取它。

我们有一个在类型系统中看起来为 `() => void` 的函数。但是我们不知道 `void` 的位置
必须是什么。所以让我们用`infer R`替换它，这将是我们对解决方案的第一次迭代：

```ts
type MyReturnType<T> = T extends () => infer R ? R : T;
```

如果我们的类型 `T` 可以分配给函数，我们推断它的返回类型并将其返回，否则我们返回
`T` 本身。比较直截了当。

这个解决方案的问题是，如果我们传递一个带参数的函数，它将不能分配给我们的类型
`() => infer R`。

让我们通过添加 `...args: any[]` 来表明我们可以接受任何参数并且我们不关心它们：

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : T;
```

## References

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 2688
title: StartsWith
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `StartsWith<T, U>`，接受 2 个字符串类型并返回 `T` 是否以 `U` 开头。例如：

```typescript
type a = StartsWith<"abc", "ac">; // expected to be false
type b = StartsWith<"abc", "ab">; // expected to be true
type c = StartsWith<"abc", "abcd">; // expected to be false
```

## 解答

了解 Typescript 中的模板字面量类型，解决方案就变得十分明显了。让我们从保存 `any`
类型的初始类型开始：

```typescript
type StartsWith<T, U> = any;
```

我们需要检查输入类型参数 `T` 是否以字面量 `U` 开始。我会先做的简单一些，通过使用
条件类型来检查 `T` 是否为 `U`：

```typescript
type StartsWith<T, U> = T extends `${U}` ? never : never;
```

如果输入类型参数 `T` 和类型参数 `U` 相同，我们会进入条件类型的 true 分支。但是，
我们不需要它们相等。我们需要检查它是否以 `U` 开始。换句话说，我们不关心字面量
`U` 后面是否有其它东西。因此，在这里使用 `any` 类型：

```typescript
type StartsWith<T, U> = T extends `${U}${any}` ? never : never;
```

如果类型 `T` 匹配以 `U` 开头的字符串的模式，则返回 `true` 类型，否则返回
`false`：

```typescript
type StartsWith<T, U> = T extends `${U}${any}` ? true : false;
```

我们通过了所有的测试用例，但是我们仍然得到了一个编译错误，说“Type ‘U’ is not
assignable to type ‘string | number | bigint | boolean | null | undefined’.”。那
是因为我们没有在泛型上添加一个约束来表明 `U` 是一个字符串。让我们添加它：

```typescript
type StartsWith<T, U extends string> = T extends `${U}${any}` ? true : false;
```

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
<div STYLE="page-break-after: always;"></div>---
id: 531
title: String to Union
lang: zh
level: medium
tags: union string
---

## 挑战

实现 `StringToUnion` 类型。它接收 `string` 类型参数，输出其所有字符的联合
（union）。

For example: 比如：

```typescript
type Test = "123";
type Result = StringToUnion<Test>; // expected to be "1" | "2" | "3"
```

## 解答

在这个挑战中，我们需要遍历每个字符并把它加到联合（union）中。遍历字符串很容易，
我们需要做的是推断出字符串的两个部分，首字符和其余部分：

```typescript
type StringToUnion<T extends string> = T extends `${infer C}${infer T}`
  ? never
  : never;
```

在这里，我们将获得 2 个类型参数 `C` 和 `T`（字符和尾部）。为了继续遍历字符串，我
们递归地调用它并将尾部作为参数传入：

```typescript
type StringToUnion<T extends string> = T extends `${infer C}${infer T}`
  ? StringToUnion<T>
  : never;
```

剩下的就是联合（union）本身了。我们需要添加第一个字符到联合（union）。在基本情况
下，`StringToUnion`会返回`C | never`，我们只需要将`C`添加到联合（union）中：

```typescript
type StringToUnion<T extends string> = T extends `${infer C}${infer T}`
  ? C | StringToUnion<T>
  : never;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
<div STYLE="page-break-after: always;"></div>---
id: 4803
title: Trim Right
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `TrimRight<T>` ，它接收一个明确的字符串类型，并返回一个删除了尾部所有空格的
新字符串类型。例如：

```typescript
type Trimmed = TrimRight<"   Hello World    ">; // expected to be '   Hello World'
```

## 解答

这个挑战其实和另外的 [Trim](./medium-trim.md) 以及
[Trim Left](./medium-trimleft.md) 挑战很相似。但是这个挑战我们需要做的是移除尾部
的空格。

我们仍然以一个空白类型开始：

```typescript
type TrimRight<S extends string> = any;
```

如何检查字符串是否是以空格结束呢？我们可以通过一个输入字符串是否继承自尾部为空格
的模板字符串的条件语句来判断，模板字符串中末尾是一个空格：

```typescript
type TrimRight<S extends string> = S extends `${infer T} ` ? never : never;
```

注意这里的类型推断 `infer T`。如果字符串是以空格结尾的，我们需要获取没有空格的部
分。因此我们将除末尾空格之外的部分推断为类型 `T`：

获取到尾部不包含空格的部分，我们就可以返回它：

```typescript
type TrimRight<S extends string> = S extends `${infer T} ` ? T : never;
```

但是上面的方案只能处理结尾包含一个空格的情况，如果有多个空格该如何处理呢？要覆盖
这种情况，我们需要不断去除尾部空格直至尾部没有空格，通过递归调用本身可以轻松实现
：

```typescript
type TrimRight<S extends string> = S extends `${infer T} `
  ? TrimRight<T>
  : never;
```

现在，我们的类型将递归逐个删除尾部空格，直至尾部没有空格。然后进入 `false` 分支
。此步骤中意味着尾部没有空格，我们可以不作处理直接返回输入的字符串：

```typescript
type TrimRight<S extends string> = S extends `${infer T} ` ? TrimRight<T> : S;
```

我想这就是解答方案。但我们通过测试用例的错误提示看到还有一些缺陷。我们没有处理制
表符和换行符。我们新增一个叫做 `Whitespace` 的单独类型，列出所有要处理的字符：

```typescript
type Whitespace = " " | "\n" | "\t";
```

然后使用该类型替换我们工具类型内的空格字符串：

```typescript
type TrimRight<S extends string> = S extends `${infer T}${Whitespace}`
  ? TrimRight<T>
  : S;
```

最终解答如下所示：

```typescript
type Whitespace = " " | "\n" | "\t";
type TrimRight<S extends string> = S extends `${infer T}${Whitespace}`
  ? TrimRight<T>
  : S;
```

## 参考

- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 108
title: Trim
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现`Trim<T>`，它接收一个字符串类型，并返回一个新字符串，其中两端的空白符都已被
删除。

例如:

```ts
type trimmed = Trim<"  Hello World  ">; // expected to be 'Hello World'
```

## 解答

跟[`TrimLeft<T>`](./medium-trimleft.md)几乎是相同的任务。我们这里
用[模板字面量类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
在类型系统中对字符串进行建模

现在有三种情况：空格在字符串的左边，空格在字符串的右边，以及字符串两边都不含空格
。让我们先从左边有空格的情况开始建模。通过结合模板字面量类型和条件类型，我们可以
推断出不包含空字符串的其余部分。在这种情况下，我们递归地继续移除左边的空格，直到
没有空格时我们返回字符串而不做任何更改：

```ts
type Trim<S> = S extends ` ${infer R}` ? Trim<R> : S;
```

一旦左边没有空格，我们需要检查右边是否有空格，然后做相同的处理：

```ts
type Trim<S> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer L} `
  ? Trim<L>
  : S;
```

这样，我们移除左边的空格，然后移除右边的空格。直到没有空格，我们只返回字符串本身
。

但是我们仍然会有失败的测试用例。那是因为我们没有处理换行符和制表符。

我不想重复联合类型，所以我单独声明了一个联合类型，并用它替换了空格：

```ts
type Whitespace = " " | "\n" | "\t";
type Trim<S> = S extends `${Whitespace}${infer R}`
  ? Trim<R>
  : S extends `${infer L}${Whitespace}`
  ? Trim<L>
  : S;
```

## 参考

- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 106
title: Trim Left
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现 `TrimLeft<T>` ，它接收确定的字符串类型并返回一个新的字符串，其中新返回的字
符串删除了原字符串开头的空白字符串。

例如:

```ts
type trimmed = TrimLeft<"  Hello World  ">; // expected to be 'Hello World  '
```

## 解答

当你需要在类型中用到模板字符串时，你需要用到
[模板字面量类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types).
它允许在类型系统中对字符串进行建模。

我们这里有两种情况：左边有空格的字符串和没有空格的字符串。如果我们有空格，我们需
要推断字符串的另一部分并再次检查它是否有空格。否则，我们返回推断的部分而不做任何
更改。

让我们编写一个条件类型，以便我们可以使用类型推断并将其与模板字面量类型结合起来：

```ts
type TrimLeft<S> = S extends ` ${infer T}` ? TrimLeft<T> : S;
```

事实证明，这不是完整的解答。一些测试用例没有通过。那是因为我们没有处理换行符和制
表符。让我们用这三个的联合替换空格来解决这个问题：

```ts
type TrimLeft<S> = S extends `${" " | "\n" | "\t"}${infer T}` ? TrimLeft<T> : S;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)
<div STYLE="page-break-after: always;"></div>---
id: 5140
title: Trunc
lang: zh
level: medium
tags: template-literal
---

## 挑战

实现类型版本 `Math.trunc`。它接受字符串或数字，删除数字的小数部分返回整数部分。
例如：

```typescript
type A = Trunc<12.34>; // 12
```

## 解答

如果一个数字本身是字符串，那么很容易得到小数点之前的部分。这种方式只是用点分割字
符串得到第一部分。

多亏 Typescript 中的模板字面量类型, 这样做很容易。首先，我们将从需要实现的初始类
型开始：

```typescript
type Trunc<T> = any;
```

我们有一个将接受数字本身的类型参数。我们讨论过，通过分割字符串容易得到第一部分，
所以我们需要将数字转换成字符串：

```typescript
type Trunc<T> = `${T}`;
```

得到一个报错，“Type 'T' is not assignable to type 'string | number | bigint |
boolean | null | undefined”。为了解决这个问题，我们给类型参数 `T` 增加一个泛型约
束限制其为数字或字符串：

```typescript
type Trunc<T extends number | string> = `${T}`;
```

现在，我们有了数字的字符串表示。接下来，我们可以使用条件类型检查字符串是否带有小
数点。如果有，我们将推断出它们：

```typescript
type Trunc<T extends number | string> = `${T}` extends `${infer R}.${infer _}`
  ? never
  : never;
```

有个这个检查，我们可以区分有小数点和没有小数点的情况。

当小数点存在，我们取得小数点前面的部分 `R` 并返回，忽略小数点后面的部分：

```typescript
type Trunc<T extends number | string> = `${T}` extends `${infer R}.${infer _}`
  ? R
  : never;
```

但是如果字符串中没有小数点返回什么呢？它意味着没有什么需要截取，所以我们原样返回
输入类型：

```typescript
type Trunc<T extends number | string> = `${T}` extends `${infer R}.${infer _}`
  ? R
  : `${T}`;
```

这样，我们的方案现在通过了所有的测试用例！

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 3188
title: Tuple to Nested Object
lang: zh
level: medium
tags: array
---

## 挑战

给定一个只包含字符串类型的元组 `T` 和一个类型 `U`，递归的构建一个对象。

```ts
type a = TupleToNestedObject<["a"], string>; // {a: string}
type b = TupleToNestedObject<["a", "b"], number>; // {a: {b: number}}
type c = TupleToNestedObject<[], boolean>; // boolean. if the tuple is empty, just return the U type
```

## 解答

让我们首先通过推断其内容来迭代元组。

```ts
type TupleToNestedObject<T, U> = T extends [infer F, ...infer R]
  ? never
  : never;
```

如果 `T` 为空呢？在这种情况下，我们按原样返回类型 `U`。

```ts
type TupleToNestedObject<T, U> = T extends [infer F, ...infer R] ? never : U;
```

由于 `object` 的键值只能是 `string` 类型，我们需要检测 `F` 是否为 `string`。

```ts
type TupleToNestedObject<T, U> = T extends [infer F, ...infer R]
  ? F extends string
    ? never
    : never
  : U;
```

如果 `F` 是 `string` 类型，我们想要创建一个 `object` 并递归的遍历剩余的元组。这
样我们就遍历整个元组并创建了嵌套对象。当遍历到最后一个元素，我们返回类型 `U`。

```ts
type TupleToNestedObject<T, U> = T extends [infer F, ...infer R]
  ? F extends string
    ? { [P in F]: TupleToNestedObject<R, U> }
    : never
  : U;
```

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 10
title: Tuple to Union
lang: zh
level: medium
tags: infer tuple union
---

## 挑战

实现泛型`TupleToUnion<T>`，它返回由元组所有值组成的联合类型。

例如:

```ts
type Arr = ["1", "2", "3"];

const a: TupleToUnion<Arr>; // expected to be '1' | '2' | '3'
```

## 解答

我们需要获取一个数组中的所有元素并将其转化为联合类型。幸运的是，TypeScript 已经
在其类型系统中实现了这种功能——
[lookup types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)。
我们可以使用构造`T[number]`得到由`T`的所有元素所组成的联合类型。

```ts
type TupleToUnion<T> = T[number];
```

但是，我们得到了一个 `error`: `Type ‘number’ cannot be used to index type ‘T’`。
这时因为我们没有向`T`施加约束，即没有告知编译器`T`是一个可以被索引的数组。

让我们通过添加`extends unknown[]`解决这个问题。

```ts
type TupleToUnion<T extends unknown[]> = T[number];
```

## 参考

- [Lookup Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)
<div STYLE="page-break-after: always;"></div>---
id: 62
title: Type Lookup
lang: zh
level: medium
tags: union map
---

## 挑战

有时，你可能想要根据联合类型中的属性查找类型。

在这个挑战中，我们想要在联合类型`Cat | Dog`中通过查找通用的`type`字段获得相应的
类型。

换句话说，在接下来的例子中我们希望通过`LookUp<Dog | Cat, 'dog'>`得到`Dog`类型，
通过`LookUp<Dog | Cat, 'cat'>` 得到`Cat`类型。

```ts
interface Cat {
  type: "cat";
  breeds: "Abyssinian" | "Shorthair" | "Curl" | "Bengal";
}

interface Dog {
  type: "dog";
  breeds: "Hound" | "Brittany" | "Bulldog" | "Boxer";
  color: "brown" | "white" | "black";
}

type MyDogType = LookUp<Cat | Dog, "dog">; // expected to be `Dog`
```

## 解答

一开始我以为现在这个解答将会有着大量的解释说明，但事实证明并没有什么与众不同。

我们知道可以利用 TypeScript 中
的[条件类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#conditional-types)来
检查类型是否可分配给某些特定布局（如果我可以这么说的话）。

然后让我们来检查`U`是否可以赋值给`{ type: T }`：

```ts
type LookUp<U, T> = U extends { type: T } ? U : never;
```

顺便提一下，值得注意的是，条件类型在 TypeScript 中是分布式的，因此联合类型中的每
个成员都将按照我们的条件进行检查。

## 参考

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 5360
title: Unique
lang: zh
level: medium
tags: array
---

## 挑战

实现类型版本 `Lodash.uniq()`。`Unique<T>` 接收一个数组 `T`，返回去重后的列表。

```typescript
type Res = Unique<[1, 1, 2, 2, 3, 3]>; // expected to be [1, 2, 3]
type Res1 = Unique<[1, 2, 3, 4, 4, 5, 6, 7]>; // expected to be [1, 2, 3, 4, 5, 6, 7]
type Res2 = Unique<[1, "a", 2, "b", 2, "a"]>; // expected to be [1, "a", 2, "b"]
```

## 解答

在这个挑战中，我们需要在类型系统中实现 lodash 的 `.uniq()` 函数。我们必须接受一
个元组类型参数，过滤到重复的元素，只保留唯一的元素集合。

让我们从初始类型开始：

```typescript
type Unique<T> = any;
```

为了检测元素在元组中是否是唯一的，首先我们需要读取它。要做到这一点，我们将在条件
类型中推断它。

不过，为了得到预期的结果，我们需要按照相反的顺序进行。如果我们通过
`[infer H, ...infer T]` 的方式，我们的结果的顺序将会是错的。因此我们先取得最后的
元素，将其它的元素放在其头部：

```typescript
type Unique<T> = T extends [...infer H, infer T] ? never : never;
```

现在我们得到了元素 `T`，我们应该检测什么呢？我们需要检测元素 `T` 是否存在于元组
的其余部分（头部）中：

```typescript
type Unique<T> = T extends [...infer H, infer T]
  ? T extends H[number]
    ? never
    : never
  : never;
```

通过条件类型 `T extends H[number]`，我们可以检测类型 `T` 是否存在于 `H` 中。如果
存在则意味着重复，我们需要跳过它。也就是说我们只返回头部元素：

```typescript
type Unique<T> = T extends [...infer H, infer T]
  ? T extends H[number]
    ? [...Unique<H>]
    : never
  : never;
```

如果不存在于头部（`H`）中，就说明它是唯一的。我们返回的元组需要包含它：

```typescript
type Unique<T> = T extends [...infer H, infer T]
  ? T extends H[number]
    ? [...Unique<H>]
    : [...Unique<H>, T]
  : never;
```

最后一种情况是输入类型 `T` 与元组不匹配。这里我们只需要返回一个空元组，以避免在
递归调用中中断展开操作：

```typescript
type Unique<T> = T extends [...infer H, infer T]
  ? T extends H[number]
    ? [...Unique<H>]
    : [...Unique<H>, T]
  : [];
```

这样，我们实现了一个可以返回唯一元素的类型。

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 5117
title: Without
lang: zh
level: medium
tags: union array
---

## 挑战

实现 lodash `.without()` 的类型版本。 `Without<T, U>` 参数 `T` 为数组、参数 `U`
为数字或数组，返回一个不包含`U`元素的数组。

```typescript
type Res = Without<[1, 2], 1>; // expected to be [2]
type Res1 = Without<[1, 2, 4, 1, 5], [1, 2]>; // expected to be [4, 5]
type Res2 = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // expected to be []
```

## 解答

这个挑战确实很有趣。我们需要实现该类型，可以从元组中过滤出元素。我们从初始类型开
始：

```typescript
type Without<T, U> = any;
```

因为我们需要处理元组中的特定元素，我使用类型推导获取特定元素和其余部分：

```typescript
type Without<T, U> = T extends [infer H, ...infer T] ? never : never;
```

元素是否来自元组，我们可以检查该元素是否为 `U` 类型。我们需要这个检查以确定是否
应该将该元素添加到结果中：

```typescript
type Without<T, U> = T extends [infer H, ...infer T]
  ? H extends U
    ? never
    : never
  : never;
```

如果它 “extends” 于输入类型 `U`，就表明着我们结果中不需要它。于是我们跳过它，返
回不含它的元组。但是，因为我们需要处理其它元素，我们不会返回一个空元组，而是返回
通过递归调用 `Without` 后的元组：

```typescript
type Without<T, U> = T extends [infer H, ...infer T]
  ? H extends U
    ? [...Without<T, U>]
    : never
  : never;
```

这样我们就在 `T` 中跳过了所有通过 `U` 指定的元素。然而，一旦我们检测到不应该跳过
该元素，我们就返回包含这个元素的元组：

```typescript
type Without<T, U> = T extends [infer H, ...infer T]
  ? H extends U
    ? [...Without<T, U>]
    : [H, ...Without<T, U>]
  : never;
```

我们还需要处理最后一个 `never` 类型。因为我们处理可变元组类型（variadic tuple
types）并展开它，我们必须返回一个空元组而非 `never`：

```typescript
type Without<T, U> = T extends [infer H, ...infer T]
  ? H extends U
    ? [...Without<T, U>]
    : [H, ...Without<T, U>]
  : [];
```

当 `U` 为基本类型时，我们得到了一个有效的方案。但是，这个挑战中还有一种情况是它
可以是数字元组。为了支持这个情况，我们可以将 `H extends U` 中的类型 `U` 继续扩展
，通过条件类型继续检测。

如果 `U` 是一个数字元组，我们以联合（union）的方式返回所有元素，否则就原样返回：

```typescript
type Without<T, U> = T extends [infer H, ...infer T]
  ? H extends (U extends number[] ? U[number] : U)
    ? [...Without<T, U>]
    : [H, ...Without<T, U>]
  : [];
```

恭喜！我们实现了 lodash `.without()` 的类型版本。

## 参考

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Inferring within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [Recursive Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
<div STYLE="page-break-after: always;"></div>---
id: 13
title: Hello, World
lang: zh
level: warm
tags: warm-up
---

## 挑战

在 Type Challenges，我们使用类型系统自身去做断言。

在这个挑战中，你需要改变下面的代码使它能够通过测试（没有类型检查错误）。

```ts
// expected to be string
type HelloWorld = any;
```

```ts
// you should make this work
type test = Expect<Equal<HelloWorld, string>>;
```

## 解答

这是一个热身挑战，让你熟悉他们的练习场，如何接受挑战等等。我们在这里需要做的只是
将类型设置为' string '替代原来的' any ':

```ts
type HelloWorld = string;
```

## 参考

- [Typed JavaScript at Any Scale](https://www.typescriptlang.org)
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for Java/C# Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html)
- [TypeScript for Functional Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html)
<div STYLE="page-break-after: always;"></div>


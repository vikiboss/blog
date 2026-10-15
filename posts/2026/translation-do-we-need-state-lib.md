---
title: '[译] 我们还需要状态管理库吗？'
date: 2026-08-28
topic: '前端'
excerpt: '深入主流状态管理库的实现原理，然后自己动手写一个。'
isOriginal: false
author: 'Neciu Dan'
tags:
  - 'React'
  - '状态管理'
  - '前端'
  - '翻译'
---

> 原文：Do we need state management libraries anymore?
>
> 时间：2026 年 7 月 21 日
>
> 作者：Neciu Dan
>
> 链接：https://neciudan.dev/do-we-need-state-management-libraries

---

最近，我和 Redux 的作者 Dan Abramov 录了一期播客。聊到一半，他告诉我，状态管理库已经不再必要了。我震惊了，或者说，目瞪口呆（这个词我终于用上了）。

但仔细想想，这话其实没什么大问题。我们之所以需要状态管理库，是为了避免 Context 引发的多次重渲染，而我们真正想要的，是一种更精准的状态处理方式。

## 状态的类型

我在之前那篇 [React 组件通信模式](https://neciudan.dev/component-communication-patterns-in-react) 里提到过，状态可以分成几类。

**UI 状态**是局部的。模态框状态、下拉框选中项、输入框里内容，`useState` 就够了。

**服务端状态**是后端数据的缓存副本，被组件当作缓存层复用，如今归 [TanStack Query](https://tanstack.com/query/latest) 管。

**URL 状态**是应用某一时刻的快照，可以存进 URL 分享，通常交给 [nuqs](https://nuqs.dev/) 这类库。

**全局状态**是在会话期间不变的，如主题、货币、地区、语言等，应该放在 React Context 里。

**复杂的共享客户端状态**是剩下的部分。我之前建议用 [Zustand](https://zustand.docs.pmnd.rs/) 这样的轻量状态库。

那么，如果我们把状态都用上述方式放到了正确位置，最后的部分，还需要状态管理库吗？不妨让我们先看看那些知名状态库底层是怎么做的，然后自己动手写一个，答案自然就有了。

## Redux

Redux 本质上就是一个发布/订阅 store。发布/订阅即 publish/subscribe，感兴趣的各方注册一个回调（订阅），值变化时，store 调用每一个已注册的回调（发布）。

在这个核心之上，Redux 加了一条规则，状态只能通过 reducer 修改。reducer 是纯函数，相同输入永远得到相同输出，不碰函数之外的任何东西（无副作用）。

```ts
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set<() => void>();

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
    return action;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}
```

我要说明一点，这不是对 Redux 的比喻。抛开边界情况，这就是它真实的机制，`dispatch` 运行 reducer 算出下一个状态，然后通知每一个监听者，`subscribe` 注册监听者，并返回一个用于移除它的函数。

`createStore` 执行时声明了一个 `state` 变量，返回三个函数，这些函数在 `createStore` 执行结束后依然能访问 `state`（这就是闭包）。

```ts
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

const store = createStore(counterReducer, { count: 0 });

store.dispatch({ type: 'counter/incremented' });
store.getState(); // { count: 1 }
```

到了 React 这边，`react-redux` 提供了一些 hook，把组件接到那个 store 上。

```tsx
function Counter() {
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch({ type: 'counter/incremented' })}>
      {count}
    </button>
  );
}
```

`useSelector` 通过减少重渲染解决了 Context 的问题。你传入一个函数，挑出自己关心的那一小片状态，只有这一片变化时，组件才会重渲染。

那么，为什么每次变化都要写成一个 action 对象，而不是直接设置状态？因为 action 对象是可序列化的，它们能转成纯 JSON 再转回来。应用的全部历史就变成了一串纯对象组成的日志，而由于 reducer 是纯函数，重放这串日志总会得到相同的状态。

这正是 Redux DevTools 得以实现的原因，时间旅行调试也在其中（这其实正是 Dan 最初构建 Redux 的动机），DevTools 记录每一个被 dispatch 的 action，而「回到过去」不过是把日志重放到更早的某个点。

但老派 Redux 的麻烦在于，想加一个布尔开关，你得动一个 action type 常量、一个 action creator、一个 reducer case 和一个 selector。

```ts
// constants.ts
export const SIDEBAR_TOGGLED = 'ui/sidebarToggled';

// actions.ts
export const toggleSidebar = () => ({ type: SIDEBAR_TOGGLED });

// reducer.ts
case SIDEBAR_TOGGLED:
  return { ...state, sidebarOpen: !state.sidebarOpen };

// selectors.ts
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
```

一个布尔值，四个文件。放大到大型应用里的每一个字段，你就能理解，为什么整整一代开发者听到「reducer」这个词就情绪上头。

现代的答案是 Redux Toolkit，它把这四个文件压缩成一次 `createSlice` 调用，并替你生成 action。Redux 官方如今也把 `createStore` 标记为废弃，让所有人改用 Redux Toolkit 的 `configureStore`。

关于 `react-redux` 还有一点，从 v8 开始，`useSelector` 建立在 React 的 `useSyncExternalStore` 之上，它订阅 store，读取你选中的那一小片状态，并在这一片变化时重渲染组件。

记住这个 hook 的名字。它会反复出现。

## Zustand

Zustand 保留了 Redux 的机制，但删掉了它的各种约定。

这个名字在德语里是「状态」的意思，出自 Poimandres 团队，Jotai 和 Valtio 也出自同一团队（作者是 Daishi Kato，我和他录过一期很棒的播客，[点这里收听](https://www.youtube.com/watch?v=ns8ith5cu-U&list=PLeeGnEj5psFIwWJfpCwnedMsFApK6CvRr&index=26&t=6s)）。

Zustand 源码里真正的 `createStore`，稍作简化后是这样。

```ts
const createStore = (createState) => {
  let state;
  const listeners = new Set<() => void>();

  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      state = Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener());
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setState, getState, subscribe };
  state = createState(setState, getState, api);
  return api;
};
```

它和 Redux 基本一样，只是用 `setState` 取代了 `dispatch` 和 reducer。你用一个部分对象直接更新状态，而不是把更新描述成 action，所以没有 action 日志，也没有时间旅行工具。`Object.is` 是 JavaScript 里最严格的相等比较，对对象而言，它只回答一个问题，这两个引用在内存里是不是 *同一个对象* ？

两个看起来一模一样、但分别创建出来的对象，不是 `Object.is` 相等的。Zustand 在这里用它，是为了在你再次设置同一个状态引用时，不通知任何人。

巧妙之处在 `createStore` 的最后两行。你的 `createState` 函数接收 `set` 和 `get` 作为参数，这就是为什么一个 Zustand store 可以把 action 内联定义在它所修改的状态旁边。

```ts
const useBearStore = create((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}));

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return <button onClick={increase}>{bears} bears</button>;
}
```

如果你好奇，`increase` 怎么能在 `state` 还不存在时就接收 `set`（再看一眼源码，`state` 只在最后一行、`createState` 运行 *之后* 才被赋值）？答案是，此时什么都还没运行。你的 action 只是捕获了一个对 `set` 函数的引用，等有人点击按钮、`increase` 真正执行时，`state` 早已被赋值了。

`create` 包住 `createStore` 并返回一个 hook。这个 hook 用 `useSyncExternalStore`（又是它）订阅 store，读取 `selector(getState())`，并在选中的值变化时重渲染，和 `useSelector` 是同一个 selector 思路，只是没有 Provider、action 或 reducer。

整个库 gzip 之后大约一千字节。

## Jotai

Redux 和 Zustand 是自顶向下的，只有一个 store，组件从中选取状态片。Jotai 把这套逻辑倒了过来。不从一个 store 里选取，而是有许多小的 atom，把它们组合在一起，状态图是自底向上构建的。

这个想法并不原创。Meta 在 2020 年发布了 Recoil，第一个面向 React 的基于 atom 的库，而 Recoil 要求每个 atom 都有一个全局唯一的字符串 key。这些字符串 key 在代码分割后的 bundle 之间会冲突，在测试之间会泄漏，总之会带来基于字符串的身份标识总会带来的那种痛苦。Meta 停止了 Recoil 的开发，并在 2025 年初归档了仓库。

Jotai 继承了 atom 的想法，并解决了身份问题，atom 对象本身就是 key，而 atom 不持有状态。

```ts
export function atom(read) {
  if (typeof read === 'function') {
    return { read };
  }
  return { init: read };
}
```

`atom(0)` 返回 `{ init: 0 }`，一个配置对象。

你可以在模块层级、组件内部、另一个 atom 内部调用 `atom()`，创建的只是一个小对象，用来描述一块状态。值存在别处，在 store 内部的一个 `WeakMap` 里，以 atom 配置本身为 key。

```ts
const atomStateMap = new WeakMap();

function getAtomState(atom) {
  let atomState = atomStateMap.get(atom);

  if (!atomState) {
    atomState = {
      value: atom.init,
      listeners: new Set(),
      dependents: new Set(),
    };
    atomStateMap.set(atom, atomState);
  }

  return atomState;
}
```

atom 通过引用来标识，所以没有字符串 key 会冲突，当一个 atom 不再被任何地方导入时，它的状态会随之被垃圾回收。有意思的机制在派生状态时启动。

```ts
const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);
```

Jotai 怎么知道 `doubleAtom` 依赖 `countAtom`？它不解析你的函数，也不要求你声明任何东西。它通过 *运行* 这个函数、观察它请求了什么来找出答案。

```ts
function readAtom(atom) {
  const atomState = getAtomState(atom);

  // 原始 atom，直接返回存储的值
  if (!atom.read) {
    return atomState.value;
  }

  // 派生 atom，用一个带追踪的 `get` 运行 read 函数
  const get = (dependency) => {
    getAtomState(dependency).dependents.add(atom);
    return readAtom(dependency);
  };

  return atom.read(get);
}
```

Jotai 交给你的 read 函数的那个 `get` 是被监视的（老大哥式的）。你在求值期间 `get` 的每一个 atom，都会把当前 atom 记录为自己的 dependent，所以 `doubleAtom` 跑过一次之后，`countAtom` 就知道 `doubleAtom` 需要收到它的变化通知。

```ts
function writeAtom(atom, newValue) {
  const atomState = getAtomState(atom);
  atomState.value = newValue;
  atomState.listeners.forEach((listener) => listener());
  atomState.dependents.forEach((dependent) => {
    recomputeAtom(dependent); // 重新运行它的 read，然后通知它的 dependents
  });
}
```

当你更新 `countAtom` 时，store 会沿着 dependents 图走，重新求值 `doubleAtom`，通知监听 `doubleAtom` 的东西，再通知依赖 *那些东西* 的东西，在图中受影响的这一支上层层传播，而其余部分保持不变。

而且因为依赖在每次读取时都会被重新记录，所以它们可以是有条件的。一个只在 `get(loggedInAtom)` 为真时才调用 `get(userAtom)` 的 atom，在条件变化时会干脆不再依赖 `userAtom`。

在组件里，atom 用起来几乎和 `useState` 一模一样。

```tsx
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const double = useAtomValue(doubleAtom);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {count} doubled is {double}
    </button>
  );
}
```

`useAtom` 返回值和一个 setter，刻意模仿 `useState`，`useAtomValue` 是只读的那一半，用于组件只展示某个值、无权更新它的情况。

顺便说一句，`useAtom` 是这份清单里唯一一个 *不是* 建立在 `useSyncExternalStore` 之上的集成。我们稍后会讨论为什么。

## MobX

它从 2015 年就存在了，和 Redux 一样，而这两者从一开始就代表了相反的哲学。Redux 说，「把每一次变化都显式化。」MobX 说，「尽管改，我们会搞清楚谁关心。」

这个模型有三部分。Observable 是你的状态。Computed value 从 observable 派生。Reaction 是副作用，当它们依赖的 observable 变化时会重新运行。

```tsx
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class TimerStore {
  seconds = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get minutes() {
    return Math.floor(this.seconds / 60);
  }

  tick() {
    this.seconds += 1;
  }
}

const timer = new TimerStore();

const TimerView = observer(() => <span>{timer.minutes}:{timer.seconds % 60}</span>);
```

`makeAutoObservable` 会遍历这个实例并转换一切，字段变成 observable，getter 变成 computed value（带缓存，只在输入变化时重新计算），方法变成 action，它们把自己的变更批处理起来，好让观察者在最后只被通知一次，而不是每次赋值后都通知。

`observer` 这个包装器就是魔法发生的地方。

```ts
let currentListener: (() => void) | null = null;

function observable(target) {
  const listenersByProp: Record<string, Set<() => void>> = {};

  return new Proxy(target, {
    get(obj, prop) {
      if (currentListener) {
        // ??= 会为这个属性创建 Set（如果还不存在的话）
        (listenersByProp[prop] ??= new Set()).add(currentListener);
      }
      return obj[prop];
    },
    set(obj, prop, value) {
      obj[prop] = value;
      listenersByProp[prop]?.forEach((listener) => listener());
      return true;
    },
  });
}

function autorun(fn) {
  currentListener = fn;
  fn();
  currentListener = null;
}
```

看，它用的是 Proxy。`Proxy` 是 JavaScript 内置的一个对象，它包裹另一个对象并拦截对其的操作，`get` 陷阱在每次属性读取时触发，`set` 陷阱在每次属性写入时触发。

让我们走一遍发生了什么。`autorun` 把全局的 `currentListener` 设为你的函数并运行它。运行期间，它读取的每一个 observable 属性都会触发 `get` 陷阱，陷阱发现有监听者处于活跃状态，就把它记录到 *那个特定属性* 名下。

函数结束时，追踪关闭。之后，当有人修改某个属性时，`set` 陷阱触发，只通知读过那个属性的监听者，不通知其他任何人。

二十行代码，你就得到了自动的、按属性粒度的依赖追踪，不需要 selector、依赖数组或任何形式的声明。系统知道你依赖什么，是因为它看着你读了它。MobX 会对 *在受追踪函数执行期间被读取* 的任何 observable 属性作出反应。如果你不遵守这条规则，会出现两个 bug。

```tsx
// Bug 1，在受追踪函数之外解构会复制一个普通值
const { seconds } = timer; // 读取发生在这里，模块层级，没有监听者在记录

const TimerView = observer(() => {
  return <span>{seconds}</span>; // 渲染一个被复制的普通数字，永不更新
});
```

在 observer 的 render *内部* 解构是没问题的，因为读取发生在追踪开启的时候。但如果在模块层级解构，或者在一个不是 observer 的父组件里解构，你就把一个数字复制进了变量，observable 的读取已经发生在没有监听者记录的地方，所以组件永远不会听到更新。

```ts
// Bug 2，console.log 对对象的格式化是异步的
autorun(() => {
  console.log(message); // 打印了这个对象，但从未读取 message.title
});

message.title = 'new title'; // autorun 不会重新运行
```

autorun 从未解引用 `.title`，所以它不依赖它。控制台稍后显示出更新后的 title，是浏览器在惰性地格式化对象，这会让你以为追踪坏了。

从 React 18 开始，`mobx-react-lite` 也用 `useSyncExternalStore` 来传递通知，它维护一个全局版本号，每次变更就递增，好让 React 能在并发渲染期间安全地检测变化。

## Valtio

Valtio（同样出自 Daishi Kato）就是把 MobX 的读取追踪思路拿过来，围绕不可变快照重建的产物，而不可变快照恰好是 React 渲染起来最舒服的东西。

```tsx
import { proxy, useSnapshot } from 'valtio';

const state = proxy({ count: 0, text: 'hello' });

function Counter() {
  const snap = useSnapshot(state);
  return <button onClick={() => ++state.count}>{snap.count}</button>;
}
```

没有 action，没有 setter，也没有 selector，你在事件处理函数里写 `++state.count`，对应的组件就会更新。三个机制让这得以运作，它们层层叠加。

**写代理**。`proxy()` 把你的对象包进一个 `Proxy`，它的 `set` 陷阱在每次变更时触发，并递归地包裹嵌套对象，所以 `state.user.address.city = 'Berlin'` 也能被捕获。

**快照**。React 无法安全地渲染一个可能在渲染中途变化的可变对象，所以 Valtio 维护了第二份表示。`snapshot(state)` 产生一个不可变的、冻结的副本。

**读代理**。`useSnapshot` 并不直接把快照交给你。它把快照包进 *另一个* 代理，一个来自 `proxy-compare` 包的读取追踪代理，在你的组件渲染期间，这个代理记录你触碰的每一条属性路径，所以它知道组件读了 `snap.count`，完全没碰过 `snap.text`。

在下一次 store 变更时，Valtio 只在你访问过的路径上比较新旧快照，如果你读的东西没有变化，你的组件就不重渲染。

这种双对象设计确实造就了 Valtio 的头号问题。有一个用于写入的活代理和一个用于读取的快照，把它们搞混会适得其反。

```tsx
function Counter() {
  const snap = useSnapshot(state);

  return (
    <button
      onClick={() => {
        // 错误，snap 是冻结的，这会抛错（或静默失败）
        // snap.count++;

        // 正确，修改代理，读取快照
        if (state.count < 10) state.count++;
      }}
    >
      {snap.count}
    </button>
  );
}
```

经验法则是，在 render 中从快照读取，其他地方一律通过代理读写。而在这一切之下，`useSnapshot` 订阅写代理，并通过和其他所有人一样的那个 hook 把快照交给 React 的 `useSyncExternalStore`。

## useSyncExternalStore

让我们把这五个库和它们的三种哲学排一排。

Redux 和 Zustand 是带 selector 的发布/订阅 store，你告诉它们你读的是状态的哪一部分。

Jotai 是一张 atom 的依赖图，你直接订阅那些碎片，派生关系通过运行你的代码来追踪。

Valtio 和 MobX 是基于代理的，它们观察你读了哪些属性，并替你建立订阅。

但 store 是怎么知道你关心哪一部分的？除了前面提到的 Jotai 那个例外，它们都把答案通过同一个公开的 React hook 交给 React。

`useSyncExternalStore` 随 React 18 发布，顾名思义，它同步任何「外部 store」，也就是任何存在于 React 自己的 `useState` 和 `useReducer` 之外的状态来源。

```ts
const value = useSyncExternalStore(
  subscribe,          // 如何监听变化
  getSnapshot,        // 如何读取当前值
  getServerSnapshot,  // 服务端渲染期间返回什么
);
```

React 用回调调用 `subscribe`，store 承诺在任何东西变化时调用那个回调。然后 React 调用 `getSnapshot`，用 `Object.is` 把结果和上一次比较，如果值变了就重渲染组件。第三个参数是给服务端渲染用的。

服务器在没有浏览器、没有活的 store 的情况下把你的应用渲染成 HTML，浏览器随后下载那份 HTML，React 执行 hydration，把事件处理函数挂到已有的标记上，同时在内存中重新渲染整棵树并检查它是否匹配。（关于 hydration 的更多内容，看看我那篇深度文章 [Different hydration strategies](https://neciudan.dev/hydration-and-rendering-strategies)。）

但这个 hook 存在的真正原因，那个你无法在自己的代码里、在 React 之外干净解决的问题，是**撕裂（tearing）**。

从 React 18 开始，渲染是并发的，意味着 React 可以在渲染到树中间时暂停，去处理更紧急的事情，稍后再继续。

现在，想象我们有一个 `count = 5` 的 store。React 开始渲染，你的 `<Header>` 读取 store 并渲染出「5」。React 暂停。暂停期间，一个事件触发，store 更新为 6。React 从 store 渲染 `<Sidebar>`，显示「6」。

提交完成，用户看到的屏幕上，header 写着 5，sidebar 写着 6，而它们是同一次渲染、从同一个 store 渲染出来的。

这就是撕裂。

对于 React 自己的状态，这不会发生，因为 React 在每次渲染时给自己的状态拍快照，外部 store 不提供这种保证。`useSyncExternalStore` 修复了这一点。它检查在一次渲染进行期间 store 是否发生了变化，如果是，就强制用最新的、一致的值同步重渲染，在用户看到撕裂的那一帧之前。

但并发 React 有两个招牌特性，时间切片，把一次大渲染拆成块，让浏览器在中间保持响应，以及 transition，用 `startTransition` 把一次更新标记为非紧急，好让 React 在后台准备下一个界面的同时，保持当前界面可交互。

通过外部 store 进来的更新两者都享受不到。它们必须被同步应用，以维持我们刚才描述的一致性保证，所以 React 无法切片或降低它们的优先级。

外部 store 在并发 React 中是安全的，但它是二等公民。活在 *React 内部* 的状态可以被中断、降低优先级、切片，而外部状态不行。React 团队会告诉你，这就是尽可能把状态留在 React 内部的一个理由。

现在，Jotai 前面那个脚注就说得通了，这就是它拒绝做的取舍。通过 `useReducer` 而不是这个 hook 来订阅，Jotai 保住了 transition 和时间切片，代价是容忍了这个 hook 本来要防止的那种短暂不一致。

## 自己动手写一个

看过了每个库如何工作后，让我们自己来写一个。先写 store，你大概能凭记忆写出来。

```ts
export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const store = createStore({ count: 0, user: null as User | null });
```

这在 React 之外已经能用了。你可以在任何地方调用 `store.setState({ count: 1 })`，一个事件处理函数、一个 WebSocket 回调、一个测试，每个监听者都会听到。然后处理 React 那一侧。

```tsx
function useStore() {
  // reducer 的状态是一个一次性的计数器，递增它
  // 只是迫使 React 重渲染的标准技巧
  const [, forceRender] = useReducer((c) => c + 1, 0);

  useEffect(function subscribeToStore() {
    return store.subscribe(forceRender);
  }, []);

  return store.getState();
}
```

挂载时订阅，每次 store 变化就强制重渲染，渲染期间读取状态。它在顺境下能用，但有两个问题，一个明显，一个隐蔽。

隐蔽的那个是竞态条件。`useEffect` 在浏览器绘制之后运行，所以在你的组件渲染和订阅建立之间存在一个时间窗口。如果 store 在这个窗口内更新，比如来自另一个组件的 effect，这个组件已经渲染了旧状态，而且永远不会被告知新状态。它会一直卡在过期状态，直到别的事情再次更新 store。

### Selector

我们从 Redux 和 Zustand 知道了修复方法，让组件声明它读什么。

```tsx
function useStore<T>(selector: (state: StoreState) => T): T {
  const [selected, setSelected] = useState(() => selector(store.getState()));

  useEffect(function subscribeToStore() {
    return store.subscribe(() => {
      setSelected(selector(store.getState()));
    });
  }, []);

  return selected;
}

// 用法
const count = useStore((state) => state.count);
```

当新值和旧值 `Object.is` 相等时，`useState` 会跳过重渲染，所以 count 变化不再重渲染 user 组件。问题解决了，不过又引入了一个新 bug。

这个 effect 的依赖数组是空的，却使用了 render 作用域里的 `selector`，所以订阅永远捕获了这个组件第一次渲染时的那个 selector。传一个闭包捕获了 prop 的内联箭头函数，store 就会在 prop 早已变化之后还一直调用那个过期的版本。

```tsx
// `filter` 变了，但订阅仍然按旧值过滤
const todos = useStore((state) =>
  state.todos.filter((todo) => todo.status === filter)
);
```

行吧，那就把 `selector` 加进依赖数组。但内联箭头函数在每次渲染时都是一个全新的函数，所以现在 effect 会在组件的每次渲染时拆除并重新订阅。

我们用过期闭包换来了订阅抖动。你可以用一个始终持有最新 selector 的 ref 来逃脱，这大致就是 React 18 之前各库多年来的做法。

注意我们仍然没有解决的问题，上一节的挂载竞态还在，而且我们对撕裂毫无防御，因为我们的 hook 在 React 恰好调用它的任何时候读取 `store.getState()`，而并发 React 对那是什么时候不做任何承诺。

我们一步一步走到了 React 团队说「停，这部分我们来做」的那个点。

## useSyncExternalStore 出马

把整套逻辑用 `useSyncExternalStore` 换掉。

```tsx
function useStore<T>(selector: (state: StoreState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
```

订阅竞态没了，因为 React 在订阅之后会验证快照，如果在这段间隙里变了就重渲染。过期 selector 没了，因为 `getSnapshot` 在每次渲染时都是一个新闭包，所以它总是看到当前的 `selector` 和当前的 props。撕裂也被处理了，因为那正是这个 hook 存在的理由。

我们的自定义 store 现在并发安全、基于 selector，并且可以在任何组件里使用。那么显然，下一步就是再次把它弄坏。

## 无限循环

一次选两个值，任何讲道理的人最终都会这么干。

```tsx
const { count, user } = useStore((state) => ({
  count: state.count,
  user: state.user,
}));
```

打开控制台，你会得到 `Maximum update depth exceeded`，或者一条 React 警告，说 `getSnapshot` 的结果应该被缓存。组件在无限循环中重渲染。我们的 selector 每次调用都返回一个新的对象字面量。

React 用 `Object.is` 比较快照，而正如我们在 Zustand 那一节确立的，`Object.is` 检查的是两个值在内存里是不是同一个对象。一个新的 `{ count, user }` 字面量永远不可能是同一个，无论它看起来多相似。

于是 React 看到一个「变了」的快照，重渲染，再次调用 `getSnapshot`，又收到一个新对象，判断 store 又变了，如此往复，直到 React 报错。与其说这是 hook 的 bug，不如说这是它的硬性要求，快照必须在引用上稳定，除非真的变了，否则要返回同一个对象。

Zustand 的答案是相等函数，你用 `useShallow` 选择启用浅比较，它的意思是「把这个对象按一层深度比较，而不是按引用」。我们可以构建同样的东西，缓存上一次的结果，当里面没有任何东西变化时返回它。

```tsx
function useStore<T>(
  selector: (state: StoreState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is,
): T {
  // 把缓存包进一个对象，这样 selector 合法地
  // 返回 `undefined` 时不会看起来像空缓存
  const cache = useRef<{ value: T } | null>(null);

  const getSnapshot = () => {
    const next = selector(store.getState());

    if (cache.current && equalityFn(cache.current.value, next)) {
      return cache.current.value;
    }

    cache.current = { value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
```

这几乎逐行就是 Zustand 的 `useShallow` 所做的事，它包住你的 selector，在浅比较成立期间持续返回上一次的结果。

最后一步。Zustand 不要求你把 store 和 hook 分开定义，我们也不。

```tsx
export function create<T>(createState: (set, get) => T) {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  const getState = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  function useBoundStore<U>(
    // 默认 selector 返回整个状态，这个双重断言
    // 只是为了满足 TypeScript，它无法知道
    // 在不传 selector 时 U 和 T 是同一个类型
    selector: (state: T) => U = (s) => s as unknown as U,
    equalityFn: (a: U, b: U) => boolean = Object.is,
  ) {
    const cache = useRef<{ value: U } | null>(null);

    const getSnapshot = () => {
      const next = selector(getState());

      if (cache.current && equalityFn(cache.current.value, next)) {
        return cache.current.value;
      }

      cache.current = { value: next };
      return next;
    };

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  return Object.assign(useBoundStore, { getState, setState, subscribe });
}
```

```tsx
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>{count}</button>;
}
```

这就是 Zustand，大约五十行，零依赖，并发渲染安全。

关于我们留下的边缘场景，得老实提醒一下，我们的 `setState` 总是浅合并对象，所以它无法持有像普通数字这样的非对象状态，而且没有用于服务端渲染的 `getInitialState`。

真正的 Zustand 两者都处理了。

## 那么，我们需要它们吗？

那么，我们还需要状态管理库吗？

诚实地讲，对于一般应用来说，服务端缓存、URL 状态、局部状态，再加上五十行你完全理解的代码，就够用了。

对另一些应用，协作编辑器、设计工具，任何复杂客户端状态就是产品本身的东西，这些库仍然配得上它们的安装成本，因为它们需要处理复杂的边界情况。

Dan 在 2015 年构建了史上最成功的状态管理库，而在 2026 年他告诉我我们不再需要它了。

我认为他是对的。

## 参考资料

- [Zustand](https://github.com/pmndrs/zustand)
- [Redux: createStore](https://redux.js.org/api/createstore) 和 [Redux Toolkit](https://redux-toolkit.js.org/)
- [Dan Abramov: You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [Jotai: Core internals](https://jotai.org/docs/guides/core-internals)
- [Daishi Kato: Why useSyncExternalStore Is Not Used in Jotai](https://blog.axlight.com/posts/why-use-sync-external-store-is-not-used-in-jotai/)
- [Announcing Zustand v5](https://pmnd.rs/blog/announcing-zustand-v5/)
- [Daishi Kato: How Valtio Proxy State Works](https://blog.axlight.com/posts/how-valtio-proxy-state-works-react-part/)
- [MobX: Understanding reactivity](https://mobx.js.org/understanding-reactivity.html)
- [Photoroom: Picking a state management library for a React app used by millions](https://www.photoroom.com/inside-photoroom/picking-a-state-management-library-why-we-went-with-mobx-)
- [React docs: useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [TC39 Signals proposal](https://github.com/tc39/proposal-signals)
- [Component communication patterns in React](https://neciudan.dev/component-communication-patterns-in-react)

---

## 译者注

主要内容由 AI 辅助翻译，译者进行了后期润色和校对。

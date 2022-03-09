[TOC]

# VUE源码解读

## 一. 变化侦测篇

### 1. 数据驱动视图

​		数据发生改变，更新视图

### 2. 变化侦测

​		`Angular`：脏值检查流程

​		`React`：对比虚拟`DOM`

​		`Vue`：

### 3. `Observer`类（将`Object`转换为可观测的`Object`）

```js
/**
 * Observer类会通过递归的方式把一个对象的所有属性都转化成可观测对象
 */
export class Observer {
  constructor (value) {
    this.value = value
    // 给value新增一个__ob__属性，值为该value的Observer实例
    // 相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
    def(value,'__ob__',this)
    if (Array.isArray(value)) {
      // 当value为数组时的逻辑
      // ...
    } else {
      this.walk(value)
    }
  }
//调用walk将每一个属性转换成getter/setter的形式来侦测变化
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}
/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */
function defineReactive (obj,key,val) {
  // 如果只传了obj和key，那么val = obj[key]
  if (arguments.length === 2) {
    val = obj[key]
  }
  if(typeof val === 'object'){
      new Observer(val)//递归子属性，转换成getter/seter的形式来侦测变化
  }
  Object.defineProperty(obj, key, {
    enumerable: true,//可枚举的
    configurable: true,//可配置的
    get(){
      console.log(`${key}属性被读取了`);
      return val;
    },
    set(newVal){
      if(val === newVal){
          return
      }
      console.log(`${key}属性被修改了`);
      val = newVal;
    }
  })
}
```

### 4. 依赖收集

#### （1）依赖收集

将依赖该数据的叫做"依赖"，将这些”依赖“放入一个[依赖数组]里，当数据改变时，通知[依赖数组]里的每个”依赖“。

#### （2）何时收集、何时通知：

**在`getter`中收集依赖，在`setter`中通知依赖更新**。

#### （3）存放依赖

（依赖管理器）`Dep`类

```js
export default class Dep {
  constructor () {
    this.subs = []//初始化subs数组，存放依赖
  }

  addSub (sub) {
    this.subs.push(sub)
  }
  // 删除一个依赖
  removeSub (sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend () {
    if (window.target) {
      this.addSub(window.target)
    }
  }
  // 通知所有依赖更新
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

/**
 * Remove an item from an array
 */
export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
```

4. 有了依赖管理器，`getter`收集依赖，`setter`通知依赖

   ```js
   function defineReactive (obj,key,val) {
     if (arguments.length === 2) {
       val = obj[key]
     }
     if(typeof val === 'object'){
       new Observer(val)
     }
     const dep = new Dep()  //实例化一个依赖管理器，生成一个依赖管理数组dep
     Object.defineProperty(obj, key, {
       enumerable: true,
       configurable: true,
       get(){
         dep.depend()    // 在getter中收集依赖
         return val;
       },
       set(newVal){
         if(val === newVal){
             return
         }
         val = newVal;
         dep.notify()   // 在setter中通知依赖更新
       }
     })
   }
   ```

### 5. `watcher`类的实现

#### （1）`watcher`将自己设置到全局唯一的指定位置`window.target`  

#### （2）  读取数据 

#### （3）  触发`getter`  

#### （4） 在`getter`中就会从全局唯一的那个位置  读取当前正在读取数据的`Watcher`

#### （5）  `watcher`收集到依赖管理器`Dep`中

#### （6）  数据改变，通知依赖管理器`Dep`中的每个`Watcher`

```js
export default class Watcher {
  constructor (vm,expOrFn,cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }
  get () {
    window.target = this;//把实例自身赋给了全局的一个唯一对象window.target上
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    //获取一下被依赖的数据，获取被依赖数据的目的是触发该数据上面的getter
    window.target = undefined;
    return value
  }
  update () {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
const bailRE = /[^\w.$]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

------

## 二. 虚拟DOM篇

### 1.理解

  1. #### 是什么?          	

     用`js`对象来描述`DOM`节点

  2. #### 为什么？

     减少性能消耗。以`JS`的计算性能来换取操作真实`DOM`所消耗的性能

  3. #### 怎么做？

     不同的节点都是`VNode`的实例，只是传入属性参数不同

  4. #### 作用？

     记录数据变化后的`VNode`，`DOM-Diff`算法比较变化前后的`VNode`，找出差异，渲染对应的节点，更新视图。减少操作真实`DOM`，节省性能。

```js
<div class="a" id="b">我是内容</div>

{
  tag:'div',        // 元素标签
  attrs:{           // 属性
    class:'a',
    id:'b'
  },
  text:'我是内容',  // 文本内容
  children:[]       // 子元素
}
```

### 2. `VNode`类

```js

export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag                                /*当前节点的标签名*/
    this.data = data        /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.children = children  /*当前节点的子节点，是一个数组*/
    this.text = text     /*当前节点的文本*/
    this.elm = elm       /*当前虚拟节点对应的真实dom节点*/
    this.ns = undefined            /*当前节点的名字空间*/
    this.context = context          /*当前组件节点对应的Vue实例*/
    this.fnContext = undefined       /*函数式组件对应的Vue实例*/
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key  /*节点的key属性，被当作节点的标志，用以优化*/
    this.componentOptions = componentOptions   /*组件的option选项*/
    this.componentInstance = undefined       /*当前节点对应的组件的实例*/
    this.parent = undefined           /*当前节点的父节点*/
    this.raw = false         /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.isStatic = false         /*静态节点标志*/
    this.isRootInsert = true      /*是否作为跟节点插入*/
    this.isComment = false             /*是否为注释节点*/
    this.isCloned = false           /*是否为克隆节点*/
    this.isOnce = false                /*是否有v-once指令*/
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  get child (): Component | void {
    return this.componentInstance
  }
}

```

### 3. `DOM-Diff`算法       `Vue`中叫：`patch`（补丁）过程

#### （1）创建节点

```js
function createElm (vnode, parentElm, refElm) {
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      	vnode.elm = nodeOps.createElement(tag, vnode)   // 创建元素节点
        createChildren(vnode, children, insertedVnodeQueue) // 创建元素节点的子节点
        insert(parentElm, vnode.elm, refElm)       // 插入到DOM中
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text)  // 创建注释节点
      insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)  // 创建文本节点
      insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
    }
  }
```

#### （2）删除节点

```js
function removeNode (el) {
    const parent = nodeOps.parentNode(el)  // 获取父节点
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)  // 调用父节点的removeChild方法
    }
  }
```

#### （3）更新节点

```js
// 更新节点
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // vnode与oldVnode是否完全一样？若是，退出程序
  if (oldVnode === vnode) {
    return
  }
  const elm = vnode.elm = oldVnode.elm

  // vnode与oldVnode是否都是静态节点？若是，退出程序
  if (isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    return
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  // vnode有text属性？若没有：
  if (isUndef(vnode.text)) {
    // vnode的子节点与oldVnode的子节点是否都存在？
    if (isDef(oldCh) && isDef(ch)) {
      // 若都存在，判断子节点是否相同，不同则更新子节点
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    }
    // 若只有vnode的子节点存在
    else if (isDef(ch)) {
      /**
       * 判断oldVnode是否有文本？
       * 若没有，则把vnode的子节点添加到真实DOM中
       * 若有，则清空Dom中的文本，再把vnode的子节点添加到真实DOM中
       */
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    }
    // 若只有oldnode的子节点存在
    else if (isDef(oldCh)) {
      // 清空DOM中的子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    }
    // 若vnode和oldnode都没有子节点，但是oldnode中有文本
    else if (isDef(oldVnode.text)) {
      // 清空oldnode文本
      nodeOps.setTextContent(elm, '')
    }
    // 上面两个判断一句话概括就是，如果vnode中既没有text，也没有子节点，那么对应的oldnode中有什么就清空什么
  }
  // 若有text属性，vnode的text属性与oldVnode的text属性是否相同？
  else if (oldVnode.text !== vnode.text) {
    // 若不相同：则用vnode的text替换真实DOM的文本
    nodeOps.setTextContent(elm, vnode.text)
  }
}
```

#### （4）更新子节点

`VNode`					`newChildren`:[`newChild1`,`newChild2`,`newChild3`,...]

`oldVNode`			`oldChildren`:[`oldChild1`,`oldChild2`,`oldChild3`,...]

```js
for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  for (let j = 0; j < oldChildren.length; j++) {
    const oldChild = oldChildren[j];
    if (newChild === oldChild) {
      // ...
    }
  }
}
```

```js
if (isUndef(idxInOld)) {    // 如果在oldChildren里找不到当前循环的newChildren里的子节点
    // 新增节点并插入到合适位置
    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
} else {
    // 如果在oldChildren里找到了当前循环的newChildren里的子节点
    vnodeToMove = oldCh[idxInOld]
    // 如果两个节点相同
    if (sameVnode(vnodeToMove, newStartVnode)) {
        // 调用patchVnode更新节点
        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
        oldCh[idxInOld] = undefined
        // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动
        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        //等同于
        if(canMove){
    nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
}
    }
}
```

1. ##### 创建子节点（`oldChildren`没有的节点）

   ------**子节点合适的位置是所有未处理节点之前，而并非所有已处理节点之后**。

   

2. ##### 删除子节点（`oldChildren`有的节点）

   

3. ##### 移动子节点（`oldChildren`节点位置与`newChildren`不一样）

   ------**所有未处理节点之前就是我们要移动的目的位置**

   

4. ##### 更新节点（`oldChildren`有的节点）

   

#### （5）优化策略（子节点过多，时间复杂度太大）

![](C:\Users\dabe\Desktop\学习资料\更新节点优化策略.png)

新前旧前

新后旧后同理

![](C:\Users\dabe\Desktop\学习资料\新前新后.png)

新前旧后

新后旧前同理

![](C:\Users\dabe\Desktop\学习资料\新前旧后.png)

```js
// 循环更新子节点
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0               // oldChildren开始索引
    let oldEndIdx = oldCh.length - 1   // oldChildren结束索引
    let oldStartVnode = oldCh[0]        // oldChildren中所有未处理节点中的第一个
    let oldEndVnode = oldCh[oldEndIdx]   // oldChildren中所有未处理节点中的最后一个

    let newStartIdx = 0               // newChildren开始索引
    let newEndIdx = newCh.length - 1   // newChildren结束索引
    let newStartVnode = newCh[0]        // newChildren中所有未处理节点中的第一个
    let newEndVnode = newCh[newEndIdx]  // newChildren中所有未处理节点中的最后一个

    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    // 以"新前"、"新后"、"旧前"、"旧后"的方式开始比对节点
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // 如果oldStartVnode不存在，则直接跳过，比对下一个
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 如果新前与旧前节点相同，就把两个节点进行patch更新
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 如果新后与旧后节点相同，就把两个节点进行patch更新
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 如果新后与旧前节点相同，先把两个节点进行patch更新，然后把旧前节点移动到oldChilren中所有未处理节点之后
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 如果新前与旧后节点相同，先把两个节点进行patch更新，然后把旧后节点移动到oldChilren中所有未处理节点之前
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 如果不属于以上四种情况，就进行常规的循环比对patch
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        // 如果在oldChildren里找不到当前循环的newChildren里的子节点
        if (isUndef(idxInOld)) { // New element
          // 新增节点并插入到合适位置
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 如果在oldChildren里找到了当前循环的newChildren里的子节点
          vnodeToMove = oldCh[idxInOld]
          // 如果两个节点相同
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // 调用patchVnode更新节点
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      /**
       * 如果oldChildren比newChildren先循环完毕，
       * 那么newChildren里面剩余的节点都是需要新增的节点，
       * 把[newStartIdx, newEndIdx]之间的所有节点都插入到DOM中
       */
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      /**
       * 如果newChildren比oldChildren先循环完毕，
       * 那么oldChildren里面剩余的节点都是需要删除的节点，
       * 把[oldStartIdx, oldEndIdx]之间的所有节点都删除
       */
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
```

往中间循环

1. 如果`oldStartVnode`不存在，则直接跳过，将`oldStartIdx`加1，比对下一个

   ```js
   // 以"新前"、"新后"、"旧前"、"旧后"的方式开始比对节点
   while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
   	if (isUndef(oldStartVnode)) {
           oldStartVnode = oldCh[++oldStartIdx]
         }
   }
   ```

2. 如果`oldEndVnode`不存在，则直接跳过，将`oldEndIdx`减1，比对前一个

   ```js
   else if (isUndef(oldEndVnode)) {
       oldEndVnode = oldCh[--oldEndIdx]
   }
   ```

3. 如果新前与旧前节点相同，就把两个节点进行`patch`更新，同时`oldStartIdx`和`newStartIdx`都加1，后移一个位置

   ```js
   else if (sameVnode(oldStartVnode, newStartVnode)) {
       patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
       oldStartVnode = oldCh[++oldStartIdx]
       newStartVnode = newCh[++newStartIdx]
   }
   ```

   

4. 如果新前与旧前节点相同，就把两个节点进行`patch`更新，同时`oldStartIdx`和`newStartIdx`都加1，后移一个位置

   ```js
   else if (sameVnode(oldEndVnode, newEndVnode)) {
       patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
       oldEndVnode = oldCh[--oldEndIdx]
       newEndVnode = newCh[--newEndIdx]
   }
   ```

5. 如果新后与旧前节点相同，先把两个节点进行`patch`更新，然后把旧前节点移动到`oldChilren`中所有未处理节点之后，最后把`oldStartIdx`加1，后移一个位置，`newEndIdx`减1，前移一个位置

   ```js
   else if (sameVnode(oldStartVnode, newEndVnode)) {
       patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
       canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
       oldStartVnode = oldCh[++oldStartIdx]
       newEndVnode = newCh[--newEndIdx]
   }
   ```

6. 如果新前与旧后节点相同，先把两个节点进行`patch`更新，然后把旧后节点移动到`oldChilren`中所有未处理节点之前，最后把`newStartIdx`加1，后移一个位置，`oldEndIdx`减1，前移一个位置

   ```js
   else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
       patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
       canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
       oldEndVnode = oldCh[--oldEndIdx]
       newStartVnode = newCh[++newStartIdx]
   }
   ```

7. 如果不属于以上四种情况，就进行常规的循环比对`patch`

8. 如果在循环中，`oldStartIdx`大于`oldEndIdx`了，那就表示`oldChildren`比`newChildren`先循环完毕，那么`newChildren`里面剩余的节点都是需要新增的节点，把`[newStartIdx, newEndIdx]`之间的所有节点都插入到`DOM`中

   ```js
   if (oldStartIdx > oldEndIdx) {
       refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
       addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
   }
   ```

9. 如果在循环中，`newStartIdx`大于`newEndIdx`了，那就表示`newChildren`比`oldChildren`先循环完毕，那么`oldChildren`里面剩余的节点都是需要删除的节点，把`[oldStartIdx, oldEndIdx]`之间的所有节点都删除

   ```js
   else if (newStartIdx > newEndIdx) {
       removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
   }
   ```

------

## 三. 模板编译篇

### 1. 具体流程

1. 模板解析阶段：将一堆模板字符串用正则等方式解析成抽象语法树`AST`；
2. 优化阶段：遍历`AST`，找出其中的静态节点，并打上标记；
3. 代码生成阶段：将`AST`转换成渲染函数；

![](C:\Users\dabe\Desktop\学习资料\8.ad277be0.jpg)

```js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 模板解析阶段：用正则等方式解析 template 模板中的指令、class、style等数据，形成AST
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
  // 优化阶段：遍历AST，找出其中的静态节点，并打上标记；
  // optimize		静态标记节点
  // DOM-Diff 算法会直接跳过静态节点,减少比较过程，优化patch的性能
    optimize(ast, options)
  }
  // 代码生成阶段：将AST转换成渲染函数；
  // AST 转化成 render函数字符串
  // 得到render函数的字符串以及staticRenderFns 字符串
  const code = generate(ast, options)
  return {
    // 通过 generate处理 ast之后得到的返回值 code 是一个对象
    ast,//抽象语法树
    render: code.render,//渲染函数
    staticRenderFns: code.staticRenderFns//
  }
})
```

### 2. 模板解析阶段（解析器）

#### (1). 解析器种类：

1. HTML解析器--`parseHTML`(主线任务)
2. 文本解析器--`parseText`(支线)
3. 过滤器解析器--`parseFilters`(支线)

#### (2). HTML解析器--`parseHTML`(主线任务)

工作流程：一边解析不同的内容一边调用对应的钩子函数生成对应的`AST`节点，最终完成将整个模板字符串转化成`AST`

```js
export function parse(template, options) {
   // ...
  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    // 当解析到开始标签时，调用该函数创建结束标签AST节点
    start (tag, attrs, unary) {

    },
    // 当解析到结束标签时，调用该函数创建结束标签AST节点
    end () {

    },
    // 当解析到文本时，调用该函数创建文本AST节点
    chars (text: string) {

    },
    // 当解析到注释时，调用该函数创建注释AST节点
    comment (text: string) {

    }
  })
  return root
}
```

1. ##### 当解析到开始标签时

```js
// 当解析到标签的开始位置时，触发start
//标签名tag、标签属性attrs、标签是否自闭合unary
start (tag, attrs, unary) {
	let element = createASTElement(tag, attrs, currentParent)
}
//调用createASTElement函数来创建元素类型的AST节点
export function createASTElement (tag,attrs,parent) {
  return {
    type: 1,
    tag,//标签名
    attrsList: attrs,//标签属性
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  }
}
```

2. ##### 当解析到结束标签时

```js
//(tagName, start, end)结束标签名,结束标签在html字符串中的起始,结束位置
//第一种是三个参数都传递，用于处理普通的结束标签
//第二种是只传递tagName
//第三种是三个参数都不传递，用于处理栈中剩余未处理的标签
function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    // 在栈中寻找相同的标签，找到后break，记录pos
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // 如果tagName不存在，pos置为0
      pos = 0
    }

    if (pos >= 0) {
      // 栈顶位置从后向前遍历直到pos处
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
        //如果stack栈中存在索引大于pos的元素，缺少闭合标签，抛出警告
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`
          )
        }
        //立即将其闭合,保证解析结果的正确性
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // 把pos位置以后的元素都从stack栈中弹出，以及把lastTag更新为栈顶元素
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
      // pos<0即 没有找到对应的开始标签
      //浏览器会自动把</br>标签解析为正常的 <br>标签，而对于</p>浏览器则自动将其补全为<p></p>，所以Vue为了与浏览器对这两个标签的行为保持一致，故对这两个便签单独判断处理
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
```

3. ##### 当解析到文本时

```js
// 当解析到标签的文本时，触发chars
chars (text) {
	if(text是带变量的动态文本){
    // 创建动态文本类型的AST节点
    let element = {
      type: 2,
      expression: res.expression,
      tokens: res.tokens,
      text
    }
  } else {
    // 创建纯静态文本类型的AST节点
    let element = {
      type: 3,
      text
    }
  }
}
```

4. ##### 当解析到注释时

```js
// 当解析到标签的注释时，触发comment
comment (text: string) {
  let element = {
    type: 3,
    text,
    isComment: true
  }
}
```

​		4.1 解析普通注释

```js
const comment = /^<!\--/
if (comment.test(html)) {
  // 若为注释，则继续查找是否存在'-->'
  const commentEnd = html.indexOf('-->')

  if (commentEnd >= 0) {
    // 若存在 '-->',继续判断options中是否保留注释
    if (options.shouldKeepComment) {
      // 若保留注释，则把注释截取出来传给options.comment，创建注释类型的AST节点
      options.comment(html.substring(4, commentEnd))
    }
    // 若不保留注释，则将游标移动到'-->'之后，继续向后解析
    advance(commentEnd + 3)
    continue
  }
}

// advance函数是用来移动解析游标
function advance (n) {
  index += n   // index为解析游标
  html = html.substring(n)
}
```

​		4.2 解析条件注释

```js
// 解析是否是条件注释
const conditionalComment = /^<!\[/
if (conditionalComment.test(html)) {
  // 若为条件注释，则继续查找是否存在']>'
  const conditionalEnd = html.indexOf(']>')

  if (conditionalEnd >= 0) {
    // 若存在 ']>',则从原本的html字符串中把条件注释截掉，
    // 把剩下的内容重新赋给html，继续向后匹配
    advance(conditionalEnd + 2)
    continue
  }
}
```

​		4.3 解析DOCTYPE

```js
const doctype = /^<!DOCTYPE [^>]+>/i
// 解析是否是DOCTYPE
const doctypeMatch = html.match(doctype)
if (doctypeMatch) {
  advance(doctypeMatch[0].length)
  continue
}
```

​		4.4 解析开始标签

​			》解析标签属性

​			》解析标签是否闭合

```js
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/

function parseStartTag () {
  const start = html.match(startTagOpen)
  // '<div></div>'.match(startTagOpen)  => ['<div','div',index:0,input:'<div></div>']
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index
    }
    advance(start[0].length)
    let end, attr
    /**
     * <div a=1 b=2 c=3></div>
     * 从<div之后到开始标签的结束符号'>'之前，一直匹配属性attrs
     * 所有属性匹配完之后，html字符串还剩下
     * 自闭合标签剩下：'/>'
     * 非自闭合标签剩下：'></div>'
     */
    while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
      advance(attr[0].length)
      match.attrs.push(attr)
    }

    /**
     * 这里判断了该标签是否为自闭合标签
     * 自闭合标签如:<input type='text' />
     * 非自闭合标签如:<div></div>
     * '></div>'.match(startTagClose) => [">", "", index: 0, input: "></div>", groups: undefined]
     * '/><div></div>'.match(startTagClose) => ["/>", "/", index: 0, input: "/><div></div>", groups: undefined]
     * 因此，我们可以通过end[1]是否是"/"来判断该标签是否是自闭合标签
     */
    if (end) {
      match.unarySlash = end[1]
      advance(end[0].length)
      match.end = index
      return match
    }
  }
}
```

​			4.5 解析结束标签

```js
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const endTagMatch = html.match(endTag)

if (endTagMatch) {
    const curIndex = index
    advance(endTagMatch[0].length)
    parseEndTag(endTagMatch[1], curIndex, index)
    continue
}
```

​				4.6 解析结束标签

```js
let textEnd = html.indexOf('<')
// '<' 在第一个位置，为其余5种类型
if (textEnd === 0) {
    // ...
}
// '<' 不在第一个位置，文本开头
if (textEnd >= 0) {
    // 如果html字符串不是以'<'开头,说明'<'前面的都是纯文本，无需处理
    // 那就把'<'以后的内容拿出来赋给rest
    rest = html.slice(textEnd)
    while (
        !endTag.test(rest) &&//不是开始标签
        !startTagOpen.test(rest) &&//不是结束标签
        !comment.test(rest) &&//不是普通注释
        !conditionalComment.test(rest)//不是条件注释
    ) {
        // < in plain text, be forgiving and treat it as text
        /**
           * 用'<'以后的内容rest去匹配endTag、startTagOpen、comment、conditionalComment
           * 如果都匹配不上，表示'<'是属于文本本身的内容
           */
        // 在'<'之后查找是否还有'<'
        next = rest.indexOf('<', 1)
        // 如果没有了，表示'<'后面也是文本
        if (next < 0) break
        // 如果还有，表示'<'是文本中的一个字符
        textEnd += next
        // 那就把next之后的内容截出来继续下一轮循环匹配
        rest = html.slice(textEnd)
    }
    // '<'是结束标签的开始 ,说明从开始到'<'都是文本，截取出来
    text = html.substring(0, textEnd)
    advance(textEnd)
}
// 整个模板字符串里没有找到`<`,说明整个模板字符串都是文本
if (textEnd < 0) {
    text = html
    html = ''
}
// 把截取出来的text转化成textAST
if (options.chars && text) {
    options.chars(text)
}
```

#### (3). 文本解析器--`parseText`(支线)

- 判断传入的文本是否包含变量
- 构造expression
- 构造tokens

```js
// 当解析到标签的文本时，触发chars
chars (text) {
  if(res = parseText(text)){
       let element = {
           type: 2,
           expression: res.expression,
           tokens: res.tokens,
           text
       }
    } else {
       let element = {
           type: 3,
           text
       }
    }
}
```

```js
//parseHTML解析到的内容
let text = "我叫{{name}}，我今年{{age}}岁了"
//parseText解析后
let res = parseText(text)
res = {
    expression:"我叫"+_s(name)+"，我今年"+_s(age)+"岁了",
    tokens:[
        "我叫",
        {'@binding': name },
        "，我今年"
        {'@binding': age },
    	"岁了"
    ]
}
```

```js
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})
export function parseText (text,delimiters) {
  //检查文本中是否包含变量
  //没有传入delimiters，检测文本是否包含{{}}，传入了值，检测文本是否包含传入的值
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  //不包含变量直接返回
  if (!tagRE.test(text)) {
    return
  }
  //包含变量
  const tokens = []
  const rawTokens = []
  /**
   * let lastIndex = tagRE.lastIndex = 0
   * 上面这行代码等同于下面这两行代码:
   * tagRE.lastIndex = 0
   * let lastIndex = tagRE.lastIndex
   */
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  //exec( )方法是在一个字符串中执行匹配检索，没有找到任何匹配就返回null
  //tagRE.exec("hello {{name}}，I am {{age}}")
  //返回：["{{name}}", "name", index: 6, input: "hello {{name}}，I am   {{age}}", groups: undefined]
  //tagRE.exec("hello")
  //返回：null
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      // 先把'{{'前面的文本放入tokens中
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    // 取出'{{ }}'中间的变量exp
    const exp = parseFilters(match[1].trim())
    // 把变量exp改成_s(exp)形式也放入tokens中
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    // 设置lastIndex 以保证下一轮循环时，只从'}}'后面再开始匹配正则
    lastIndex = index + match[0].length
  }
  // 当剩下的text不再被正则匹配上时，表示所有变量已经处理完毕
  // 此时如果lastIndex < text.length，表示在最后一个变量后面还有文本
  // 最后将后面的文本再加入到tokens中
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }

  // 最后把数组tokens中的所有元素用'+'拼接起来
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

```

#### (4). 过滤器解析器--`parseFilters`(支线)

### 3. 优化阶段（优化器）

**目的**：提高虚拟`DOM`中`patch`过程的性能。将所有静态节点打上标记，`patch`过程可以跳过这些节点。

```js
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // 标记静态节点
  markStatic(root)
  // 标记静态根节点
  markStaticRoots(root, false)
}
```

#### (1). 标记静态节点

```javascript
function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // 包含变量的动态文本节点
    return false
  }
  if (node.type === 3) { // 不包含变量的纯文本节点
    return true
  }
  return !!(node.pre || (//节点使用了v-pre指令，那就断定它是静态节点
    !node.hasBindings && // 不能使用动态绑定语法，，没有v-，@，：
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // 不能是内置组件
    isPlatformReservedTag(node.tag) && // 标签名必须是平台保留标签，即不能是组件
    !isDirectChildOfTemplateFor(node) &&//当前节点的父节点不能是带有 v-for 的 template 标签；
    Object.keys(node).every(isStaticKey)
    //所有属性的 key 都必须是静态节点才有的 key
    //静态节点key:type,tag,attrsList,attrsMap,plain,parent,children,attrs
  ))
}
```

```js
function markStatic (node: ASTNode) {
  node.static = isStatic(node)
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        node.static = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}
```

### 4. 代码生成阶段（代码生成器）

#### 核心逻辑：

```js
export function generate (ast,option) {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}
```

#### `genElement`函数定义：

```js
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      const data = el.plain ? undefined : genData(el, state)

      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    return code
  }
}
```

#### 4.1 元素节点

```js
const data = el.plain ? undefined : genData(el, state)

const children = el.inlineTemplate ? null : genChildren(el, state, true)
code = `_c('${el.tag}'${
data ? `,${data}` : '' // data
}${
children ? `,${children}` : '' // children
})`
```

1. 获取节点属性data

   ```js
   export function genData (el: ASTElement, state: CodegenState): string {
     let data = '{'
     const dirs = genDirectives(el, state)
     if (dirs) data += dirs + ','
   
       // key
       if (el.key) {
           data += `key:${el.key},`
       }
       // ref
       if (el.ref) {
           data += `ref:${el.ref},`
       }
       if (el.refInFor) {
           data += `refInFor:true,`
       }
       // pre
       if (el.pre) {
           data += `pre:true,`
       }
       // 篇幅所限，省略其他情况的判断
       data = data.replace(/,$/, '') + '}'
       return data
   }
   ```

2. 获取子节点列表children

   ```js
   export function genChildren (el):  {
       if (children.length) {
           return `[${children.map(c => genNode(c, state)).join(',')}]`
       }
   }
   function genNode (node: ASTNode, state: CodegenState): string {
     if (node.type === 1) {
       return genElement(node, state)
     } if (node.type === 3 && node.isComment) {
       return genComment(node)
     } else {
       return genText(node)
     }
   }
   
   ```

3. 生成`_c（）`函数调用字符串

   ```js
   code = `_c('${el.tag}'${
           data ? `,${data}` : '' // data
         }${
           children ? `,${children}` : '' // children
         })`
   ```

#### 4.2 文本节点

```js
export function genText (text: ASTText | ASTExpression): string {
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}
```

#### 4.3 注释节点

```js
export function genComment (comment: ASTText): string {
  return `_e(${JSON.stringify(comment.text)})`
}
```

------

## 四. 实例方法篇

### 数据相关方法

1. vm.$watch
2. vm.$set
3. vm.$delete

### 事件相关方法

### 生命周期方法



























------

## 五. 全局API篇（12个）

### 1. `Vue.extend`

1. #### 作用

   使用基础`Vue`构造器，创建一个“子类”。参数是一个包含组件选项的对象。

   ```js
   <div id="mount-point"></div>
   
   // 创建构造器
   var Profile = Vue.extend({
     template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
     data: function () {
       return {
         firstName: 'Walter',
         lastName: 'White',
         alias: 'Heisenberg'
       }
     }
   })
   // 创建 Profile 实例，并挂载到一个元素上。
   new Profile().$mount('#mount-point')
   
   <p>Walter White aka Heisenberg</p>
   ```

2. #### 原理

   ```js
   Vue.extend = function (extendOptions: Object): Function {
       extendOptions = extendOptions || {}//用来包含组件选项的对象
       const Super = this
       //父类的cid属性，无论是基础Vue类还是从基础Vue类继承而来的类，都有一个cid属性，作为该类的唯一标识；
       const SuperId = Super.cid
       const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})//缓存池，用于缓存创建出来的类
       if (cachedCtors[SuperId]) {
           return cachedCtors[SuperId]
       }
   
       const name = extendOptions.name || Super.options.name
       if (process.env.NODE_ENV !== 'production' && name) {
           validateComponentName(name)
       }
   
       const Sub = function VueComponent (options) {
           this._init(options)
       }
       Sub.prototype = Object.create(Super.prototype)
       Sub.prototype.constructor = Sub
       Sub.cid = cid++
       Sub.options = mergeOptions(
           Super.options,
           extendOptions
       )
       Sub['super'] = Super
   
       if (Sub.options.props) {
           initProps(Sub)
       }
       if (Sub.options.computed) {
           initComputed(Sub)
       }
   
       // allow further extension/mixin/plugin usage
       Sub.extend = Super.extend
       Sub.mixin = Super.mixin
       Sub.use = Super.use
   
       // create asset registers, so extended classes
       // can have their private assets too.
       ASSET_TYPES.forEach(function (type) {
           Sub[type] = Super[type]
       })
       // enable recursive self-lookup
       if (name) {
           Sub.options.components[name] = Sub
       }
   
       Sub.superOptions = Super.options
       Sub.extendOptions = extendOptions
       Sub.sealedOptions = extend({}, Sub.options)
   
       // cache constructor
       cachedCtors[SuperId] = Sub
       return Sub
   }
   ```

   







### 2. `Vue.nextTick`

### 3. `Vue.set`

### 4. `Vue.delete`

### 5. `Vue.directive`

### 6. `Vue.filter`

### 7. `Vue.component`

### 8. `Vue.use`

### 9. `Vue.mixin`

### 10. `Vue.observable`

### 11. `Vue.version`













------

## 六. 生命周期篇

### 生命周期大致分为四个阶段：① 初始化阶段   ②模板编译阶段 ③挂载阶段 ④销毁阶段

### 1.初始化阶段

#### （1）`new Vue()`

主要逻辑：合并配置，调用一些初始化函数，触发生命周期钩子函数，调用`$mount`开启下一个阶段。

创建一个Vue实例---》执行`Vue`的构造函数--》执行`_init`方法

```js
function Vue (options) {
/* process.env.NODE_ENV：当前所处的开发阶段
*	生产阶段  production
*	开发阶段  develop
*/    
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
    //调用原型上的_init(options)方法并把用户所写的选项options传入
  this._init(options)
}
```

```js
//`this._init(options)`方法来源：
initMixin(Vue)
```

```js
export function initMixin (Vue) {
    // 给Vue类的原型上绑定_init方法
  Vue.prototype._init = function (options) {
   	// 将vue实例赋值给vm
      const vm = this
    /* 将用户传递的options选项与当前构造函数的options属性及其父级构造函数options属性进行合并
    *得到一个新的options选项赋值给$options属性
    *并将$options属性挂载到Vue实例上
    */
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
/**********************mergeOptions定义***************************************/
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {

  if (typeof child === 'function') {
    child = child.options
  }
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}//创建一个空对象options
  let key
  for (key in parent) {//遍历 parent
    mergeField(key)//调用 mergeField函数合并到空对象options
  }
  for (key in child) {//遍历 child
    if (!hasOwn(parent, key)) {//不在 parent中 的属性
      mergeField(key)//调用 mergeField函数合并到空对象options
    }
  }
    //这里值得一提的是 mergeField 函数，它不是简单的把属性从一个对象里复制到另外一个对象里，而是根据被合并的不同的选项有着不同的合并策略。例如，对于data有data的合并策略，即该文件中的strats.data函数；对于watch有watch的合并策略，即该文件中的strats.watch函数等等。
   *********************************************
   * 	//这就是设计模式中非常典型的  策略模式。      *
   *********************************************   
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
/************resolveConstructorOptions(vm.constructor)**********************/
      //resolveConstructorOptions(vm.constructor)的 返回值 和 options 合并
      //             ||
      //vm.constructor.options  ≈ Vue.options
/********************************Vue.options定义****************************/
      export function initGlobalAPI (Vue: GlobalAPI) {
  		// ...
  		Vue.options = Object.create(null)//创建一个空对象
 	 	ASSET_TYPES.forEach(type => {//遍历 ASSET_TYPES
    		Vue.options[type + 's'] = Object.create(null)
            //遍历结果：
            //Vue.options.components = {}
			//Vue.options.directives = {}
			//Vue.options.filters = {}
  		})
		//扩展内置组件到Vue.options.components
          	//内置组件： <keep-alive>
      		//			<transition> 
            //			<transition-group>
  		extend(Vue.options.components, builtInComponents)
  		// ...
		}
/***********************ASSET_TYPES定义***************************************/ 
      export const ASSET_TYPES = [
  		'component',
  		'directive',
  		'filter'
		]
/***************************************************************************/
    vm._self = vm
    initLifecycle(vm)// 初始化生命周期
    initEvents(vm)// 初始化事件
    initRender(vm)// 初始化渲染
    callHook(vm, 'beforeCreate')// 调用生命周期钩子函数
    initInjections(vm) //初始化injections
    initState(vm)// 初始化props,methods,data,computed,watch
    initProvide(vm) // 初始化 provide
    callHook(vm, 'created')// 调用生命周期钩子函数
	
	
      /*判断用户是否传入了el选项，如果传入了则调用$mount函数进入模板编译与挂载阶段*/
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
      /*如果没有传入el选项，则不进入下一个生命周期阶段，需要用户手动执行vm.$mount方法才进入下一个生命周期阶段
	*/
  }
}
```

```js
//生命周期钩子函数的合并策略
function mergeHook (parentVal,childVal):  {		
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}												
//function mergeHook (parentVal,childVal):  {
// if (childVal) {
//   if (parentVal) {
//     return parentVal.concat(childVal)
//   } else {
//     if (Array.isArray(childVal)) {
//       return childVal
//     } else {
//       return [childVal]
//     }
//   }
// } else {
//   return parentVal
// }
//}
//一旦 parent 和 child 都定义了相同的钩子函数，那么它们会把 2 个钩子函数合并成一个数组。
//当Vue.mixin和用户在实例化Vue时，如果设置了同一个钩子函数，那么在触发钩子函数时，就需要同时触发这个两个函数，所以转换成数组就是为了能在同一个生命周期钩子列表中保存多个钩子函数
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/******************************************************************/
//生命周期
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]
```

```js
// callHook函数如何触发钩子函数
export function callHook (vm: Component, hook: string) {
    //从实例的$options中获取到需要触发的钩子名称所对应的钩子函数数组handlers
  const handlers = vm.$options[hook]
  if (handlers) {
      //遍历该数组，将数组中的每个钩子函数都执行一遍
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
}
```

------

#### （2）`initLifecycle`函数：初始化属性（$外部属性、_内部属性）

```js
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // 实例上挂载$parent属性
  let parent = options.parent
  //如果当前组件不是抽象组件并且存在父级
  if (parent && !options.abstract) {
    //当前组件的父级是抽象组件并且也存在父级,继续向上查找当前组件父级的父级
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    //把该实例自身添加进找到的父级的$children属性
    parent.$children.push(vm)
  }
  //直到找到第一个不是抽象类型的父级时，将其赋值vm.$parent
  vm.$parent = parent
  /*这样就确保了在子组件的$parent属性上能访问到父组件实例，在父组件的$children属性上也能访问子组件的实例。*/  
    
  //给实例上挂载$root属性
  //$root  :当前实例的根实例
  //实例的根实例 = 存在父级？父级的跟实例 ： 它自己
  vm.$root = parent ? parent.$root : vm
  /* 初始化赋值 */
  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

```

------

#### （3）`initEvents`函数：初始化实例的事件系统（`v-on`、`@`自定义事件、`.native`浏览器原生事件）

​		①解析事件————`processAttrs` 方法解析属性

```js
export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:/

function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, value, modifiers
  for (i = 0, l = list.length; i < l; i++) {
    name  = list[i].name
    value = list[i].value
    // if属性是指令 
    if (dirRE.test(name)) {
      // 解析修饰符
      modifiers = parseModifiers(name)
      // if 修饰符  
      if (modifiers) {
        //   
        name = name.replace(modifierRE, '')
      }
      //if 事件指令
      if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers, false, warn)
      }
    }
  }
}
///////addHandler(el, name, value, modifiers, false, warn)/////
export function addHandler (el,name,value,modifiers) {
  modifiers = modifiers || emptyObject

  // check capture modifier 判断是否有capture修饰符
  if (modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // 给事件名前加'!'用以标记capture修饰符
  }
  // 判断是否有once修饰符
  if (modifiers.once) {
    delete modifiers.once
    name = '~' + name // 给事件名前加'~'用以标记once修饰符
  }
  // 判断是否有passive修饰符
  if (modifiers.passive) {
    delete modifiers.passive
    name = '&' + name // 给事件名前加'&'用以标记passive修饰符
  }

  let events
  //浏览器原生事件 or 自定义事件
  if (modifiers.native) {
    delete modifiers.native
      //浏览器原生事件
    events = el.nativeEvents || (el.nativeEvents = {})
  } else {
      //自定义事件
    events = el.events || (el.events = {})
  }

  const newHandler: any = {
    value: value.trim()
  }
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers
  }

  const handlers = events[name]
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }

  el.plain = false
}
```

------

#### （4）`initInjections`函数：初始化`inject`选项（祖先组件向所有子孙组件注入依赖）

------

#### （5）`initState`函数：初始化状态（`props`、`data`、`methods`、`computed`、`watch`）

------

### 2.模板编译阶段

#### 	（1）两种$mount方法对比(运行时版      完整版)

```js
//运行时版
//$mount方法内部获取到DOM元素--直接调用mountComponent函数进行挂载操作
Vue.prototype.$mount = function (el,hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};
```

```js
//完整版
// ① 先将Vue原型上的$mount方法先缓存起来，记作变量mount，将模板编译
// ② 然后等模板编译完成，再执行mount方法进入挂载阶段。
var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el,hydrating) {
  // 省略获取模板及编译代码

  return mount.call(this, el, hydrating)
}
```

#### 	（2）完整版的vm.$mount方法分析

​	工作：从用户传入的`el`选项和`template`选项中获取到用户传入的内部或外部模板，然后将获取到的模板编译成渲染函数。

```js
var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el,hydrating) {
  el = el && query(el);
  //因为Vue会将模板中的内容替换el对应的DOM元素，如果是body或html元素时，替换之后将会破坏整个DOM文档，所以不允许el是body或html。
  if (el === document.body || el === document.documentElement) {
    warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // 在用户没有手写render函数的情况下获取传入的模板template
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
          if (template.charAt(0) === '#') {//id选择符
            template = idToTemplate(template);
              /*var idToTemplate = cached(function (id) {
  				var el = query(id);
  				return el && el.innerHTML
				});*/
            /* istanbul ignore if */
            if (!template) {
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
          //DOM元素
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
          //既不是字符串，也不是DOM元素，此时会抛出警告
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
        //用户没有传入template选项，根据el参数调用getOuterHTML函数获取外部模板
    } else if (el) {
      template = getOuterHTML(el);
    }
      /*
  	function getOuterHTML (el) {
  		if (el.outerHTML) {
    		return el.outerHTML
 	 		} else {
    	var container = document.createElement('div');
    	container.appendChild(el.cloneNode(true));
    	return container.innerHTML
  		}
	}
      */
    if (template) {
      if (config.performance && mark) {
        mark('compile');
      }
	  //把模板编译成渲染函数
      var ref = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      if (config.performance && mark) {
        mark('compile end');
        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};
```

------

### 3.挂载阶段

工作：①创建`Vue`实例并用其替换`el`选项对应的`DOM`元素，

​			②同时还要开启对模板中数据（状态）的监控，当数据（状态）发生变化时通知其依赖进行视图更新。

#### 	挂载阶段分析（$mount）

```js
Vue.prototype.$mount = function (el,hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

export function mountComponent (vm,el,hydrating) {
    vm.$el = el
    //不存在渲染函数
    if (!vm.$options.render) {
        //创建一个注释类型的VNode节点
        vm.$options.render = createEmptyVNode
    }
    //触发生命周期钩子函数
    callHook(vm, 'beforeMount')
	//正式开始执行挂载操作
    let updateComponent

    updateComponent = () => {
        //vm._render()   得到最新VNode节点树
        //vm._update()	 新  旧节点树  比较，更新，完成渲染
        vm._update(vm._render(), hydrating)
    }
    //数据监控
    new Watcher(
        vm, 				//第一个参数
        //
        updateComponent,	//第二个参数
        // 执行函数=>触发getter方法=>将watcher实例添加到依赖列表=>数据改变通知依赖=>依赖收到通知=>依赖调用第四个参数回调函数更新视图
        noop, 				//第三个参数
        //
        {					//第四个参数
        //
        before () {
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate')
            }
        }
    }, true /* isRenderWatcher */)
    hydrating = false

    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
}
```

------

### 4.销毁阶段

工作：将当前的`Vue`实例从其父级实例中删除，取消当前实例上的所有依赖追踪并且移除实例上的所有事件监听器。

#### 销毁阶段分析（$destroy）

```js
Vue.prototype.$destroy = function () {
  const vm: Component = this
    //是否处于正在被销毁的状态
  if (vm._isBeingDestroyed) {
    return//结束当前销毁，防止反复执行销毁逻辑
  }
    //触发生命周期钩子函数
  callHook(vm, 'beforeDestroy')
    //正在被销毁的状态
  vm._isBeingDestroyed = true
  // 当前的Vue实例从其父级实例中删除
  const parent = vm.$parent
  //父级存在  &&   父级没有处于被销毁状态  &&  不是抽象组件
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      //当前实例从其父级实例的$children属性中删除
    remove(parent.$children, vm)
  }
    //将自己从父级删除后，开始删除自己的时间监听和依赖追踪
  // 依赖追踪   1.自己依赖别人  2.别人依赖自己
  if (vm._watcher) {
      //实例自身从其他数据的依赖列表中删除
      //teardown()作用：		从所有依赖向的Dep列表中将自己删除
    vm._watcher.teardown()
  }
    //所有实例内的数据对其他数据的依赖都在实例的_watchers属性中
  let i = vm._watchers.length
  while (i--) {
     //遍历_watchers,每一个watcher都调用teardown方法
    vm._watchers[i].teardown()
  }
  // 移除实例内响应式数据的引用
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }
  // 当前实例已经被销毁
  vm._isDestroyed = true
  // 将实例的VNode树设置为null
  vm.__patch__(vm._vnode, null)
  // 触发生命周期钩子函数
  callHook(vm, 'destroyed')
  // turn off all instance listeners.移除实例上的所有事件监听器
  vm.$off()
  // remove __vue__ reference。移除一些相关属性的引用
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  // release circular reference (##6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```

------

## 七. 指令篇

## 八. 过滤器篇

### 1. 使用方式

```js
<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 `v-bind` 中 -->
<div v-bind:id="rawId | formatId"></div>
```

### 2. 定义方法

1. #### 全局过滤器

```js
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})
```

2. #### 局部过滤器

```js
filters: {
  capitalize: function (value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}
```

### 3. 串联过滤器

```js
{{ message | filterA | filterB|... }}
```

### 4. resolveFilter函数分析

1. ##### `'capitalize'`过滤器

2. ##### 模板编译成渲染函数字符串`_f("capitalize")(message)`

3. ##### 对应的是`resolveFilter()`函数

4. #### 函数源码解析

```js
import { identity, resolveAsset } from 'core/util/index'

export function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
```

​																			||

​																			 V

```js
export const identity = _ => _

//options 	实例的属性
//type		filters
//id		当前过滤器的id
export function resolveAsset (options,type,id,warnMissing) {
  //判断传入的参数id是否为字符串类型，不是的话，退出程序
  if (typeof id !== 'string') {
    return
  }
  //获取当前实例的所有过滤器，赋值给assets
  const assets = options[type]
  // 先从本地注册中查找,hasOwn函数检查自身中是否存在
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)//id转换为驼峰式
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]//再次查找,存在返回
  const PascalCaseId = capitalize(camelizedId)//首字母大写
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]//再次查找,存在返回
  // 再从原型链中查找
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  //非生产环境，不存在，抛出警告
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
/*
camelize()		转为驼峰式
capitalize()	转为首字母大写
*/
```

### 5. 过滤器解析器(`parseFilters`)

1. #### 写在v-bind表达式里

   属于存在于标签属性，写在该处的过滤器就需要在处理标签属性时进行解析。

   在`HTML`解析器`parseHTML`函数中负责处理标签属性的函数是`processAttrs`，所以会在`processAttrs`函数中调用过滤器解析器`parseFilters`函数对写在该处的过滤器进行解析

```js

function processAttrs (el) {
    // 省略无关代码...
    if (bindRE.test(name)) { // v-bind
        // 省略无关代码...
        value = parseFilters(value)
        // 省略无关代码...
    }
    // 省略无关代码...
}
```

2. #### 写在双花括号中

   属于存在于标签文本，写在该处的过滤器就需要在处理标签文本时进行解析。

   在`HTML`解析器`parseHTML`函数中，当遇到文本信息时会调用`parseHTML`函数的`chars`钩子函数，在`chars`钩子函数内部又会调用文本解析器`parseText`函数对文本进行解析，而写在该处的过滤器它就是存在于文本中，所以会在文本解析器`parseText`函数中调用过滤器解析器`parseFilters`函数对写在该处的过滤器进行解析

```js
export function parseText (text,delimiters){
    // 省略无关代码...
    const exp = parseFilters(match[1].trim())
    // 省略无关代码...
}
```

3. ### parseFilters函数分析

```js
export function parseFilters (exp) {
  let inSingle = false                     // exp是否在 '' 中
  let inDouble = false                     // exp是否在 "" 中
  let inTemplateString = false             // exp是否在 `` 中
  let inRegex = false                      // exp是否在 \\ 中
  
  let curly = 0
  // 在exp中发现一个 { 则curly加1，
  //发现一个 } 则curly减1，直到culy为0 说明 { ... }闭合
  
  let square = 0
  // 在exp中发现一个 [ 则curly加1，
  //发现一个 ] 则curly减1，直到culy为0 说明 [ ... ]闭合
  
  let paren = 0
  // 在exp中发现一个 ( 则curly加1，
  //发现一个 ) 则curly减1，直到culy为0 说明 ( ... )闭合
  
  let lastFilterIndex = 0
  //解析游标，每循环过一个字符串游标加1
  
  let c, prev, i, expression, filters

  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
      //0x5C \ 反斜杠
    if (inSingle) {
      //0x27 ' 闭单引号    //单引号''
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      //0x22 " 双引号 		//双引号""
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      //0x60 ` 开单引号		//模板字符串``
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      //0x2f / 正斜杠		//正则表达式\\
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && 
      //0x7C | 垂线		// pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // 发现第一个过滤器
        lastFilterIndex = i + 1
        //将待处理的表达式，将其存储在 expression 中
        expression = exp.slice(0, i).trim()
      } else {//发现后续的过滤器
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  function pushFilter () {
    //将第一个过滤器添加进来排列filters中
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }
//message | filter1 | filter2(arg)
//结果： expression = message
//		filters = ['filter1','filter2(arg)']
  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  //没有括号（，说明没有接受参数
  if (i < 0) {
    //构造_f函数，调用字符串：_f("filter1")(message)
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
    //返回_f("filter1")(message)，赋给expression
  } else {
    //有括号，接收参数，字符串拼接
    const name = filter.slice(0, i)//filter1
    const args = filter.slice(i + 1)//arg
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
    //返回_f("filter1")(message,args)
  }
}
```

------

## 九. 内置组件篇

### 1. 用法

```js
<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>
<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>
<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>


```

### 2.源码解读

```js
export default {
  name: 'keep-alive',//默认输出组件名称
  abstract: true,//此类必须被继承使用,不可生成对象

  props: {
    include: [String, RegExp, Array],//匹配到的含有相关字符串、正则、数组的组件会被缓存
    exclude: [String, RegExp, Array],//匹配到的含有相关字符串、正则、数组的组件都不会被缓存
    max: [String, Number]//最多缓存组件的数量，缓存的是vnode对象，持有DOM，占用内存
  },

  created () {
    /*初始化一个干净的对象属性，用来存储需要缓存的组件
    this.cache = {
    'key1':'组件1',
    'key2':'组件2',
     ...
	}
    */
    this.cache = Object.create(null)
    /*存储每个需要缓存的组件的`key`,对应this.cache对象的键值*/
    this.keys = []
  },
/*当<keep-alive>组件被销毁时，会调用destroyed钩子函数 */
  destroyed () {
   /* 遍历之前创建的this.cache对象 */
    for (const key in this.cache) {
   /* 遍历之前创建的this.cache对象 */
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
/* pruneCacheEntry函数
	function pruneCacheEntry(cache,key,keys,current){
		const cached = cache[key]
		// 判断当前没有处于被渲染状态的组件，将其销毁
		// current tag：当前的  标签名
  		if (cached && (!current || cached.tag !== current.tag)) {
  		// VNode类的属性：componentInstance 当前节点对应的组件实例  销毁
    	cached.componentInstance.$destroy()
  		}
  		//将其从this.cache对象中剔除
  		cache[key] = null
  		remove(keys, key)
	}
*/
/* 在 mounted 钩子函数中观测 include 和 exclude 的变化 */
  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },
/* pruneCache函数
	function pruneCache (keepAliveInstance, filter) {
  		const { cache, keys, _vnode } = keepAliveInstance
  		for (const key in cache) {   //对this.cache对象进行遍历
    	const cachedNode = cache[key]
    		if (cachedNode) {
    		//取出每一项的name值，将其与新的缓存规则进行匹配
      		const name = getComponentName(cachedNode.componentOptions)
      			if (name && !filter(name)) {//新的缓存规则下该组件已经不需要被缓存
        			pruneCacheEntry(cache, key, keys, _vnode)//销毁不需要的组件
      			}			
    		}
  		}
	}
	
	function pruneCacheEntry(cache,key,keys,current){
		const cached = cache[key]
		// 判断当前没有处于被渲染状态的组件，将其销毁
		// current tag：当前的  标签名
  		if (cached && (!current || cached.tag !== current.tag)) {
  		// VNode类的属性：componentInstance 当前节点对应的组件实例  销毁
    	cached.componentInstance.$destroy()
  		}
  		//将其从this.cache对象中剔除
  		cache[key] = null
  		remove(keys, key)
	}
*/
  render() {
    /* 获取默认插槽中的第一个组件节点 */
    const slot = this.$slots.default//默认插槽
    const vnode = getFirstComponentChild(slot)
    /* 获取该组件节点的组件选项：componentOptions */
    const componentOptions = vnode && vnode.componentOptions

    if (componentOptions) {
      /* 获取该组件节点的名称 */
      const name = getComponentName(componentOptions)
		/* 优先获取组件的name字段，如果name不存在则获取组件的tag 
		function getComponentName (opts: ?VNodeComponentOptions): ?string {
  			return opts && (opts.Ctor.options.name || opts.tag)
		}  
		*/
      /* 规则匹配 */
      const { include, exclude } = this
      /* 如果name不在inlcude中或者存在于exlude中则表示不缓存，直接返回vnode */
      if (
          /*如果name不在inlcude中*/
        (include && (!name || !matches(include, name))) ||
        // excluded
          /*如果name在exclude中*/
        (exclude && name && matches(exclude, name))
      ) {
         /* 表示不缓存，直接返回vnode */
        return vnode
      }
	/* */
      const { cache, keys } = this
      /* 获取组件的key */
      const key = vnode.key == null? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : ''): vnode.key
      /* 拿到key值后去this.cache对象中去寻找是否有该值，如果有则表示该组件有缓存，即命中缓存：则直接从缓存中拿 vnode 的组件实例 */
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // 调整该组件key的顺序，将其从原来的地方删掉并重新放在最后一个
        remove(keys, key)
        keys.push(key)
       /* 如果this.cache中没有key值，则将其设置进去缓存 */
      } else {
        cache[key] = vnode
        keys.push(key)
        // 如果配置了max并且缓存的长度超过了this.max，则从缓存中删除第一个
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }
        /*缓存淘汰策略LRU：
     LRU（Least recently used，最近最少使用）算法根据数据的历史访问记录来进行淘汰数据，其核心思想是“如果数据最近被访问过，那么将来被访问的几率也更高”。 
     LRU的核心思想是如果数据最近被访问过，那么将来被访问的几率也更高，所以我们将命中缓存的组件key重新插入到this.keys的尾部，这样一来，this.keys中越往头部的数据即将来被访问几率越低，所以当缓存数量达到最大值时，我们就删除将来被访问几率最低的数据，即this.keys中第一个缓存的组件。这也就之前加粗强调的已缓存组件中最久没有被访问的实例会被销毁掉的原因所在。
		*/
		/* 最后设置keepAlive标记位 */
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

### 3.**组件一旦被 `<keep-alive>` 缓存，那么再次渲染的时候就不会执行 `created`、`mounted` 等钩子函数，**但是我们很多业务场景都是希望在我们被缓存的组件再次被渲染的时候做一些事情，好在`Vue` 提供了 `activated`和`deactivated` 两个钩子函数，它的执行时机是：

`activated` ：`<keep-alive>`包裹的组件激活时调用

`deactivated`：`<keep-alive>`包裹的组件停用时调用
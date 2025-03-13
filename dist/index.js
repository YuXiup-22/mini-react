"use strict";
function Aaa(props) {
    const { a } = props;
    console.log(a);
    return 'c';
}
const content = miniReact.createElement("div", null,
    miniReact.createElement("a", { href: "xxx" }, "link"),
    miniReact.createElement(Aaa, { a: '1' }));

    
    const replacer = (key, value) => {
        if (typeof value === "function") {
          return value.toString(); // 将函数转换为字符串
        }
        return value;
      };
console.log(JSON.stringify(content, replacer, 2));

// reconcile

/**
 * render函数是入口，element是要渲染的函数就 App.tsx文件返回的函数组件，
 * container是挂载的root根节点dom
 */

let wipRoot = null //当前正在处理链表的根,也是初始渲染时的根
let currentRoot = null //之前渲染的链表的根，初始渲染的时候是null,非初始渲染时，是上一次渲染后生成新的链表
let nextunitOfWork = null //下一个执行的fiber
function render(element,container){
    wipRoot = {
        dom:container,
        props:{
            children:[element] //element就是vdom
        },
        alternate:currentRoot
    }
    nextunitOfWork = wipRoot
}
/**
 * 
 * 调度机制，就是时间分片处理，在合适的时间去渲染 
 */
function workLoop(deadline) {
    //  在调度机制函数里面，去执行reconcile过程，
    performUnitOfWork(nextunitOfWork)
}
requestIdleCallback(workLoop)

/**
 * 去执行某个vdom单元的reconcile过程,注意这里的fiber在初次渲染时还是vdom单元，
 * 后面执行的渲染才是真正的fiber
 */

function performUnitOfWork(fiber) {
    //判断是函数组件还是原生标签,因为函数组件需要传入props去执行，拿到返回的结果
    const isFunctionComponent = fiber.type instanceof Function
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
}
function updateFunctionComonent(fiber) {
    // 这里标记为children，是因为
    const res = [fiber.type(fiber.props)]
    reconcileChildren(fiber,res)
}
function updateHostComponent(fiber) {
    reconcileChildren(fiber,fiber.props.children)
}
// elements就是vdom里的children,函数组件里返回的也是vdom里面，只不过在执行函数的时候
//才执行createElement,返回vdom
function reconcileChildren(wipFiber,elements) {
    
}

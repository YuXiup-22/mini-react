"use strict";
function Aaa(props) {
  const { a } = props;
  console.log(a);
  return "c";
}
const content = miniReact.createElement(
  "div",
  null,
  miniReact.createElement("a", { href: "xxx" }, "link"),
  miniReact.createElement(Aaa, { a: "1" })
);

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

let wipRoot = null; //当前正在处理链表的根,也是初始渲染时的根
let currentRoot = null; //之前渲染的链表的根，初始渲染的时候是null,非初始渲染时，是上一次渲染后生成新的链表
let nextunitOfWork = null; //下一个执行的fiber
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element], //element就是vdom
    },
    alternate: currentRoot,
  };
  nextunitOfWork = wipRoot;
}
/**
 *
 * 调度机制，就是时间分片处理，在合适的时间去渲染
 */
function workLoop(deadline) {
  //  在调度机制函数里面，去执行reconcile过程，
  // 执行完一个任务后，拿到下一个需要执行的任务，等待调度机制进行
  // 同时需要根据调度器判断该任务是否需要执行
  let shouldyied = false;
  while (nextunitOfWork && !shouldyied) {
    nextunitOfWork = performUnitOfWork(nextunitOfWork);
    // 判断是否有预留时间能执行下一次任务
    shouldyied = deadline.timeRemaining() < 1;
  }
  // 当前任务结束后，等待调度器继续在空闲时间继续执行任务
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

/**
 * 去执行某个vdom单元的reconcile过程,注意这里的fiber在初次渲染时还是vdom单元，
 * 后面执行的渲染才是真正的fiber
 */

function performUnitOfWork(fiber) {
  //判断是函数组件还是原生标签,因为函数组件需要传入props去执行，拿到返回的结果
  const isFunctionComponent = fiber.type instanceof Function;
  // 此时渲染App函数组件，
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // 初始化时，会从这里进入
    updateHostComponent(fiber);
  }
  // 创建完root根节点后，reconcile App返回内容
  if (fiber.child) {
    return fiber.child;
  }
  // 走到叶子节点后，需要继续兄弟元素或者返回到父元素
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}
function updateFunctionComonent(fiber) {
  // 函数组件需要执行，返回需要继续reconcile的内容，即child,
  // 这里要说明以下，渲染的时候是根据真实的dom层级，所以
  // <app><p></p></app>中<p>都不是渲染时的child,因为app函数组件
  // 中返回的内容才是真实child，其实也就是app本身，不过这里以真实渲染dom为准
  // 所以认为是child
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  // 并且将props里面内容添加到dom上
  updateDom(dom, {}, fiber.props);
  return dom;
}
function updateDom(dom, prevProps, nextProps) {
    // 删除掉

}
// elements就是vdom里的children,函数组件里返回的也是vdom里面，只不过在执行函数的时候
//才执行createElement,返回vdom
function reconcileChildren(wipFiber, elements) {
  // 初次渲染时，同时也是第一个child
  let index = 0;
  // 进入到app入口函数本身渲染时，就可能出现多个children即elements
  let prevSibling = null;
  // 比较老旧两个fiber
  let oldFober = wipFiber.alternate?.child
  while (index < elements.length) {
    //初次渲染elements的个数是1
    let element = elements[index];
    let newFiber = null
    // 比较前后两个fiber是否是一样的
    const sameType = element?.type == oldFiber?.type
    if(sameType){
        newFiber = {
            type:oldFiber.type,
            props:element.props,
            dom:oldFober.dom,
            return:wipFiber,
            alternate:oldFiber,
            effectTag:'UPDATE'
        }
    }
    // 该节点是新添加的
    if(element&&!oldFiber){
        newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        return: wipFiber, //child对象添加return指针构造fiber对象
        alternate: null,
        };
    }
   
    if (index === 0) {
      wipFiber.child = newFiber; //顶端fiber构造child指针
    } else if (element) {
      //这里这个element存在判断是？
      prevSibling.sibling = newFiber;
    }
    // reconcile任何一个节点时，都把自己当作上一个sibling,
    // 默认会有兄弟元素，等待循环到有兄弟元素时，记录下来
    prevSibling = newFiber;
    index++;
  }
}

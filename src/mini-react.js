function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}
/**
 * 
 * @param {*} nodeValue 
 * 因为 div 的话，它的 type 是 div，可以有 props 和 children。

  而文本节点是没有 type、children、props 的。

  我们需要给它加个固定的 type TEXT_ELEMENT，并且设置 nodeValue 的 props。
 * @returns 
 */
function createTextNode(nodeValue) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue,
      children: [],
    },
  };
}

const miniReact = {
  createElement,
};
window.miniReact = miniReact;

// reconcile 过程
let nextUnitofWork = null; //指向下一个要处理的fiber节点
let wipRoot = null; //setState生成对比链表的root
let currentRoot = null; //当前处理链表的root

// 这里设置初始的nextUnitofWork
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitofWork = wipRoot;
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitofWork && !shouldYield) {
    nextUnitofWork = performUnitOfWork(nextUnitofWork);
    // 时间不够就立即中断循环，然后下一个requestIdleCallback任务执行
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
// 执行单位任务
function performUnitOfWork(fiber) {
  // 处理每个fiber节点要根据类型做不同的处理,函数组件还是原生标签
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComonent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}
let wipFiber = null; //当前要处理的节点
let stateHookIndex = null;

function updateFunctionComonent(fiber) {
  wipFiber = fiber;
  stateHookIndex = 0;
  wipFiber.stateHook = []; //存储useState的hook的值
  wipFiber.effectHooks = []; //存储useEffect的hook的值
  // 函数组件就是传入props调用它，然后函数组件的返回值就是需要reconcile节点
  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = creatDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function creatDom(fiber) {
  const dom =
    fiber.type == "Text_ElEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  // remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2); //去掉on
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Romove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });
}

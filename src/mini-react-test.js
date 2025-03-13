/**
 * 编译后结果：
 * function Aaa(props) {
    const { a } = props;
    console.log(a);
    return 'c';
}
const content = miniReact.createElement("div", null,
    miniReact.createElement("a", { href: "xxx" }, "link"),
    miniReact.createElement(Aaa, { a: '1' }));
 * 
 */

const createElement = (type,props,...childrenArray)=>{
    let vdom = {
        type,
        props:{
            ...props,
            children:childrenArray.map(child=>{
                const isTextNode = typeof child ==='string'|| typeof child ==='number'
                return isTextNode?createTextNode(child):child
            })
        }
    }
    return vdom
}

function createTextNode(nodeValue) {
    return {
        type:"TEXT_ELEMENT",
        props:{
            nodeValue,
            // 例如<div>s<div>中的s就是TEXT_ELEMENT,他没有children,唯一props就是本身 s
            children:[]
        }
    }
}

const miniReact = {
    createElement
}
window.miniReact = miniReact


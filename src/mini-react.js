function createElement(type,props,...children){
  return {
    type,
    props:{
      ...props,
      children:children.map(child=>{
        const isTextNode = typeof child ==='string'||typeof child === 'number'
        return isTextNode?createTextNode(child):child
      })
    }
  }
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
    type:'TEXT_ELEMENT',
    props:{
      nodeValue,
      children:[]
    }
  }
}

const miniReact = {
  createElement
}
window.miniReact = miniReact
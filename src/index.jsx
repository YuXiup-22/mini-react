function Aaa(props) {
  const {
    a
  } = props
  console.log(a)
  return <div>
    <p>a</p>
  </div>
}
const content = <div>
  <a href="xxx">link</a>
  <Aaa a={'1'} ></Aaa>
</div>
console.log(JSON.stringify(content,null,2))
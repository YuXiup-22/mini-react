"use strict";
const content = miniReact.createElement("div", null,
    miniReact.createElement("a", { href: "xxx" }, "link"));
console.log(JSON.stringify(content, null, 2));

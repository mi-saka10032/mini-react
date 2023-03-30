// React17的老式babel转换写法
const babel = require("@babel/core");
const React = require("react");
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;

const result = babel.transform(sourceCode, {
    plugins: [
        ["@babel/plugin-transform-react-jsx", { runtime: "classic" }],
    ],
});

console.log(result.code);

// /*#__PURE__*/React.createElement("h1", null, "hello", /*#__PURE__*/React.createElement("span", {
//     style: {
//         color: 'red'
//     }
// }, "world"));

// React18新jsx转换写法
const babel = require("@babel/core");
const React = require("react");
const sourceCode = `
<h1>
  hello<span style={{ color: 'red' }}>world</span>
</h1>
`;

const result = babel.transform(sourceCode, {
    plugins: [
        ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
    ],
});

console.log(result.code);

// import { jsx } from "react/jsx-runtime";
// import { jsxs } from "react/jsx-runtime";
// /*#__PURE__*/_jsxs("h1", {
//     children: ["hello", /*#__PURE__*/_jsx("span", {
//         style: {
//             color: 'red'
//         },
//         children: "world"
//     })]
// });

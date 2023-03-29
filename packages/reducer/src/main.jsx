import * as React from "react/index";
import { createRoot } from "react-dom/client";

const reducer = (state, action) => {
    if (action.type === "add") return state + action.payload;
    return state;
};

function FunctionComponent() {
    const [number1, setNumber1] = React.useReducer(reducer, 0);
    const [number2, setNumber2] = React.useReducer(reducer, 0);
    let attrs = { id: "btn1" };
    if (number1 === 6) {
        delete attrs.id;
        attrs.style = { color: "red" };
    }
    return (<button {...attrs} onClick={() => {
        setNumber1({ type: "add", payload: 3 })
        setNumber2({ type: "add", payload: 2 })
    }}>{number1 + number2}</button>);
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

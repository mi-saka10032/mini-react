import * as React from "react/index";
import { createRoot } from "react-dom/client";

const reducer = (state, action) => {
    if (action.type === "add") return state + 1;
    return state;
};

function FunctionComponent() {
    const [number, setNumber] = React.useReducer(reducer, 0);
    return (<button onClick={() => setNumber({ type: "add" })}>{number}</button>);
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

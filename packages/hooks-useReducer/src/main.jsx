import * as React from "react/index";
import { createRoot } from "react-dom/client";

function counter(state, action) {
    if (action.type === "add") return state + 1;
    return state;
}

function FunctionComponent() {
    const [number, setNumber] = React.useReducer(counter, 1);
    const [number2, setNumber2] = React.useReducer(counter, 2);
    return <button onClick={() => {
        setNumber({ type: "add", payload: 1 }); // update1 => update2 => update3 => update1
        setNumber({ type: "add", payload: 2 }); // update2
        setNumber({ type: "add", payload: 3 }); // update3
    }}>{number}</button>;
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

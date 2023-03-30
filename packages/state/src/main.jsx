import * as React from "react/index";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
    const [number, setNumber] = React.useState(0);
    let attrs = { id: "btn1" };
    if (number === 3) {
        delete attrs.id;
        attrs.style = { color: "red" };
    }
    // 如果使用的是useState，调用setNumber的时候传入的是老状态，则不需要更新
    return (<button {...attrs} onClick={() => setNumber(number + 1)}>{number}</button>);
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

import * as React from "react/index";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
    console.log("FunctionComponent");
    const [number, setNumber] = React.useState(0);
    return number === 0 ? (
        <ul key="container" onClick={() => setNumber(number + 1)}>
            <li key="A">A</li>
            <li key="B" id="b">
                B
            </li>
            <li key="C">C</li>
            <li key="D">D</li>
            <li key="E">E</li>
            <li key="F">F</li>
        </ul>
    ) : (
        <ul key="container" onClick={() => setNumber(number + 1)}>
            <li key="A">A2</li>
            <li key="C">C2</li>
            <li key="E">E2</li>
            <li key="B" id="b2">
                B2
            </li>
            <li key="G">G</li>
            <li key="D">D2</li>
        </ul>
    );
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

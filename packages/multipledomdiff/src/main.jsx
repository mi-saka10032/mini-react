import * as React from "react/index";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
    console.log("FunctionComponent");
    const [number, setNumber] = React.useState(0);
    return number === 0 ? (
        <ul key="container" onClick={() => setNumber(number + 1)}>
            <li key="A">A</li>
            <li key="B" id="B">
                B
            </li>
            <li key="C" id="C">
                C
            </li>
        </ul>
    ) : (
        <ul key="container" onClick={() => setNumber(number + 1)}>
            <li key="A">A2</li>
            <p key="B" id="B2">
                B2
            </p>
            <li key="C" id="C2">
                C2
            </li>
        </ul>
    );
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

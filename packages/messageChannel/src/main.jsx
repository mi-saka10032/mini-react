import * as React from "react/index";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
    console.log("FunctionComponent");
    const [number, setNumber] = React.useState(1);
    React.useLayoutEffect(() => {
        console.log("useLayoutEffect1");
        return () => {
            console.log("destroy useLayoutEffect1");
        };
    });
    React.useEffect(() => {
        console.log("useEffect2");
        return () => {
            console.log("destroy useEffect2");
        };
    });
    React.useEffect(() => {
        console.log("useEffect3");
        console.log(number);
        return () => {
            console.log("destroy useEffect3");
        };
    });
    return (
        <div onClick={() => setNumber(number + 1)}>{number}</div>
    );
}

const element = <FunctionComponent/>;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

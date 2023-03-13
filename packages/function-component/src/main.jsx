import { createRoot } from "react-dom/client";

function FunctionComponent() {
    return (
        <h1 id="container" onClick={() => console.log('click')}>
            hello<span style={{ color: "red" }}>world</span>
        </h1>
    )
}
const element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

import { createRoot } from "react-dom/client";

const element = (
    <h1 id="container">
        hello<span style={{ color: "red" }}>world</span>
    </h1>
);

const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

import { createRoot } from "react-dom/client";

function FunctionComponent() {
    const parentBubble = () => {
        console.log('父冒泡');
    }
    const parentCapture = () => {
        console.log('父捕获');
    }
    const childBubble = () => {
        console.log('子冒泡');
    }
    const childCapture = () => {
        console.log('子捕获');
    }
    return (
        <h1 id="container" onClick={parentBubble} onClickCapture={parentCapture}>
            hello<span style={{ color: "red" }} onClick={childBubble} onClickCapture={childCapture}>world</span>
        </h1>
    )
}
const element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM挂载到容器中
root.render(element);

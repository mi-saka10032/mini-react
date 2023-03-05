import { createRoot } from "react-dom/client";

const element = (
    <div>
        <h1>
            hello1<span style={{ color: 'red' }}>world1</span>
        </h1>
        <h2>
            hello2<span style={{ color: 'red' }}>world2</span>
        </h2>
    </div>
)

const root = createRoot(document.getElementById('root'))
// 把element虚拟DOM挂载到容器中
root.render(element)

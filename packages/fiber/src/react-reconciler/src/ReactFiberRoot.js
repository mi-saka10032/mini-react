import { createHostRootFiber } from "./ReactFiber";
import { initialUpdateQueue } from "./ReactFiberClassUpdateQueue";

function FiberRootNode(containerInfo) {
    this.containerInfo = containerInfo;
}



export function createFiberRoot(containerInfo) {
    const root = new FiberRootNode(containerInfo);
    // HostRoot指的是根节点div#root
    const uninitializedFiber = createHostRootFiber();
    // 根容器的current指向当前的根fiber
    root.current = uninitializedFiber;
    // 根fiber的stateNode，真实DOM节点指向FiberRootNode
    uninitializedFiber.stateNode = root;
    initialUpdateQueue(uninitializedFiber);
    return root;
}

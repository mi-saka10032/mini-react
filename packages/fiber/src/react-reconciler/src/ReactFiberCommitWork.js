import { appendChild } from "react-dom/src/client/ReactDOMHostConfig";
import { HostComponent, HostRoot, HostText } from "react-reconciler/src/ReactWorkTags";
import { MutationMask, Placement } from "react-reconciler/src/ReactFiberFlags";

function recursivelyTraverseMutationEffects(root, parentFiber) {
    if (parentFiber.subtreeFlags & MutationMask) {
        let { child } = parentFiber;
        while (child !== null) {
            commitMutationEffectsOnFiber(child, root);
            child = child.sibling;
        }
    }
}

function commitReconciliationEffects(finishedWork) {
    const { flags } = finishedWork;
    if (flags && Placement) {
        // 进行插入操作，也就是把此fiber对应的真实DOM节点添加到父真实DOM上
        commitPlacement(finishedWork);
        // 把flags里的Placement删除
        finishedWork.flags &= ~Placement;
    }
}

function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot;   //只有根fiber或根组件节点才能作为父fiber
}

function getHostParentFiber(fiber) {
    let parent = fiber.return;
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent;
        }
        parent = parent.return;
    }
}

/**
 *
 * @param node 将要插入的fiber节点
 * @param parent 父真实DOM节点
 */
function insertNode(node, parent) {
    const { tag } = node;
    // 判断此fiber对应的节点是不是真实DOM节点
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        // 如果是的话就直接插入
        const { stateNode } = node;
        appendChild(parent, stateNode);
    } else {
        // 如果node不是真实DOM节点，获取它的child
        const { child } = node;
        if (child !== null) {
            insertNode(parent, child);
            let { sibling } = child;
            while (sibling !== null) {
                insertNode(node, parent);
                sibling = sibling.sibling;
            }
        }
    }
}

/**
 * 把此fiber的真实DOM插入到父DOM里
 * @param finishedWork
 */
function commitPlacement(finishedWork) {
    const parentFiber = getHostParentFiber(finishedWork);
    switch (parentFiber.tag) {
        case HostRoot: {
            const parent = parentFiber.stateNode.containerInfo;
            insertNode(finishedWork, parent);
            break;
        }
        case HostComponent: {
            const parent = parentFiber.stateNode;
            insertNode(finishedWork, parent);
            break;
        }
    }
}

/**
 * 遍历Fiber树，执行fiber上的副作用
 * @param finishedWork fiberJ节点
 * @param root 根节点
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
    switch (finishedWork.tag) {
        case HostRoot:
        case HostComponent:
        case HostText:
            // 遍历子节点，处理子节点上的副作用
            recursivelyTraverseMutationEffects(root, finishedWork);
            // 再处理自己身上的副作用
            commitReconciliationEffects(finishedWork);
            break;
        default:
            break;
    }
}

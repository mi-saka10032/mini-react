import { appendChild, insertBefore, commitUpdate, removeChild } from "react-dom/src/client/ReactDOMHostConfig";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "react-reconciler/src/ReactWorkTags";
import { MutationMask, Passive, Placement, Update, LayoutMask } from "react-reconciler/src/ReactFiberFlags";
import { Passive as HookPassive, HasEffect as HookHasEffect, Layout as HookLayout } from "./ReactHookEffectTags";

let hostParent = null;

/**
 * 提交删除副作用
 * @param root 根节点
 * @param returnFiber 父fiber
 * @param deletedFiber 删除的fiber
 */
function commitDeletionEffects(root, returnFiber, deletedFiber) {
    let parent = returnFiber;
    // 一直向上查找直到找到真实DOM节点为止
    findParent: while (parent !== null) {
        switch (parent.tag) {
            case HostComponent: {
                hostParent = parent.stateNode;
                break findParent;
            }
            case HostRoot: {
                hostParent = parent.stateNode.containerInfo;
                break findParent;
            }
        }
        parent = parent.return;
    }
    commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
    hostParent = null;
}

function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    switch (deletedFiber.tag) {
        case HostComponent:
        case HostText: {
            // 递归处理子节点，当要删除一个节点的时候，要先删除它的子节点 不直接删除自己
            recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
            // 再把自己删除
            if (hostParent !== null) {
                removeChild(hostParent, deletedFiber.stateNode);
            }
            break;
        }
        default:
            break;
    }
}

function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    let child = parent.child;
    while (child !== null) {
        commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
        child = child.sibling;
    }
}

/**
 * 递归遍历处理变更的副作用
 * @param root 根节点
 * @param parentFiber 父Fiber
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
    // 先把父Fiber上该删除的节点都删除
    const deletions = parentFiber.deletions;
    if (deletions !== null) {
        for (let i = 0; i < deletions.length; i++) {
            const childToDelete = deletions[i];
            commitDeletionEffects(root, parentFiber, childToDelete);
        }
    }
    // 再去处理剩下的子节点
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
 * 把子节点对应的真实DOM插入到父节点DOM中
 * @param node 将要插入的fiber节点
 * @param before 待insertBefore的DOM节点
 * @param parent 父真实DOM节点
 */
function insertOrAppendPlacementNode(node, before, parent) {
    const { tag } = node;
    // 判断此fiber对应的节点是不是真实DOM节点
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        // 如果是的话就直接插入
        const { stateNode } = node;
        if (before) {
            insertBefore(parent, stateNode, before);
        } else {
            appendChild(parent, stateNode);
        }
    } else {
        // 如果node不是真实DOM节点，获取它的child
        const { child } = node;
        if (child !== null) {
            insertOrAppendPlacementNode(child, before, parent);
            let { sibling } = child;
            while (sibling !== null) {
                insertOrAppendPlacementNode(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
    }
}

/**
 * 找到要插入的锚点
 * 找到可以插在它前面的那个fiber对应的真实DOM
 * @param fiber
 */
function getHostSibling(fiber) {
    let node = fiber;
    siblings: while (true) {
        while (node.sibling === null) {
            if (node.return === null || isHostParent(node.return)) {
                return null;
            }
            node = node.return;
        }
        node = node.sibling;
        // 如果弟弟不是原生节点or文本节点，不是要插入的节点，需要寻找弟弟或儿子
        while (node.tag !== HostComponent || node.tag !== HostText) {
            // 如果此节点是一个将要插入的新节点，找它的弟弟，否则找儿子
            if (node.flags && Placement) {
                continue siblings;
            } else {
                node = node.child;
            }
        }
        if (!(node.flags && Placement)) {
            return node.stateNode;
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
            // 获取最近的真实DOM节点
            const before = getHostSibling(finishedWork); // 获取最近的真实DOM节点
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
        }
        case HostComponent: {
            const parent = parentFiber.stateNode;
            // 获取最近的真实DOM节点
            const before = getHostSibling(finishedWork); // 获取最近的真实DOM节点
            insertOrAppendPlacementNode(finishedWork, before, parent);
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
    const current = finishedWork.alternate;
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case HostRoot:
        case FunctionComponent:
        case HostText: {
            // 遍历子节点，处理子节点上的副作用
            recursivelyTraverseMutationEffects(root, finishedWork);
            // 再处理自己身上的副作用
            commitReconciliationEffects(finishedWork);
            if (flags & Update) {
                commitHookEffectListUnmount(HookHasEffect | HookLayout, finishedWork);
            }
            break;
        }
        case HostComponent: {
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);
            // 识别更新副作用标识，判断执行更新
            if (flags & Update) {
                const instance = finishedWork.stateNode;
                if (instance !== null) {
                    const newProps = finishedWork.memoizedProps;
                    const oldProps = current !== null ? current.memoizedProps : newProps;
                    const type = finishedWork.type;
                    const updatePayload = finishedWork.updateQueue;
                    finishedWork.updateQueue = null;
                    if (updatePayload !== null) {
                        commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
                    }
                }
            }
            break;
        }
        default:
            break;
    }
}

export function commitPassiveUnmountEffects(finishedWork) {
    commitPassiveUnmountOnFiber(finishedWork);
}

function commitPassiveUnmountOnFiber(finishedWork) {
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case HostRoot: {
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
        }
        case FunctionComponent: {
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            if (flags & Passive) {
                commitHookPassiveUnmountEffects(finishedWork, HookPassive | HookHasEffect);
            }
            break;
        }
    }
}

function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    if (parentFiber.subtreeFlags & Passive) {
        let child = parentFiber.child;
        while (child !== null) {
            commitPassiveUnmountOnFiber(child);
            child = child.sibling;
        }
    }
}

function commitHookPassiveUnmountEffects(finishedWork, hookFlags) {
    commitHookEffectListUnmount(hookFlags, finishedWork);
}

function commitHookEffectListUnmount(flags, finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & flags) === flags) {
                const destroy = effect.destroy;
                if (destroy !== undefined) {
                    destroy();
                }
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

export function commitPassiveMountEffects(root, finishedWork) {
    commitPassiveMountOnFiber(root, finishedWork);
}

function commitPassiveMountOnFiber(finishedRoot, finishedWork) {
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case HostRoot: {
            recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
            break;
        }
        case FunctionComponent: {
            recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
            if (flags & Passive) {
                commitHookPassiveMountEffects(finishedWork, HookPassive | HookHasEffect);
            }
            break;
        }
    }
}

function recursivelyTraversePassiveMountEffects(root, parentFiber) {
    if (parentFiber.subtreeFlags & Passive) {
        let child = parentFiber.child;
        while (child !== null) {
            commitPassiveMountOnFiber(root, child);
            child = child.sibling;
        }
    }
}

function commitHookPassiveMountEffects(finishedWork, hookFlags) {
    commitHookEffectListMount(hookFlags, finishedWork);
}

function commitHookEffectListMount(flags, finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & flags) === flags) {
                const create = effect.create;
                effect.destroy = create();
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

export function commitLayoutEffects(finishedWork, root) {
    // 老的根fiber
    const current = finishedWork.alternate;
    commitLayoutEffectOnFiber(root, current, finishedWork);
}

function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case HostRoot: {
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            break;
        }
        case FunctionComponent: {
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            if (flags & LayoutMask) { // 4 LayoutMask = Update = 4
                commitHookLayoutEffects(finishedWork, HookLayout | HookHasEffect);
            }
            break;
        }
    }
}

function recursivelyTraverseLayoutEffects(root, parentFiber) {
    if (parentFiber.subtreeFlags & LayoutMask) {
        let child = parentFiber.child;
        while (child !== null) {
            const current = child.alternate;
            commitLayoutEffectOnFiber(root, current, child);
            child = child.sibling;
        }
    }

}

function commitHookLayoutEffects(finishedWork, hookFlags) {
    commitHookEffectListMount(hookFlags, finishedWork);
}

/**
 * @param shouldTracksSideEffects 是否跟踪副作用
 */
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement, createFiberFromText, createWorkInProgress, FiberNode } from "./ReactFiber";
import { Placement, ChildDeletion } from "./ReactFiberFlags";
import isArray from "shared/isArray";
import { HostText } from "react-reconciler/src/ReactWorkTags";

function createChildReconciler(shouldTracksSideEffects) {
    function useFiber(fiber, pendingProps) {
        const clone = createWorkInProgress(fiber, pendingProps);
        clone.index = 0;
        clone.sibling = null;
        return clone;
    }

    function deleteChild(returnFiber, childToDelete) {
        if (!shouldTracksSideEffects) {
            return;
        }
        const deletions = returnFiber.deletions;
        if (deletions === null) {
            returnFiber.deletions = [childToDelete];
            returnFiber.flags |= ChildDeletion;
        } else {
            deletions.push(childToDelete);
        }
    }

    // 删除从currentFirstChild之后的所有fiber节点
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTracksSideEffects) {
            return null;
        }
        let childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
        return null;
    }

    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
        const key = element.key;
        let child = currentFirstChild;
        while (child !== null) {
            if (child.key === key) {
                const elementType = element.type;
                if (child.type === elementType) {
                    // key相同且元素类型相同，fiber复用
                    deleteRemainingChildren(returnFiber, child.sibling);
                    const existing = useFiber(child, element.props);
                    existing.return = returnFiber;
                    return existing;
                } else {
                    // key相同但是类型不同，删除剩下的全部fiber.child
                    deleteRemainingChildren(returnFiber, child);
                }
            } else {
                // key不同，删除老fiber.child
                deleteChild(returnFiber, child);
            }
            child = child.sibling;
        }

        // 初次挂载 currentFirstFiber为null，可以直接根据虚拟DOM创建新的Fiber节点
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }

    /**
     * 设置副作用
     * @param newFiber
     * @param newIndex
     */
    function placeSingleChild(newFiber, newIndex) {
        // 如果为true，说明要添加副作用
        if (shouldTracksSideEffects && newFiber.alternate === null) {
            // 副作用标识：插入DOM节点，在最后的提交阶段插入此节点
            // React的渲染分渲染（创建Fiber树）和提交（更新真实DOM）两个阶段
            newFiber.flags |= Placement;
        }
        return newFiber;
    }

    function reconcileSingleTextNode(returnFiber, currentFirstChild, content) {
        const created = new FiberNode(HostText, { content }, null);
        created.return = returnFiber;
        return created;
    }

    function placeChild(newFiber, newIndex) {
        newFiber.index = newIndex;
        if (shouldTracksSideEffects) {
            // 如果一个fiber的flags上有placement，说明此节点需要创建真实DOM，插入到父容器中
            // 如果父fiber初次挂载，shouldTracksSideEffects为false，不需要添加flags
            // 这种情况下会在完成阶段把所有子阶段全部添加到自己身上
            const current = newFiber.alternate;
            if (current === null) {
                // 新节点，需要插入
                newFiber.flags |= Placement;
            }
        }
    }

    function createChild(returnFiber, newChild) {
        if ((typeof newChild === "string" && newChild !== "") || typeof newChild === "number") {
            // 创建虚拟DOM文本节点
            const created = createFiberFromText(`${newChild}`);
            created.return = returnFiber;
            return created;
        } else if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    const created = createFiberFromElement(newChild);
                    created.return = returnFiber;
                    return created;
                }
                default:
                    break;
            }
        }
        return null;
    }

    function updateElement(returnFiber, current, element) {
        const elementType = element.type;
        if (current !== null) {
            // key和type都相同
            if (current.type === elementType) {
                const existing = useFiber(current, element.props);
                existing.return = returnFiber;
                return existing;
            }
        }
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }

    function updateSlot(returnFiber, oldFiber, newChild) {
        const key = oldFiber !== null ? oldFiber.key : null;
        if (newChild !== null && typeof newChild === "object") {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    if (newChild.key === key) {
                        return updateElement(returnFiber, oldFiber, newChild);
                    }
                }
                default:
                    return null;
            }
        }
    }


    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        let resultingFirstChild = null; // 返回的第一个新儿子
        let previousNewFiber = null; // 之前的新fiber
        let newIdx = 0; // 遍历新虚拟DOM的索引
        let oldFiber = currentFirstChild; // 第一个老fiber
        let nextOldFiber = null; // 下一个老fiber
        // 开始第一轮循环 如果老fiber有值，新的虚拟DOM也有值
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            // 暂存下一个老fiber
            nextOldFiber = oldFiber.sibling;
            // 试图更新或者试图复用老的fiber
            const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
            if (newFiber === null) {
                break;
            }
            if (shouldTracksSideEffects) {
                // 有老fiber，但是新的fiber并没有成功复用老fiber和老的真实DOM，删除老fiber，提交阶段删除真实DOM
                if (oldFiber && newFiber.alternate === null) {
                    deleteChild(returnFiber, oldFiber);
                }
            }
            // 指定新fiber的位置
            placeChild(newFiber, newIdx);
            if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
        }
        // 新的虚拟DOM已经循环完毕
        if (newIdx === newChildren.length) {
            // 第二轮循环情况1 删除剩下的老fiber
            deleteRemainingChildren(returnFiber, oldFiber);
            return resultingFirstChild;
        }
        if (oldFiber === null) {
            // 第二轮循环情况2 老fiber已经没有了，新的虚拟DOM还在，进入插入新节点的逻辑
            for (; newIdx < newChildren.length; newIdx++) {
                const newFiber = createChild(returnFiber, newChildren[newIdx]);
                if (newFiber === null) continue;
                // 把新fiber放到索引位置
                placeChild(newFiber, newIdx);
                if (previousNewFiber === null) {
                    // 这是第一个newFiber
                    resultingFirstChild = newFiber;
                } else {
                    // 不是第一个newFiber
                    previousNewFiber.sibling = newFiber;
                }
                // 让newFiber成为上一个子Fiber
                previousNewFiber = newFiber;
            }
        }
        return resultingFirstChild;
    }

    /**
     * 比较协调子fibers DOM-DIFF：用老的子fiber链表和新的虚拟DOM进行比较的过程
     * @param returnFiber 新的父fiber
     * @param currentFirstChild current一般来说指老fiber的第一个子fiber
     * @param newChild 新的子虚拟DOM
     */
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
        // 现在暂时只考虑新节点只有一个的情况
        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
                default:
                    break;
            }
            // newChild [文本节点， span虚拟元素]
            if (isArray(newChild)) {
                return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
            }
        }
        if (typeof newChild === "string") {
            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, newChild));
        }
        return null;
    }

    return reconcileChildFibers;
}

// 虚拟DOM初次挂载
export const mountChildFibers = createChildReconciler(false);
//老fiber更新
export const reconcileChildFibers = createChildReconciler(true);

/**
 * @param shouldTracksSideEffects 是否跟踪副作用
 */
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement, createFiberFromText } from "./ReactFiber";
import { Placement } from "react-reconciler/src/ReactFiberFlags";
import isArray from "shared/isArray";

function createChildReconciler(shouldTracksSideEffects) {
    function reconcileSingleElement(returnFiber, currentFirstFiber, element) {
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
        if (shouldTracksSideEffects) {
            // 副作用标识：插入DOM节点，在最后的提交阶段插入此节点
            // React的渲染分渲染（创建Fiber树）和提交（更新真实DOM）两个阶段
            newFiber.flags |= Placement;
        }
        return newFiber;
    }

    function placeChild(newFiber, newIndex) {
        newFiber.index = newIndex;
        if (shouldTracksSideEffects) {
            // 如果一个fiber的flags上有placement，说明此节点需要创建真实DOM，插入到父容器中
            // 如果父fiber初次挂载，shouldTracksSideEffects为false，不需要添加flags
            // 这种情况下会在完成阶段把所有子阶段全部添加到自己身上
            newFiber.flags |= Placement;
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

    function reconcilerChildrenArray(returnFiber, currentFirstFiber, newChildren) {
        let resultingFirstChild = null; // 返回的第一个新儿子
        let previousNewFiber = null; // 之前的新fiber
        let newIndex = 0;
        // 遍历虚拟DOM根节点内的首层newChildren类型并生成不同fiber
        for (; newIndex < newChildren.length; newIndex++) {
            const newFiber = createChild(returnFiber, newChildren[newIndex]);
            if (newFiber === null) continue;
            // 把新fiber放到索引位置
            placeChild(newFiber, newIndex);
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
        return resultingFirstChild;
    }

    /**
     * 比较协调子fibers DOM-DIFF：用老的子fiber链表和新的虚拟DOM进行比较的过程
     * @param returnFiber 新的父fiber
     * @param currentFirstFiber current一般来说指老fiber的第一个子fiber
     * @param newChild 新的子虚拟DOM
     */
    function reconcileChildFibers(returnFiber, currentFirstFiber, newChild) {
        // 现在暂时只考虑新节点只有一个的情况
        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstFiber, newChild));
                default:
                    break;
            }
        }
        // newChild [文本节点， span虚拟元素]
        if (isArray(newChild)) {
            return reconcilerChildrenArray(returnFiber, currentFirstFiber, newChild);
        }
        return null;
    }

    return reconcileChildFibers;
}

// 虚拟DOM初次挂载
export const mountChildFibers = createChildReconciler(false);
//老fiber更新
export const reconcileChildFibers = createChildReconciler(true);

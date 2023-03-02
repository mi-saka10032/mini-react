/**
 *
 * @param shouldTracksSideEffects 是否跟踪副作用
 */
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement } from './ReactFiber'
import { Placement } from "react-reconciler/src/ReactFiberFlags";

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
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstFiber, newChild))
                default:
                    break;
            }
        }
    }

    return reconcileChildFibers;
}

// 初次挂载
export const mountChildFibers = createChildReconciler(false);
//老fiber更新
export const reconcileChildFibers = createChildReconciler(true);

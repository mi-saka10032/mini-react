import { scheduleCallback } from "scheduler/index";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";

let workInProgress = null;

/**
 * 计划更新root
 * 源码中此处有一个调度任务的功能
 * @param {*}root
 */
export function scheduleUpdateOnFiber(root) {
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
    // 告诉浏览器要执行performConcurrentWorkOnRoot函数，参数为root
    scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 开始根据fiber构建fiber树，要创建真实的DOM节点，再把真实的DOM节点插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
    // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步执行
    renderRootSync(root);
    console.log(root);
}

function prepareFreshStack(root) {
    workInProgress = createWorkInProgress(root.current, null);
}

function renderRootSync(root) {
    // 开始构建fiber树
    // 双缓冲技术，页面显示区域为current映射，对应真实DOM，代表当前已经渲染完成的Fiber
    // 内存中的Fiber构建、比较、更新为workInProgress映射，表示还未生效，没有更新的DOM上的Fiber树
    // 1. current的HostRootFiber在构建过程中不作变化
    // 2. workInProgress在内存中顺序构建Fiber树
    prepareFreshStack(root);
    workLoopSync();
}


function workLoopSync() {
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}

/**
 * 执行一个工作单元
 * @param unitOfWork
 */
function performUnitOfWork(unitOfWork) {
    // 获取新fiber对应的老fiber，是页面上显示的current的fiber
    const current = unitOfWork.alternate;
    // 完成当前fiber的子fiber链表构建
    const next = beginWork(current, unitOfWork);
    // 同步工作单元中的props
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    // 没有子节点，表示工作单元递归的 递 阶段已结束，需要return执行completeWork
    if (next === null) {
        // 没有子节点，表示当前fiber的beginWork已经完成，执行completeWork
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }
}

function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;
    do {
        // 替代fiber
        const current = completedWork.alternate;
        // 父fiber
        const returnFiber = completedWork.return;
        // 执行此fiber的完成工作
        // 如果是原生组件，就是创建真实DOM节点
        completeWork(current, completedWork);
        // 如果有弟弟，构建弟弟对应的fiber子链表
        const siblingFiber = completedWork.sibling;
        if (siblingFiber !== null) {
            // 如果存在兄弟节点，则workInProgress赋值兄弟节点，循环退出，等待下一次工作单元执行beginWork
            workInProgress = siblingFiber;
            return;
        }
        // 如果没有弟弟，说明这当前完成的就是父fiber的最后一个节点
        // 也就是说一个父fiber，它的所有子fiber全部完成了
        completedWork = returnFiber;
        workInProgress = completedWork;
        // 执行递归的 归阶段，当兄弟节点为空的时候执行while循环往上返回，直到根fiber时退出循环
    } while (completedWork !== null);
}

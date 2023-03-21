import hasOwnProperty from "shared/hasOwnProperty";
import assign from "shared/assign";

function functionThatReturnsTrue() {
    return true;
}

function functionThatReturnsFalse() {
    return false;
}

const MouseEventInterface = {
    clientX: 0,
    clientY: 0,
};

function createSyntheticEvent(inter) {
    /**
     * 合成事件的基类
     * @param reactName react的属性名 onClick
     * @param reactEventType react时间类型 click
     * @param targetInst 事件源对应的fiber实例
     * @param nativeEvent 原生事件对象
     * @param nativeEventTarget 原生事件源 真实DOM
     * @constructor
     */
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
        this._reactName = reactName;
        this.type = reactEventType;
        this._targetInst = targetInst;
        this.nativeEvent = nativeEvent;
        this.target = nativeEventTarget;
        // 把此接口上对应的属性从原生事件上拷贝到合成事件实例上
        for (const propName in inter) {
            if (!hasOwnProperty.call(inter, propName)) {
                continue;
            }
            this[propName] = nativeEvent[propName];
        }
        // 是否已阻止默认事件
        this.isDefaultPrevented = functionThatReturnsFalse;
        // 是否已阻止继续传播
        this.isPropagationStopped = functionThatReturnsTrue;
        return this;
    }
    assign(SyntheticBaseEvent.prototype, {
        preventDefault() {
            const event = this.nativeEvent;
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            this.isDefaultPrevented = functionThatReturnsTrue;
        },
        stopPropagation() {
            const event = this.nativeEvent;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            this.isPropagationStopped = functionThatReturnsTrue;
        },
    })
    return SyntheticBaseEvent;
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);

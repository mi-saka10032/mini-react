// Don't change these two values. They're used by React Dev Tools.
export const NoFlags = /*                      */ 0b00000000000000000000000000;
export const PerformedWork = /*                */ 0b00000000000000000000000001;

// You can change the rest (and add more).
// Placement 插入
export const Placement = /*                    */ 0b00000000000000000000000010;
// Update 更新
export const Update = /*                       */ 0b00000000000000000000000100;
export const ChildDeletion = /*                     */ 0b00000000000000000000001000;

export const MutationMask = Placement | Update;
// 如果函数组件里使用了useEffect，那么此函数组件对应的fiber上会有一个flags，为Passive
export const Passive = /*                      */ 0b00000000000000010000000000; // 1024
export const LayoutMask = /*                      */ Update; // 4

class EventManager {
  /**
   * @param {{ename: string, cb: (e: Event & MouseEvent & KeyboardEvent) => void}[]} eventAndCallback
   * @param {HTMLElement | Document} ele
   */
  bindEvent(eventAndCallback, ele) {
    eventAndCallback.forEach(eac => ele[eac.ename] = eac.cb)
  }
}
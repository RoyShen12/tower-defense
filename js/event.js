class EventManager {

  /**
   * @param {Game} gameinst 
   */
  constructor() {
  }

  /**
   * @param {{ename: string, cb: (e: Event) => void}[]} eventAndCallback
   * @param {HTMLElement} ele
   */
  bindEvent(eventAndCallback, ele) {
    eventAndCallback.forEach(eac => ele[eac.ename] = eac.cb)
  }
}
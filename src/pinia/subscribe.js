export function addSubscribe(subscribeOptions, callback) {
  subscribeOptions.push(callback);

  const removeSubscribeAction = () => {
    const index = subscribeOptions.indexOf(callback);
    if (index > -1) {
      subscribeOptions.splice(index, 1);
    }
  };

  return removeSubscribeAction;
}

export function triggerSubscribe(subscribeOptions, ...args) {
  subscribeOptions.slice().forEach((callback) => {
    callback(...args);
  });
}
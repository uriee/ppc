const setIsBroadcaster = (state = false, action) => (action.type === 'SET_ISBROADCASTER' ? action.isBroadcaster : state);
export default setIsBroadcaster;

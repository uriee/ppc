const setinterval = (state=1 , action) => (action.type === 'SET_INTERVAL' ? action.interval : state);
export default setinterval;

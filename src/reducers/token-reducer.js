const setToken = (state={} , action) => (action.type === 'SET_TOKEN' ? action.token : state);
export default setToken;

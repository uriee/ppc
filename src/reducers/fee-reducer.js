const setFee = (state = 1, action) => (action.type === 'SET_FEE' ? action.fee : state);
export default setFee;

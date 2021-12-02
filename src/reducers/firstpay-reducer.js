const setFirstPay = (state=1 , action) => (action.type === 'SET_FP' ? action.firstPay : state);
export default setFirstPay;

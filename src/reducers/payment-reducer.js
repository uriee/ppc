const setpayment = (state=1 , action) => (action.type === 'SET_PAYMENT' ? action.payment : state);
export default setpayment;

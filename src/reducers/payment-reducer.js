const setpayment = (state=0 , action) => (action.type === 'SET_PAYMENT' ? action.payment : state);
export default setpayment;

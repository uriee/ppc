const setchatid = (state=1 , action) => (action.type === 'SET_CHATID' ? action.chatid : state);
export default setchatid;

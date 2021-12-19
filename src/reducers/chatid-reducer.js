const setchatID = (state='' , action) => (action.type === 'SET_CHATID' ? action.chatID : state);
export default setchatID;

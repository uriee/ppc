const setroomID = (state='' , action) => (action.type === 'SET_ROOMID' ? action.roomID : state);
export default setroomID;

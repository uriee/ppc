const setOwner = (state = false, action) => {
  if (action.type === 'SET_OWNER') {
    console.log("owner action",action)
    return action.owner || false
  }
  return state;
};
export default setOwner;

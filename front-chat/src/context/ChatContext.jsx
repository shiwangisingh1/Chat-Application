import { createContext, useState, useContext } from "react"; // Added useContext import

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        setRoomId,
        setCurrentUser,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);

export default useChatContext;

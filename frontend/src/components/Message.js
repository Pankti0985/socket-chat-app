function Message({ message, currentUserId }) {
  return (
    <div style={{
      textAlign: message.sender === currentUserId ? 'right' : 'left',
      margin: '5px'
    }}>
      <span>{message.content}</span>
    </div>
  );
}

export default Message;

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
          isUser
            ? 'bg-purple-500/20 text-purple-100 border border-purple-500/20 rounded-br-md'
            : 'bg-white/5 text-white/70 border border-white/5 rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

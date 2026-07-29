import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../../theme'
import { ChatMessage as ChatMessageType } from '../../types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  userWrapper: { alignItems: 'flex-end' },
  assistantWrapper: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
  },
  userBubble: {
    backgroundColor: `${colors.purple}30`,
    borderWidth: 1, borderColor: `${colors.purple}30`,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: typography.sizes.sm, lineHeight: 20 },
  userText: { color: `${colors.purple}EE` },
  assistantText: { color: colors.textSecondary },
})

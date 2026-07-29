import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Modal } from './Modal'
import { Button } from './Button'
import { colors, typography } from '../../theme'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  danger?: boolean
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger = false }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <Button variant="secondary" onPress={onClose} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onPress={() => {
            onConfirm()
            onClose()
          }}
          style={{ flex: 1 }}
        >
          {confirmText}
        </Button>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: 8,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
})

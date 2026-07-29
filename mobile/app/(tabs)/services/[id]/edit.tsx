import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ServiceForm } from '../../../../src/components/services/ServiceForm'

export default function ServiceEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <ServiceForm id={id} isEditing />
}

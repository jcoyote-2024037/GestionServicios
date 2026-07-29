import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesService } from '../../services/services'
import { categoriesService } from '../../services/categories'
import { adminService } from '../../services/admin'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { colors, typography } from '../../theme'
import { Category } from '../../types'

interface ServiceFormProps {
  id?: string
  isEditing: boolean
}

export function ServiceForm({ id, isEditing }: ServiceFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    nombre: '', descripcion: '', categoriaId: '', locationId: '',
    telefono: '', contactEmail: '', serviceAreaRadius: '5',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categoriesData, isLoading: catsLoading } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoriesService.getActive(),
  })

  const { data: locationsData } = useQuery({
    queryKey: ['locations', 'all'],
    queryFn: () => adminService.getLocations(),
  })

  const { data: existingData, isLoading: loadingService } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesService.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (existingData && id) {
      const s = (existingData as any)?.data?.service || (existingData as any)?.data?.data
      if (s) {
        setForm({
          nombre: (s as Record<string, string>).nombre || '',
          descripcion: (s as Record<string, string>).descripcion || '',
          categoriaId: typeof (s as Record<string, unknown>).categoriaId === 'object'
            ? ((s as Record<string, unknown>).categoriaId as Record<string, string>)?._id || ''
            : ((s as Record<string, string>).categoriaId || ''),
          locationId: typeof (s as Record<string, unknown>).locationId === 'object'
            ? ((s as Record<string, unknown>).locationId as Record<string, string>)?._id || ''
            : ((s as Record<string, string>).locationId || ''),
          telefono: (s as Record<string, string>).telefono || '',
          contactEmail: (s as Record<string, string>).contactEmail || '',
          serviceAreaRadius: String((s as Record<string, number>).serviceAreaRadius || 5),
        })
      }
    }
  }, [existingData, id])

  const categories: Category[] = (categoriesData as any)?.data?.data || (categoriesData as any)?.data?.categories || []
  const locations: Array<{ _id: string; nombre: string; direccion: string }> =
    (locationsData as any)?.data?.data || (locationsData as any)?.data?.locations || []

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEditing ? servicesService.update(id!, data) : servicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      Alert.alert(isEditing ? 'Actualizado' : 'Creado', `Servicio ${isEditing ? 'actualizado' : 'creado'} exitosamente`)
      router.back()
    },
    onError: (err: unknown) => {
      Alert.alert('Error', (err as { response?: { data?: { message?: string } } })?.response?.data?.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio`)
    },
  })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (!form.descripcion.trim()) errs.descripcion = 'La descripción es obligatoria'
    if (!form.categoriaId) errs.categoriaId = 'Selecciona una categoría'
    if (!form.telefono || !/^\d{7,15}$/.test(form.telefono)) errs.telefono = '7-15 dígitos numéricos'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = () => {
    if (!validate()) return
    mutation.mutate({
      ...form,
      serviceAreaRadius: Number(form.serviceAreaRadius) || 5,
    })
  }

  const set = (key: string) => (text: string) => setForm((prev) => ({ ...prev, [key]: text }))

  if (catsLoading || loadingService) return <Spinner fullScreen />

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isEditing ? 'Editar Servicio' : 'Nuevo Servicio',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field label="Nombre *" value={form.nombre} onChange={set('nombre')} error={errors.nombre} />
          <Field label="Descripción *" value={form.descripcion} onChange={set('descripcion')} error={errors.descripcion} multiline />
          <Field label="Teléfono *" value={form.telefono} onChange={set('telefono')} error={errors.telefono} keyboardType="phone-pad" />
          <Field label="Email de contacto" value={form.contactEmail} onChange={set('contactEmail')} keyboardType="email-address" />
          <Field label="Radio de cobertura (km)" value={form.serviceAreaRadius} onChange={set('serviceAreaRadius')} keyboardType="number-pad" />

          <View style={styles.field}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.pickerRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.chip, form.categoriaId === cat._id && styles.chipSelected]}
                  onPress={() => setForm((prev) => ({ ...prev, categoriaId: cat._id }))}
                >
                  <Text style={[styles.chipText, form.categoriaId === cat._id && styles.chipTextSelected]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.categoriaId && <Text style={styles.errorText}>{errors.categoriaId}</Text>}
          </View>

          {locations.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Ubicación *</Text>
              <View style={styles.pickerRow}>
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc._id}
                    style={[styles.chip, form.locationId === loc._id && styles.chipSelected]}
                    onPress={() => setForm((prev) => ({ ...prev, locationId: loc._id }))}
                  >
                    <Text style={[styles.chipText, form.locationId === loc._id && styles.chipTextSelected]}>
                      {loc.nombre || loc.direccion || `#${loc._id}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Button onPress={onSubmit} loading={mutation.isPending}>
            {isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, value, onChange, error, multiline, keyboardType }: {
  label: string; value: string; onChange: (t: string) => void; error?: string; multiline?: boolean; keyboardType?: 'email-address' | 'phone-pad' | 'number-pad'
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError].filter(Boolean) as never[]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surfaceRaised, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 20, gap: 16,
  },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.red },
  errorText: { color: colors.red, fontSize: typography.sizes.xs },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  chipTextSelected: { color: '#fff' },
})

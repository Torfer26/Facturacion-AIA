'use client'

import { useToast } from '@/components/ui/toast'

export function Toaster() {
  const { ToastComponent } = useToast()
  return ToastComponent
} 
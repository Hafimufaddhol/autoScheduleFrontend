import { ref, reactive, readonly } from 'vue'

// Global state for confirmation dialog
const state = reactive({
    isOpen: false,
    title: 'Konfirmasi',
    message: 'Apakah Anda yakin?',
    confirmText: 'Ya',
    cancelText: 'Batal',
    variant: 'danger', // 'danger' | 'warning' | 'info'
    resolve: null
})

/**
 * Composable untuk menampilkan dialog konfirmasi secara promise-based
 * 
 * @example
 * const { confirm } = useConfirmDialog()
 * 
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: 'Hapus Data',
 *     message: 'Yakin ingin menghapus?',
 *     confirmText: 'Ya, Hapus',
 *     variant: 'danger'
 *   })
 *   if (!ok) return
 *   // proceed with delete
 * }
 */
export function useConfirmDialog() {
    const confirm = (options = {}) => {
        return new Promise((resolve) => {
            state.title = options.title || 'Konfirmasi'
            state.message = options.message || 'Apakah Anda yakin?'
            state.confirmText = options.confirmText || 'Ya'
            state.cancelText = options.cancelText || 'Batal'
            state.variant = options.variant || 'danger'
            state.resolve = resolve
            state.isOpen = true
        })
    }

    const handleConfirm = () => {
        if (state.resolve) {
            state.resolve(true)
        }
        state.isOpen = false
        state.resolve = null
    }

    const handleCancel = () => {
        if (state.resolve) {
            state.resolve(false)
        }
        state.isOpen = false
        state.resolve = null
    }

    return {
        state: readonly(state),
        confirm,
        handleConfirm,
        handleCancel
    }
}

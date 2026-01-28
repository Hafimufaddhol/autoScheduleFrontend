<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="handleClose">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Edit Jadwal</h3>
      </div>
      <div class="p-6 space-y-4 overflow-y-auto flex-1">
        <!-- Info Block -->
        <div class="bg-gray-50 rounded-lg p-3 text-sm">
          <p><strong>Kelas:</strong> {{ editForm.kelas_nama }}</p>
          <p><strong>Hari:</strong> {{ editForm.hari }}</p>
          <p><strong>Jam:</strong> {{ editForm.start }} - {{ editForm.start + editForm.size - 1 }} ({{ editForm.size }} JP)</p>
        </div>
        
        <!-- Mode Toggle for Multi-JP -->
        <div v-if="editForm.size > 1" class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="editPerSlot" class="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
            <span class="text-sm text-blue-800">Edit masing-masing jam secara terpisah</span>
          </label>
        </div>
        
        <!-- Bulk Edit (All slots same) -->
        <div v-if="!editPerSlot">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Guru (untuk semua {{ editForm.size }} JP)</label>
              <ReferenceList
                v-model="editForm.guru_id"
                type="guru"
                placeholder="-- Pilih Guru --"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran (untuk semua {{ editForm.size }} JP)</label>
              <ReferenceList
                v-model="editForm.mapel_id"
                type="mapel"
                placeholder="-- Pilih Mapel --"
              />
            </div>
          </div>
        </div>
        
        <!-- Per-Slot Edit -->
        <div v-else class="space-y-4">
          <div v-for="(slotItem, idx) in editForm.slotItems" :key="slotItem.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="font-semibold text-gray-900">Jam ke-{{ slotItem.slot }}</span>
              <span class="text-xs text-gray-500">ID: {{ slotItem.id }}</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Guru</label>
                <ReferenceList
                  v-model="slotItem.new_guru_id"
                  type="guru"
                  placeholder="-- Tidak diubah --"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Mapel</label>
                <ReferenceList
                  v-model="slotItem.new_mapel_id"
                  type="mapel"
                  placeholder="-- Tidak diubah --"
                />
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              Saat ini: {{ guruMap[slotItem.guru_id] || slotItem.guru_id }} - {{ mapelMap[slotItem.mapel_id] || slotItem.mapel_id }}
            </div>
          </div>
        </div>
        
        <!-- Error Message -->
        <div v-if="editError" class="text-red-600 text-sm">
          {{ editError }}
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button 
          @click="handleClose" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Batal
        </button>
        <button 
          @click="handleSave" 
          :disabled="savingEdit"
          class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
        >
          <i v-if="savingEdit" class="fas fa-spinner fa-spin mr-2"></i>
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import ReferenceList from '@/components/ui/ReferenceList.vue';
import jadwalRepository from '@/repositories/jadwalRepository';
import { useJadwalDetail } from '../composables/useJadwalDetail';

export default {
  name: 'EditModal',
  components: {
    ReferenceList
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    block: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { periode, guruMap, mapelMap } = useJadwalDetail();
    
    const editForm = ref({
      item_id: '',
      kelas_nama: '',
      hari: '',
      start: null,
      size: 0,
      guru_id: '',
      mapel_id: '',
      slotItems: []
    });
    const editError = ref('');
    const savingEdit = ref(false);
    const editPerSlot = ref(false);

    // Watch for block changes to populate form
    watch(() => props.block, (newBlock) => {
      if (newBlock) {
        const slotItems = (newBlock.slotItems || []).map(item => ({
          ...item,
          new_guru_id: '',
          new_mapel_id: ''
        }));
        
        editForm.value = {
          item_id: newBlock.block_id,
          kelas_nama: newBlock.kelas_nama || newBlock.kelas_id,
          hari: newBlock.hari,
          start: newBlock.start,
          size: newBlock.size,
          guru_id: newBlock.guru_id || '',
          mapel_id: newBlock.mapel_id || '',
          slotItems: slotItems
        };
        editPerSlot.value = false;
        editError.value = '';
      }
    }, { immediate: true });

    // Reset when closing
    watch(() => props.show, (newShow) => {
      if (!newShow) {
        editForm.value = { item_id: '', kelas_nama: '', hari: '', start: null, size: 0, guru_id: '', mapel_id: '', slotItems: [] };
        editError.value = '';
        editPerSlot.value = false;
      }
    });

    const handleClose = () => {
      emit('close');
    };

    const handleSave = async () => {
      savingEdit.value = true;
      editError.value = '';

      try {
        if (editPerSlot.value) {
          // Per-slot editing: update each slot that has changes
          const updates = [];
          for (const slotItem of editForm.value.slotItems) {
            const updateData = {};
            if (slotItem.new_guru_id) {
              updateData.guru_id = slotItem.new_guru_id;
              updateData.guru_nama = guruMap.value[slotItem.new_guru_id] || slotItem.new_guru_id;
            }
            if (slotItem.new_mapel_id) {
              updateData.mapel_id = slotItem.new_mapel_id;
              updateData.mapel_nama = mapelMap.value[slotItem.new_mapel_id] || slotItem.new_mapel_id;
            }
            if (Object.keys(updateData).length > 0) {
              updates.push(jadwalRepository.updateItem(periode.value, slotItem.id, updateData));
            }
          }
          
          if (updates.length === 0) {
            editError.value = 'Pilih minimal satu perubahan untuk disimpan';
            savingEdit.value = false;
            return;
          }
          
          await Promise.all(updates);
        } else {
          // Bulk editing: apply same change to all slots in block
          if (!editForm.value.guru_id && !editForm.value.mapel_id) {
            editError.value = 'Pilih minimal satu field untuk diubah';
            savingEdit.value = false;
            return;
          }
          
          const updateData = {};
          if (editForm.value.guru_id) {
            updateData.guru_id = editForm.value.guru_id;
            updateData.guru_nama = guruMap.value[editForm.value.guru_id] || editForm.value.guru_id;
          }
          if (editForm.value.mapel_id) {
            updateData.mapel_id = editForm.value.mapel_id;
            updateData.mapel_nama = mapelMap.value[editForm.value.mapel_id] || editForm.value.mapel_id;
          }
          
          // Update all slots in the block
          const updates = editForm.value.slotItems.map(slotItem => 
            jadwalRepository.updateItem(periode.value, slotItem.id, updateData)
          );
          await Promise.all(updates);
        }
        
        emit('saved');
        emit('close');
      } catch (err) {
        console.error('Error saving edit:', err);
        editError.value = err.response?.data?.error || err.message || 'Gagal menyimpan perubahan';
      } finally {
        savingEdit.value = false;
      }
    };

    return {
      editForm,
      editError,
      savingEdit,
      editPerSlot,
      guruMap,
      mapelMap,
      handleClose,
      handleSave
    };
  }
};
</script>

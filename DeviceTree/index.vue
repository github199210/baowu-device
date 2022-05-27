<template>
  <div class="devicetree">
    <ul class="device-item-wrap" v-if="mode === 'tree'">
      <TreeItem class="item" :model="rootDomain" />
    </ul>
    <div v-if="mode === 'select'">
      <SelectItem
        :model="rootDomain"
        :inline="inline"
        :onlyDevice="onlyDevice"
        ref="selectItem"
      ></SelectItem>
    </div>
  </div>
</template>
<script>
import TreeItem from './TreeItem'
import SelectItem from './SelectItem.vue'
import mixin from '../mixins'

export default {
  name: 'DeviceTree',
  inject: ['deviceOptions'],
  mixins: [mixin],
  props: {
    mode: {
      type: String,
      default: 'tree'
    },
    inline: {
      type: Boolean,
      default: false
    },
    onlyDevice: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  components: { TreeItem, SelectItem },
  data() {
    return {
      rootDomain: {}
    }
  },
  computed: {},
  async created() {
    try {
      this.rootDomain = await this.$deviceStore.commit('getRootDomain')
      if (!this.deviceOptions.showGroup) {
        this.$deviceStore.commit('setSelectedNode', { ...this.rootDomain })
        this.dispatch('DeviceOptions', 'getCheckedNode', { ...this.rootDomain })
        this.dispatch('DeviceOptions', 'getBreadcrumb', this.$deviceStore.state.breadcrumb)
      }
      const deviceCode = this.deviceOptions.initDeviceCode
      if (deviceCode) {
        const deviceInfo = await this.$deviceStore.commit('getDeviceListByConditionWithPage', {
          deviceCodeOrName: deviceCode
        })
        const { data } = deviceInfo
        if (data.length > 0) {
          this.$deviceStore.commit('setSelectedNode', { category: 'device', ...data[0] })
          this.dispatch('DeviceOptions', 'getCheckedNode', { category: 'device', ...data[0] })
          this.dispatch('DeviceOptions', 'getBreadcrumb', this.$deviceStore.state.breadcrumb)
        }
      }
    } catch (error) {
      this.$message.error(error)
    }
  },
  methods: {
    validateForm(cb) {
      this.$refs.selectItem.validateForm(valid => {
        cb(valid)
      })
    },
    getValues(cb) {
      this.$refs.selectItem.getValues(valid => {
        cb(valid)
      })
    },
    resetForm() {
      this.$refs.selectItem.resetForm()
    }
  }
}
</script>
<style lang="scss" scoped>
.devicetree {
  // margin: 15px;
  // padding: 15px;
}
.device-item-wrap {
  margin: 0;
  padding: 0;
  overflow: auto;
  height: 100%;
}
.item {
  cursor: pointer;
  line-height: 1.5;
}
.bold {
  font-weight: bold;
}
</style>

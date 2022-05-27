<template>
  <div class="mydevice-group">
    <div class="align-right">
      <el-link type="primary" :underline="false" @click="showDeviceGroup = true"
        >管理设备组</el-link
      >
    </div>
    <div v-for="item in groupLists" :key="item.id" class="group-list">
      <div class="group-title">
        <span
          class="device-name"
          :class="{ is_active: currentGroupId === item.id }"
          @click="changeCurrentNodeId(item, 'group')"
        >
          {{ item.name }}
        </span>
        <i
          class="expand-icon el-icon-caret-top"
          :class="{ rotate180: item.isOpen }"
          @click="toggle(item.id)"
        ></i>
      </div>
      <ul class="group-wrap animate-wrap" v-show="item.isOpen">
        <li
          class="device-item"
          v-for="(device, deviceIndex) in item.children"
          :key="deviceIndex"
          :class="{ is_active: currentDeviceId === device.deviceId }"
          @click="changeCurrentNodeId(device, 'device')"
        >
          {{ device.deviceName }}
        </li>
      </ul>
    </div>

    <DeviceGroupDialog
      v-model="showDeviceGroup"
      v-if="showDeviceGroup"
      @cancel="groupDialogHide"
    ></DeviceGroupDialog>
  </div>
</template>
<script>
import DeviceGroupDialog from '../Dialog/DeviceGroupDialog.vue'
import mixin from '../mixins'
export default {
  name: 'MyDeviceGroup',
  mixins: [mixin],
  components: { DeviceGroupDialog },
  data() {
    return {
      showDeviceGroup: false,
      activeGroup: '',
      groupLists: []
    }
  },
  computed: {
    currentGroupId() {
      return this.$deviceStore.state.selectedNode.id
    },
    currentDeviceId() {
      return this.$deviceStore.state.selectedNode.deviceId
    }
  },
  created() {
    this.getGroupList()
  },
  methods: {
    async getGroupList() {
      try {
        const res = await this.$deviceStore.commit('getDeviceGroupList', {})
        const { data } = res
        if (data) {
          let openItem = this.groupLists.filter(item => item.isOpen)
          this.groupLists = data.map(item => ({ ...item, isOpen: false, children: [] }))
          if (openItem.length > 0) {
            openItem.forEach(item => {
              this.toggle(item.id)
            })
          }
        } else {
          this.groupLists = []
        }
      } catch (error) {
        this.$message.error(error)
      }
    },
    async toggle(deviceGroupId) {
      let index = this.groupLists.findIndex(item => item.id === deviceGroupId)
      if (index === -1) return
      this.groupLists[index].isOpen = !this.groupLists[index].isOpen
      try {
        const isOpen = this.groupLists[index].isOpen
        if (isOpen) {
          const res = await this.$deviceStore.commit('getDeviceListByDeviceGroupId', {
            deviceGroupId
          })
          const { data } = res
          this.groupLists[index].children = data || []
        }
      } catch (error) {
        this.$message.error(error)
      }
    },
    async changeCurrentNodeId(item, category) {
      if (category === 'group') {
        let index = this.groupLists.findIndex(i => i.id === item.id)
        if (!this.groupLists[index].isOpen) {
          await this.toggle(item.id)
        }
      }
      this.$deviceStore.commit('setSelectedNode', { category, ...item })
      this.dispatch('DeviceOptions', 'getCheckedNode', { category, ...item })
      this.dispatch('DeviceOptions', 'getBreadcrumb', this.$deviceStore.state.breadcrumb)
    },
    async groupDialogHide() {
      this.showDeviceGroup = false
      await this.getGroupList()
      this.groupLists.splice(this.getGroupList.length - 1, 0)
    }
  }
}
</script>
<style scoped>
@keyframes slideInLeft {
  from {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
    visibility: visible;
  }

  to {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}
.animate-wrap {
  animation-name: slideInLeft;
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
.group-title {
  padding: 0 5px 0 15px;
  height: 40px;
  margin: 0;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  background: rgba(0, 0, 0, 0.3);
}
.device-name {
  flex: 1;
  color: #fff;
}
.device-item {
  color: #fff;
}
.align-right {
  text-align: right;
  margin-bottom: 10px;
}
.group-wrap li {
  text-indent: 2em;
  padding: 10px 0;
}
.mydevice-group {
  overflow: auto;
}
.group-list {
  overflow: auto;
  margin: 10px 0;
}
.is_active {
  color: #3cd3a6 !important;
}
.rotate180 {
  transform: rotate(180deg);
}
.expand-icon {
  width: 50px;
  text-align: center;
  transition: transform 0.3s ease-in-out;
  color: #858c94;
}
</style>

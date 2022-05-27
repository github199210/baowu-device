<template>
  <div class="device-options">
    <MyTabs v-model="activeTabCom">
      <TabItem
        v-for="(item, index) in tabLists"
        :key="index"
        :label="item.label"
        :name="item.components"
      >
        <keep-alive include="MyDevice">
          <component :is="item.components"></component>
        </keep-alive>
      </TabItem>
    </MyTabs>
  </div>
</template>
<script>
import MyDevice from './MyDevice.vue'
import MyCollection from './MyCollection.vue'
import MyDeviceGroup from './MyDeviceGroup.vue'
import MyTabs from '../MyTabs'
import TabItem from '../MyTabs/TabItem.vue'
export default {
  name: 'DeviceOptions',
  provide() {
    return {
      deviceOptions: this
    }
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    showGroup: {
      type: Boolean,
      default: true
    },
    initDeviceCode: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  components: { MyDevice, MyCollection, MyDeviceGroup, MyTabs, TabItem },
  data() {
    return {
      tabLists: [
        {
          label: '我的设备',
          components: 'MyDevice'
        },
        {
          label: '我的收藏',
          components: 'MyCollection'
        },
        {
          label: '我的设备组',
          components: 'MyDeviceGroup'
        }
      ],
      activeTabCom: 'MyDevice'
    }
  },
  created() {
    this.tabLists = this.showGroup
      ? [
          {
            label: '我的设备',
            components: 'MyDevice'
          },
          {
            label: '我的收藏',
            components: 'MyCollection'
          },
          {
            label: '我的设备组',
            components: 'MyDeviceGroup'
          }
        ]
      : [
          {
            label: '我的设备',
            components: 'MyDevice'
          },
          {
            label: '我的收藏',
            components: 'MyCollection'
          }
        ]
  },
  methods: {
    switchTab(components) {
      this.activeTabCom = components
    },
    getCheckedNode(checkedNode) {
      this.$emit('getCheckedNode', checkedNode)
    },
    getBreadcrumb(breadcrumb) {
      this.$emit('getBreadcrumb', breadcrumb)
    }
  }
}
</script>
<style lang="scss" scoped>
.device-tabs {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: nowrap;
  overflow: auto;
  li {
    padding: 5px;
    white-space: nowrap;
    cursor: pointer;
    color: #058bd4;
  }
  li.is-active {
    color: #fff;
  }
}
.device-main {
  padding: 10px;
}
</style>

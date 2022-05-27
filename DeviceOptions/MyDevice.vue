<template>
  <div>
    <div class="mydevice-flex">
      <el-input
        v-model="searchValue"
        clearable
        @keydown.enter.native="dialogVisible = true"
        placeholder="请输入设备名称或设备编码"
      ></el-input>
      <el-button @click="dialogVisible = true" type="primary">搜索</el-button>
    </div>
    <div class="mydevice-tree">
      <!-- <DeviceTree mode="select" :inline="true"></DeviceTree> -->
      <!-- {{ currentNode }} -->
      <DeviceTree v-model="currentNode"></DeviceTree>
    </div>
    <!-- 高级搜索弹窗 -->
    <SearchDialog
      :title="searchTitle"
      :searchValue="searchValue"
      v-model="dialogVisible"
      v-if="dialogVisible"
      @cancel="dialogVisible = false"
      @onSubmit="onSubmit"
    ></SearchDialog>
  </div>
</template>
<script>
import DeviceTree from '../DeviceTree/index.vue'
import SearchDialog from '../Dialog/SearchDialog.vue'
import mixin from '../mixins'
export default {
  name: 'MyDevice',
  mixins: [mixin],
  components: { DeviceTree, SearchDialog },
  data() {
    return {
      searchTitle: '高级搜索',
      searchValue: '',
      dialogVisible: false,
      currentNode: {}
    }
  },
  methods: {
    onSubmit(nodeObj) {
      this.$deviceStore.commit('setSelectedNode', { ...nodeObj, category: 'device' })
      this.dispatch('DeviceOptions', 'getCheckedNode', {
        ...nodeObj,
        category: 'device'
      })
      this.dispatch('DeviceOptions', 'getBreadcrumb', this.$deviceStore.state.breadcrumb)
    },
    showSearchDialog() {}
  }
}
</script>
<style lang="scss" scoped>
.mydevice-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: auto;
  padding: 5px;
  // gap: 10px;
  ::v-deep .el-input {
    font-size: 16px;
    .el-input__inner {
      background: transparent;
      border-color: #4f5c68;
      height: 40px;
      color: #fff;
    }
  }
  ::v-deep .el-button {
    // padding: 7px;
    font-size: 16px;
    background: transparent;
    border-color: #4f5c68;
    height: 40px;
    color: #a8afb4;
    box-shadow: 0 0 10px #5f6b76;
    &:hover {
      color: #fff;
      box-shadow: 0 0 10px #fff;
    }
  }
}
.mydevice-search {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 40px;
  border-radius: 3px;
  background: #151d29;
  ::v-deep.el-input {
    height: 100%;
    .el-input__inner {
      height: 100%;
      background: transparent;
      border: none;
      color: #fff;
    }
  }
}
.mydevice-tree {
  margin: 10px 0;
  padding: 0 5px;
}
</style>

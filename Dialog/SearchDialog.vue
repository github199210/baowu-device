<template>
  <el-dialog
    class="search-dialog"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal-append-to-body="false"
    :append-to-body="true"
    @close="cancel"
    width="55%"
    size="medium"
  >
    <el-form :model="form" :inline="true" label-width="100" ref="searchForm">
      <el-form-item label="设备:" prop="deviceCodeOrName">
        <el-input v-model="form.deviceCodeOrName" placeholder="请输入内容..."></el-input>
      </el-form-item>
      <el-form-item label="专业项目分类：" prop="specialtyCodeList">
        <el-checkbox-group v-model="form.specialtyCodeList">
          <el-checkbox v-for="(item, index) in majorItems" :key="index" :label="item.value">{{
            item.label
          }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="管理属性：" prop="attrs">
        <el-checkbox v-model="form.careService">看护服务设备</el-checkbox>
        <el-checkbox v-model="form.meteringDevice">计量设备</el-checkbox>
        <el-checkbox v-model="form.specialDevice">特种设备</el-checkbox>
      </el-form-item>
      <el-form-item label="重要程度：" prop="importanceDegreeCodeList">
        <el-checkbox-group v-model="form.importanceDegreeCodeList">
          <el-checkbox v-for="(item, index) in importantLevel" :key="index" :label="item.value">{{
            item.label
          }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item style="float: right">
        <el-button type="primary" @click="onSearch">查 询</el-button>
        <el-button @click="onReset">重 置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-dialog">
      <el-table :data="tableData" style="width: 100%" height="410" border>
        <el-table-column prop="deviceCode" label="设备编码"> </el-table-column>
        <el-table-column prop="deviceName" label="设备名称"> </el-table-column>
        <el-table-column prop="domainNamePath" label="管理域"> </el-table-column>
        <el-table-column label="操作" width="100px">
          <template slot-scope="{ row }">
            <el-link type="primary" :underline="false" @click="onSubmit(row)">选 择</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <p>显示第 {{ pageInfo.start }} 至 {{ pageInfo.end }} 项记录，共 {{ total }} 项</p>
        <el-pagination
          prev-text="上页"
          next-text="下页"
          background
          layout="sizes,prev, pager, next"
          :page-size="pagination.limit"
          :current-page="pageNum"
          :total="total"
          @current-change="changeCurrentPage"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </div>
  </el-dialog>
</template>
<script>
const majorItems = Object.freeze([
  {
    label: '起重机',
    value: 'QiZhongJi'
  },
  {
    label: '风机',
    value: 'FengJi'
  },
  {
    label: '连铸机',
    value: 'LianZhuJi'
  },
  {
    label: '电气室',
    value: 'DianQiShi'
  },
  {
    label: '油库',
    value: 'YouKu'
  }
])
const manageAttrs = Object.freeze([
  {
    label: '看护服务设备',
    value: 'careService'
  },
  {
    label: '计量设备',
    value: 'meteringDevice'
  },
  {
    label: '特种设备',
    value: 'specialDevice'
  }
])
const importantLevel = Object.freeze([
  {
    label: '关键',
    value: 'GuanJian'
  },
  {
    label: '重要',
    value: 'ZhongYao'
  },
  {
    label: '一般',
    value: 'YiBan'
  }
])
export default {
  props: {
    title: {
      type: String,
      default: '高级搜索'
    },
    value: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  created() {
    this.visible = this.value
    this.form.deviceCodeOrName = this.searchValue
    this.onSearch()
  },
  data() {
    return {
      majorItems,
      manageAttrs,
      importantLevel,
      visible: true,
      form: {
        deviceCodeOrName: '',
        careService: null,
        meteringDevice: null,
        specialDevice: null,
        specialtyCodeList: [],
        importanceDegreeCodeList: []
      },
      tableData: [],
      pagination: {
        limit: 10,
        offset: 0
      },
      total: 0,
      pageNum: 1
    }
  },
  computed: {
    pageInfo() {
      let { limit } = this.pagination
      let start = (this.pageNum - 1) * limit + 1
      let end = start + this.tableData.length - 1
      return {
        start,
        end
      }
    }
  },
  methods: {
    async getDeviceList() {
      try {
        this.pagination.offset = (this.pageNum - 1) * this.pagination.limit
        const { limit, offset } = this.pagination
        const { careService, meteringDevice, specialDevice } = this.form
        let params = {
          ...this.form,
          limit,
          offset,
          showCount: true
        }
        params.careService = careService ? 1 : null
        params.meteringDevice = meteringDevice ? 1 : null
        params.specialDevice = specialDevice ? 1 : null
        const res = await this.$deviceStore.commit('getDeviceListByConditionWithPage', params)
        const { total, data } = res
        this.tableData = data
        this.total = total
      } catch (error) {
        this.$message.error(error)
      }
    },
    cancel() {
      this.$emit('cancel')
      this.visible = false
    },
    onSubmit(row) {
      this.$emit('onSubmit', row)
      this.cancel()
    },
    isEmpty() {
      const {
        deviceCodeOrName,
        careService,
        meteringDevice,
        specialDevice,
        specialtyCodeList,
        importanceDegreeCodeList
      } = this.form
      if (
        !deviceCodeOrName &&
        !careService &&
        !meteringDevice &&
        !specialDevice &&
        specialtyCodeList.length === 0 &&
        importanceDegreeCodeList.length === 0
      ) {
        this.$message.warning('请选择筛选条件！')
        return true
      }
      return false
    },
    onSearch() {
      if (this.isEmpty(this.form)) {
        this.tableData = []
      } else {
        this.pageNum = 1
        this.getDeviceList()
      }
    },
    onReset() {
      // this.$refs.searchForm.resetFields()
      this.form = this.$options.data().form
      this.tableData = []
      this.total = 0
    },
    changeCurrentPage(pageNum) {
      this.pageNum = pageNum
      this.getDeviceList()
    },
    handleSizeChange(pageSize) {
      this.pagination.limit = pageSize
      this.pageNum = 1
      this.getDeviceList()
    }
  }
}
</script>
<style lang="scss" scoped>
// ::v-deep.el-form-item {
//   .el-form-item__label {
//     color: #000 !important;
//     font-weight: 700;
//   }
// }
// ::v-deep .el-table .cell {
//   color: #000;
// }
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #969ba2;
  margin-top: 20px;
}
</style>
<style lang="scss">
.table-dialog {
  // .el-table .cell {
  //   color: #000;
  // }
  // .el-table--border,
  // .el-table--group {
  //   border: 1px solid #ebeef5;
  // }
  // .el-table td,
  // .el-table th.is-leaf {
  //   border-bottom-color: #ebeef5 !important;
  // }
  // .el-table--border::after,
  // .el-table--group::after,
  // .el-table::before {
  //   background-color: #ebeef5;
  // }
  // .el-table__empty-text {
  //   color: #000;
  // }
}
</style>

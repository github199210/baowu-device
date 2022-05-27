<template>
  <el-dialog
    class="device-group"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal-append-to-body="false"
    :append-to-body="true"
    @close="cancel"
    width="60%"
    size="medium"
  >
    <div class="device-info">
      <div class="header-title">设备组信息</div>
      <div class="device-main">
        <el-form :inline="true" :model="searchParam">
          <el-form-item label="设备组代码">
            <el-select v-model="searchParam.code" filterable placeholder="请选择" clearable>
              <el-option v-for="item in groupCodeList" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备组名称">
            <el-input v-model="searchParam.name" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item label="设备组说明">
            <el-input v-model="searchParam.description" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getGroupLists('search')">查询</el-button>
          </el-form-item>
        </el-form>
        <div class="btns">
          <el-button type="primary" plain @click="addDeviceGroup">新增</el-button>
          <el-button type="primary" plain :disabled="saveGroupDisabled" @click="saveGroup"
            >保存</el-button
          >
          <el-button type="primary" plain :disabled="deleteGroupDisabled" @click="deleteGroup"
            >删除</el-button
          >
        </div>
        <div class="table-dialog">
          <el-table
            :data="tableData"
            style="width: 100%"
            height="250"
            border
            @selection-change="handleSelectionChange"
            :row-style="rowStyle"
            v-loading="groupLoading"
            @row-click="handleRowClick"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="code" label="设备组代码" align="center"> </el-table-column>
            <el-table-column prop="name" label="设备组名称" align="center">
              <template slot-scope="{ row }">
                <div class="test" @dblclick="editDesc(row, 'nameEditing', true)">
                  <label v-show="!row.nameEditing">{{ row.name || '无' }}</label>
                  <div v-show="row.nameEditing" class="edit-wrap">
                    <el-input v-model="row.name"></el-input>
                    <i
                      class="el-icon-close close-icon"
                      @click="editDesc(row, 'nameEditing', false)"
                    ></i>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="设备组说明" align="center">
              <template slot-scope="{ row }">
                <div class="test" @dblclick="editDesc(row, 'descEditing', true)">
                  <label v-show="!row.descEditing">{{ row.description || '无' }}</label>

                  <div v-show="row.descEditing" class="edit-wrap">
                    <el-input v-model="row.description"></el-input>
                    <i
                      class="el-icon-close close-icon"
                      @click="editDesc(row, 'descEditing', false)"
                    ></i>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建日期" align="center">
              <template slot-scope="{ row }">
                {{ dateFormat(row.createTime, 'yyyy-MM-dd HH:mm') }}
              </template>
            </el-table-column>
            <el-table-column prop="reviseTime" label="最后修改时间" align="center">
              <template slot-scope="{ row }">
                {{ dateFormat(row.reviseTime, 'yyyy-MM-dd HH:mm') }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="device-info">
      <div class="header-title">设备信息</div>
      <div class="device-main">
        <el-form :inline="true" :model="currentRow" :rules="deviceGroupRules" ref="deviceGroupForm">
          <el-form-item label="设备组代码">
            <el-input v-model="currentRow.code" disabled></el-input>
          </el-form-item>
          <el-form-item label="设备组名称" prop="name">
            <el-input
              v-model="currentRow.name"
              placeholder="请输入设备组名称"
              :disabled="Boolean(currentRow.id)"
            ></el-input>
          </el-form-item>
          <el-form-item label="设备组说明">
            <el-input
              v-model="currentRow.description"
              placeholder="请输入设备组说明"
              :disabled="Boolean(currentRow.id)"
            ></el-input>
          </el-form-item>
        </el-form>
        <div class="btns">
          <el-button type="primary" plain @click="addDevice">添加</el-button>
          <el-button type="primary" plain @click="saveGroup">保存</el-button>
          <el-button type="primary" plain @click="deleteDevice">删除</el-button>
        </div>
        <div class="table-dialog">
          <el-table
            :data="deviceTableData"
            style="width: 100%"
            height="250"
            border
            v-loading="deviceTableLoading"
            @selection-change="handleDeviceSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="deviceCode" label="设备代码" align="center"> </el-table-column>
            <el-table-column prop="deviceName" label="设备名称" align="center"> </el-table-column>
            <el-table-column prop="deviceTypeName" label="设备类别" align="center">
            </el-table-column>
            <el-table-column prop="domainNamePath" label="设备路径" align="center">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <el-dialog
      class="device-list"
      title="设备查询"
      :visible.sync="deviceVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal-append-to-body="false"
      :append-to-body="true"
      @close="deviceCancel"
      width="90%"
      size="medium"
    >
      <div>
        <div style="float: right">
          <el-button type="primary" @click="searchDevice">查询</el-button>
          <el-button @click="resetDevice">重置</el-button>
        </div>
        <DeviceTree
          mode="select"
          :inline="true"
          onlyDevice
          v-model="selectedNode"
          ref="devicetree"
        ></DeviceTree>
      </div>
      <div class="table-dialog">
        <el-table
          :data="deviceTableList"
          style="width: 100%"
          row-key="deviceCode"
          border
          v-loading="deviceLoading"
          @selection-change="deviceDialogSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="deviceCode" label="设备代码" align="center"> </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" align="center"> </el-table-column>
          <el-table-column prop="deviceTypeName" label="设备类别" align="center"> </el-table-column>
          <el-table-column prop="domainNamePath" label="设备路径" align="center"> </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          background
          layout="prev, pager, next"
          :page-size="pagination.limit"
          :current-page="pageNum"
          :total="total"
          @current-change="changeCurrentPage"
        >
        </el-pagination>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deviceVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import DeviceTree from '@/packages/DeviceTree'
export default {
  components: { DeviceTree },
  props: {
    title: {
      type: String,
      default: '设备组管理'
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      visible: true,
      deviceVisible: false,
      searchParam: { code: '', name: '', description: '' },
      groupCodeList: [],
      currentGroup: {},
      tableData: [],
      tableDataCache: [],
      deviceTableData: [],
      pagination: {
        limit: 10,
        offset: 0
      },
      pageNum: 1,
      total: 0,
      groupLoading: false,
      currentRow: {
        code: '',
        name: '',
        description: '',
        id: ''
      },
      deviceGroupIdList: [],
      deviceCodeList: [],
      selectedNode: {},
      deviceTableList: [],
      deviceLoading: false,
      deviceTableLoading: false,
      selectedDevice: [],
      deviceGroupRules: {
        name: [{ required: true, message: '设备组名称不能为空！' }]
      },
      deviceAdd: false,
      cacheDeviceCodeList: []
    }
  },
  computed: {
    saveGroupDisabled() {
      return !this.tableData.some(item => item.nameEditing || item.descEditing)
    },
    deleteGroupDisabled() {
      return this.deviceGroupIdList.length === 0
    }
  },
  async created() {
    this.visible = this.value
    await this.getGroupLists()
  },
  methods: {
    dateFormat(time, fmt) {
      if (!time) return ''
      else {
        const date = new Date(time)
        const o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'H+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds(),
          'q+': Math.floor((date.getMonth() + 3) / 3),
          S: date.getMilliseconds()
        }
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (const k in o) {
          if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(
              RegExp.$1,
              RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            )
          }
        }
        return fmt
      }
    },
    rowStyle({ row }) {
      if (row.id === this.currentRow.id) {
        return {
          background: '#155684'
        }
      }
    },
    editDesc(row, type, status) {
      this.initEditingStatus()
      row[type] = status
    },
    initEditingStatus() {
      let findIndex = this.tableData.findIndex(item => item.nameEditing || item.descEditing)
      if (findIndex > -1) {
        this.tableData[findIndex].description = this.tableDataCache[findIndex].description
        this.tableData[findIndex].name = this.tableDataCache[findIndex].name
        this.tableData[findIndex].nameEditing = false
        this.tableData[findIndex].descEditing = false
      }
    },
    handleRowClick(row) {
      if (this.currentRow.id !== row.id) {
        this.initEditingStatus()
      }
      this.currentRow = JSON.parse(JSON.stringify(row))
      this.getDeviceList()
    },
    cancel() {
      this.$emit('cancel')
      this.visible = false
    },
    async getGroupLists(val) {
      try {
        this.groupLoading = true
        const res = await this.$deviceStore.commit(
          'getDeviceGroupList',
          JSON.parse(JSON.stringify(this.searchParam))
        )
        const { data } = res
        if (data && data.length > 0) {
          this.tableData = data.map(item => ({ ...item, nameEditing: false, descEditing: false }))
          this.tableDataCache = JSON.parse(JSON.stringify(data))
          if (!this.currentRow.id || val) {
            this.currentRow = JSON.parse(JSON.stringify(data[0]))
          }
          this.getDeviceList()
        } else {
          this.currentRow = this.$options.data().currentRow
          this.tableData = []
          this.tableDataCache = []
          this.deviceTableData = []
          this.cacheDeviceCodeList = []
        }
        !val ? (this.groupCodeList = this.tableData.map(item => item.code)) : null
        this.groupLoading = false
      } catch (error) {
        this.groupLoading = false
      }
    },
    async getDeviceList() {
      try {
        this.deviceTableLoading = true
        const res = await this.$deviceStore.commit('getDeviceListByDeviceGroupId', {
          deviceGroupId: this.currentRow.id
        })
        const { data } = res
        if (data) {
          // data.forEach(item => {
          //   let tempObj = item.domainKVList.reduce((cur, result) => {
          //     return { ...result, ...cur }
          //   }, {})
          //   item.path = Object.keys(tempObj)
          //     .map(key => tempObj[key])
          //     .reverse()
          //     .join('/')
          // })
          this.deviceTableData = data
          this.cacheDeviceCodeList = data.map(item => item.deviceCode)
        } else {
          this.deviceTableData = []
          this.cacheDeviceCodeList = []
        }
        this.deviceTableLoading = false
      } catch (error) {
        this.$message.error('关联设备获取失败！')
        this.deviceTableData = []
        this.cacheDeviceCodeList = []
        this.deviceTableLoading = false
      }
    },
    addDeviceGroup() {
      this.deviceVisible = true
      this.deviceAdd = false
    },
    addDevice() {
      this.deviceVisible = true
      this.deviceAdd = true
    },
    saveGroup() {
      this.$refs.deviceGroupForm.validate(async valid => {
        if (valid) {
          try {
            let params
            let deviceCodeList = this.deviceTableData.map(item => item.deviceCode)
            if (!this.currentRow.id) {
              // 新增
              const { name, description } = this.currentRow
              let newCode = await this.$deviceStore.commit('generateDeviceGroupCode')
              params = {
                id: '',
                code: newCode,
                deviceCodeList,
                name,
                description
              }
              if (deviceCodeList.length > 0) {
                await this.$deviceStore.commit('saveDeviceGroup', params)
                await this.getGroupLists()
                this.currentRow =
                  this.tableData.find(item => item.code === newCode) || this.tableData[0]
                this.getDeviceList()
              } else {
                this.$message.warning('请至少选择一个设备！')
                return
              }
            } else {
              // 修改
              const { name, description, code, id } = this.tableData.find(
                item => item.id === this.currentRow.id
              )
              params = {
                id,
                code,
                deviceCodeList,
                name,
                description
              }
              if (deviceCodeList.length > 0) {
                await this.$deviceStore.commit('saveDeviceGroup', params)
                await this.getGroupLists()
              } else {
                this.$message.warning('请至少选择一个设备！')
                return
              }
            }
            this.$message.success('保存成功！')
          } catch (error) {
            this.$message.error(error)
          }
        }
      })
    },
    async deleteGroup() {
      try {
        const deviceGroupIdList = this.deviceGroupIdList
        await this.$deviceStore.commit('deleteDeviceGroup', { deviceGroupIdList })
        if (deviceGroupIdList.includes(this.currentRow.id)) {
          this.currentRow = this.$options.data().currentRow
        }
        this.getGroupLists()
        this.$message.success('删除成功！')
      } catch (error) {
        this.$message.error('删除失败！')
      }
    },
    async deleteDevice() {
      try {
        const deviceGroupIdList = [this.currentRow.id]
        let oldDeviceCodeList = this.deviceCodeList.filter(item =>
          this.cacheDeviceCodeList.includes(item)
        )
        this.deviceTableData = this.deviceTableData.filter(
          item => !this.deviceCodeList.includes(item.deviceCode)
        )
        if (oldDeviceCodeList.length > 0) {
          await this.$deviceStore.commit('deleteDeviceGroup', {
            deviceGroupIdList,
            deviceCodeList: oldDeviceCodeList
          })
        }
        // this.getDeviceList()
        this.$message.success('删除成功！')
      } catch (error) {
        this.$message.error('删除失败！')
      }
    },
    deviceCancel() {},
    unique(arr, code) {
      const res = new Map()
      return arr.filter(item => !res.has(item[code]) && res.set(item[code], 1))
    },
    async onSubmit() {
      try {
        this.deviceVisible = false
        if (this.deviceAdd) {
          this.deviceTableData = this.unique(
            this.deviceTableData.concat(JSON.parse(JSON.stringify(this.selectedDevice))),
            'deviceCode'
          )
        } else {
          this.deviceTableData = JSON.parse(JSON.stringify(this.selectedDevice))
          this.currentRow.code = await this.$deviceStore.commit('generateDeviceGroupCode')
          this.currentRow.name = ''
          this.currentRow.description = ''
          this.currentRow.id = ''
        }
      } catch (error) {
        console.error(error)
        this.$message.error(error)
      }
    },
    onReset() {
      this.$refs.searchForm.resetFields()
      this.tableData = []
    },
    changeCurrentPage(val) {
      this.pagination.offset = (val - 1) * this.pagination.limit
      this.pageNum = val
      this.getDeviceList1()
    },
    handleSelectionChange(val) {
      this.deviceGroupIdList = val.map(item => item.id)
    },
    handleDeviceSelectionChange(val) {
      this.deviceCodeList = val.map(item => item.deviceCode)
    },
    deviceDialogSelectionChange(val) {
      this.selectedDevice = val
    },
    getDeviceList1() {
      this.$refs.devicetree.getValues(async formValue => {
        // console.log('formValue', formValue)
        const { base, factory, product, area, device } = formValue
        let tempObj = { base, factory, product, area },
          domainId = ''
        for (const key in tempObj) {
          if (Object.hasOwnProperty.call(tempObj, key)) {
            const element = tempObj[key]
            if (element) {
              domainId = element
            }
          }
        }
        if (!domainId && !device) {
          this.$message.warning('请选择查询条件！')
          return
        } else {
          try {
            this.deviceLoading = true
            const { limit, offset } = this.pagination
            let params = {
              domainId,
              deviceCodeOrName: device,
              limit,
              offset,
              showCount: true
            }
            const res = await this.$deviceStore.commit('getDeviceListByConditionWithPage', params)
            const { total, data } = res
            this.deviceTableList = data
            this.total = total
            this.deviceLoading = false
          } catch (error) {
            this.deviceLoading = false
          }
        }
      })
    },
    searchDevice() {
      this.pageNum = 1
      this.pagination.offset = 0
      this.getDeviceList1()
    },
    resetDevice() {
      this.$refs.devicetree.resetForm()
      this.deviceTableList = []
      this.total = 0
      this.pageNum = 1
      this.pagination.offset = 0
    }
  }
}
</script>
<style lang="scss" scoped>
.device-group {
  ::v-deep .el-dialog {
    margin: 0 auto !important;
    height: 100vh;
    overflow: auto;
  }
}
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
  text-align: right;
  margin-top: 20px;
}
.btns {
  text-align: right;
  margin-bottom: 20px;
}
.device-info {
  border: 1px solid #03283c;
  // height: calc(50vh - 60px);
  .header-title {
    background: #03283c;
    padding: 10px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #fff;
  }
}
.device-main {
  padding: 0 20px 20px;
}
.edit-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  .close-icon {
    cursor: pointer;
    font-size: 20px;
    &:hover {
      color: #409eff;
    }
  }
}
</style>
<style lang="scss">
.device-list {
  // .el-form-item {
  //   .el-form-item__label {
  //     color: #000 !important;
  //     font-weight: 700;
  //   }
  // }
}
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

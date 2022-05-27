<template>
  <el-form
    :class="{ 'device-form': !inline }"
    :inline="inline"
    :model="form"
    :rules="rules"
    :label-width="inline ? '' : '100px'"
    label-position="left"
    ref="deviceForm"
  >
    <!-- <el-form-item label="集团" prop="domain" v-if="!onlyDevice">
      <el-select v-model="form.domain" filterable placeholder="请选择" @change="domainChange">
        <el-option v-for="item in domainOptions" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
    </el-form-item> -->
    <el-form-item label="基地" prop="base" v-if="isShow.showBase">
      <el-select v-model="form.base" filterable placeholder="请选择" clearable @change="baseChange">
        <el-option v-for="item in baseOptions" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="厂部" prop="factory" v-if="isShow.showFactory">
      <el-select
        v-model="form.factory"
        filterable
        placeholder="请选择"
        clearable
        @change="factoryChange"
      >
        <el-option
          v-for="item in factoryOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="产线" prop="product" v-if="isShow.showProductionLine">
      <el-select
        v-model="form.product"
        filterable
        placeholder="请选择"
        clearable
        @change="productChange"
      >
        <el-option
          v-for="item in productOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="区域" prop="area" v-if="isShow.showArea">
      <el-select v-model="form.area" filterable placeholder="请选择" clearable @change="areaChange">
        <el-option v-for="item in areaOptions" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="设备" prop="device" v-if="isShow.showDevice">
      <el-select
        v-if="!onlyDevice"
        v-model="form.device"
        filterable
        clearable
        placeholder="请选择"
        @change="deviceChange"
      >
        <el-option v-for="item in deviceOptions" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-input
        v-else
        v-model="form.device"
        clearable
        placeholder="请输入设备名称或编码"
      ></el-input>
    </el-form-item>
    <el-form-item label="测点" prop="point" v-if="!onlyDevice">
      <el-select
        v-model="form.point"
        filterable
        placeholder="请选择"
        clearable
        @change="pointChange"
      >
        <el-option
          v-for="item in pointOptions"
          :key="item.pointId"
          :label="item.pointName"
          :value="item.pointId"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="指标" prop="kpi" v-if="!onlyDevice">
      <el-select v-model="form.kpi" filterable placeholder="请选择" clearable @change="kpiChange">
        <el-option
          v-for="item in kpiOptions"
          :key="item.kpiId"
          :label="item.kpiName"
          :value="item.kpiId"
        >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    },
    onlyDevice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        // domain: '',
        base: '',
        factory: '',
        product: '',
        area: '',
        device: '',
        point: '',
        kpi: ''
      },
      rules: {
        domain: [{ required: true, message: '请选择集团' }],
        base: [{ required: true, message: '请选择基地' }],
        factory: [{ required: true, message: '请选择厂部' }],
        product: [{ required: true, message: '请选择产线' }],
        area: [{ required: true, message: '请选择区域' }],
        device: [{ required: true, message: '请选择设备' }],
        point: [{ required: true, message: '请选择测点' }],
        kpi: [{ required: true, message: '请选择数据项' }]
      },
      // domainOptions: [],
      baseOptions: [],
      factoryOptions: [],
      productOptions: [],
      areaOptions: [],
      deviceOptions: [],
      pointOptions: [],
      kpiOptions: [],
      isShow: {}
    }
  },
  methods: {
    // async domainChange(val) {
    //   this.baseOptions = await this.getNextLevelNode(val)
    //   this.form.base = ''
    //   this.form.factory = ''
    //   this.form.product = ''
    //   this.form.area = ''
    //   this.form.point = ''
    //   this.form.kpi = ''
    // },
    async baseChange(val) {
      this.factoryOptions = await this.$deviceStore.commit('getNextLevelNodes', val)
      this.form.factory = ''
      this.form.product = ''
      this.form.area = ''
      this.form.point = ''
      this.form.kpi = ''
      this.emptyOptions([
        'productOptions',
        'areaOptions',
        'deviceOptions',
        'pointOptions',
        'kpiOptions'
      ])
    },
    async factoryChange(val) {
      this.productOptions = await this.$deviceStore.commit('getNextLevelNodes', val)
      this.form.product = ''
      this.form.area = ''
      this.form.point = ''
      this.form.kpi = ''
      this.emptyOptions(['areaOptions', 'deviceOptions', 'pointOptions', 'kpiOptions'])
    },
    async productChange(val) {
      this.areaOptions = await this.$deviceStore.commit('getNextLevelNodes', val)
      this.form.area = ''
      this.form.point = ''
      this.form.kpi = ''
      this.emptyOptions(['deviceOptions', 'pointOptions', 'kpiOptions'])
    },
    async areaChange(val) {
      this.deviceOptions = await this.$deviceStore.commit('getNextLevelNodes', val)
      this.form.point = ''
      this.form.kpi = ''
      this.emptyOptions(['pointOptions', 'kpiOptions'])
    },
    async deviceChange(val) {
      // this.pointOptions = await this.$deviceStore.commit('getPointAndKpiListByCondition', {
      //   deviceCodeList: [val]
      // })
      this.pointOptions = await this.$deviceStore.commit('getPointAndKpiListByCondition', {
        deviceCodeList: ['310707E01']
      })
      this.form.kpi = ''
      this.emptyOptions(['kpiOptions'])
    },
    async pointChange(val) {
      this.kpiOptions = this.pointOptions.find(item => item.pointId === val).kpiList
    },
    validateForm(cb) {
      this.$refs.deviceForm.validate(valid => {
        if (valid) {
          cb(this.reactForm())
        } else {
          cb(false)
        }
      })
    },
    reactForm() {
      const { base, product, factory, area, device, point, kpi } = this.form
      let baseObj = this.baseOptions.find(item => item.id == base)
      let productObj = this.productOptions.find(item => item.id == product)
      let factoryObj = this.factoryOptions.find(item => item.id == factory)
      let areaObj = this.areaOptions.find(item => item.id == area)
      let deviceObj = this.deviceOptions.find(item => item.id == device)
      let pointObj = this.pointOptions.find(item => item.pointId == point)
      let kpiObj = this.kpiOptions.find(item => item.kpiId == kpi)
      let tempObj = {
        baseName: baseObj ? baseObj.name : '',
        productName: productObj ? productObj.name : '',
        factoryName: factoryObj ? factoryObj.name : '',
        areaName: areaObj ? areaObj.name : '',
        deviceName: deviceObj ? deviceObj.name : '',
        pointName: pointObj ? pointObj.pointName : '',
        kpiName: kpiObj ? kpiObj.kpiName : ''
      }
      return Object.assign(tempObj, this.form)
    },
    getValues(cb) {
      cb(this.reactForm())
    },
    resetForm() {
      this.$refs.deviceForm.resetFields()
      this.resetOptions()
    },
    resetOptions() {
      const { domainType } = this.model
      switch (domainType) {
        case '基地':
          this.emptyOptions([
            'factoryOptions',
            'productOptions',
            'areaOptions',
            'deviceOptions',
            'pointOptions',
            'kpiOptions'
          ])
          break
        case '厂部':
          this.emptyOptions([
            'productOptions',
            'areaOptions',
            'deviceOptions',
            'pointOptions',
            'kpiOptions'
          ])
          break
        case '产线':
          this.emptyOptions(['areaOptions', 'deviceOptions', 'pointOptions', 'kpiOptions'])
          break
        case '区域':
          this.emptyOptions(['deviceOptions', 'pointOptions', 'kpiOptions'])
          break
        case '设备':
          this.emptyOptions(['pointOptions', 'kpiOptions'])
          break
        default:
      }
    },
    emptyOptions(optionName) {
      optionName.forEach(item => {
        this[item] = []
      })
    },
    kpiChange() {
      this.$parent.$emit('change', this.reactForm())
    }
  },
  watch: {
    model: {
      deep: true,
      handler(newVal) {
        const { domainType } = newVal
        let result
        switch (domainType) {
          case '基地':
            result = {
              showBase: true,
              showFactory: true,
              showProductionLine: true,
              showArea: true,
              showDevice: true
            }
            this.baseOptions = [JSON.parse(JSON.stringify(newVal))]
            break
          case '厂部':
            result = {
              showBase: false,
              showFactory: true,
              showProductionLine: true,
              showArea: true,
              showDevice: true
            }
            this.factoryOptions = [JSON.parse(JSON.stringify(newVal))]
            break
          case '产线':
            result = {
              showBase: false,
              showFactory: false,
              showProductionLine: true,
              showArea: true,
              showDevice: true
            }
            this.productOptions = [JSON.parse(JSON.stringify(newVal))]
            break
          case '区域':
            result = {
              showBase: false,
              showFactory: false,
              showProductionLine: false,
              showArea: true,
              showDevice: true
            }
            this.areaOptions = [JSON.parse(JSON.stringify(newVal))]
            break
          case '设备':
            result = {
              showBase: false,
              showFactory: false,
              showProductionLine: false,
              showArea: false,
              showDevice: true
            }
            this.deviceOptions = [JSON.parse(JSON.stringify(newVal))]
            break
          default:
            result = {
              showBase: false,
              showFactory: false,
              showProductionLine: false,
              showArea: false,
              showDevice: false
            }
            break
        }
        this.isShow = result
      }
    }
  }
}
</script>
<style scoped>
.device-form .el-select {
  width: 100%;
}
</style>

#### 使用方式：

1. 安装包

   ```
    npm i baowu-device
   ```

2. 项目中引用

   ```
   import BaowuDevice from 'baowu-device'
   Vue.use(BaowuDevice,{deviceBaseUrl:设备相关接口前缀,groupBaseUrl:设备组相关接口前缀})
   ```

3. 项目中可直接使用 DeviceOptions 和 DeviceTree 两个公共组件

   ```
   //tabs:我的设备、我的收藏、我的设备组
   <DeviceOptions
             @getCheckedNode="getCheckedNode"   //获取当前选中节点
             @getBreadcrumb="getBreadcrumb"     //获取当前节点路径（面包屑）
             :showGroup='false'                 //控制设备组显示和隐藏
             :initDeviceCode="$route.params.id" //传入初始选中设备的deviceCode(监盘默认选中根节点，诊断由于初始由地址传值需传入deviceCode)
   ></DeviceOptions>

   //设备树
   <DeviceTree
         mode="select"         //mode值为tree(默认值，默认树形结构)和select下拉选择结构
         class="device-tree"
         v-model="selectedNode"  //获取当前选择的form表单数据，仅mode为select
         ref="devicetree"
         //通过ref可以调用validateForm(valid=>{表单校验}),getValues((data)=>{获取当前表单值})，resetForm()重置表单，仅mode为select
   ></DeviceTree>
   ```

4. 还可通过 this.$deviceStore.state 获取相关数据

   ```
   this.$deviceStore.state = {
       selectedNode: {},//当前选中节点
       cacheDevice: {},//暂时未使用
       dataCache: {},  //设备树接口数据缓存
       breadcrumb: [], //当前选中节点路径
       options  //存储接口地址
   }
   ```

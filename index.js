import DeviceOptions from './DeviceOptions/index.vue'
import DeviceTree from './DeviceTree/index.vue'
import { store } from './store'

const componentArr = [DeviceOptions, DeviceTree]
const install = (Vue, option) => {
  Vue.prototype.$deviceStore = store(Vue, option)
  componentArr.forEach(com => {
    Vue.component(com.name, com)
  })
}
export default install

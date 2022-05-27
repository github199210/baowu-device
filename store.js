const concatNode = function concatNode(data, target) {
  if (data.id === target.id) {
    data.children = target.children
    return data
  }
  for (let index = 0; index < data.children.length; index++) {
    const node = data.children[index]
    concatNode(node, target)
  }
}

const searchNode = function searchNode(cacheData, nodeId) {
  if (cacheData.id === nodeId) {
    return cacheData.children
  }
  for (let index = 0; index < cacheData.children.length; index++) {
    const node = cacheData.children[index]
    searchNode(node, nodeId)
  }
}

// 对象深比较
function equalsObject(obj1, obj) {
  let p
  if (obj1 === obj) {
    return true
  }
  if (typeof obj1 === 'function' || typeof obj1 === 'string' || obj1 instanceof String) {
    return obj1.toString() === obj.toString()
  }
  // number
  if (obj1 instanceof Number || typeof obj1 === 'number') {
    if (obj instanceof Number || typeof obj === 'number') {
      return obj1.valueOf() === obj.valueOf()
    }
    return false
  }
  if (typeof obj1 !== typeof obj || obj === null || typeof obj === 'undefined') {
    return false
  }
  function sort(o) {
    let result = {}

    if (typeof o !== 'object') {
      return o
    }

    Object.keys(o)
      .sort()
      .forEach(function (key) {
        result[key] = sort(o[key])
      })

    return result
  }

  if (typeof obj1 === 'object') {
    if (Array.isArray(obj1)) {
      // check on arrays
      return JSON.stringify(obj1) === JSON.stringify(obj)
    } else {
      if (Object.keys(obj1).length !== Object.keys(obj).length) return false
      for (p in obj1) {
        if (typeof obj1[p] !== typeof obj[p]) {
          return false
        }
        if ((obj1[p] === null) !== (obj[p] === null)) {
          return false
        }
        switch (typeof obj1[p]) {
          case 'undefined':
            if (typeof obj[p] !== 'undefined') {
              return false
            }
            break
          case 'object':
            if (
              obj1[p] !== null &&
              obj[p] !== null &&
              (obj1[p].constructor.toString() !== obj[p].constructor.toString() ||
                !equalsObject(obj1[p], obj[p]))
            ) {
              return false
            }
            break
          case 'function':
            if (obj1[p].toString() !== obj[p].toString()) {
              return false
            }
            break
          default:
            if (obj1[p] !== obj[p]) {
              return false
            }
        }
      }
    }
  }
  return JSON.stringify(sort(obj1)) === JSON.stringify(sort(obj))
}
function handleError(res) {
  const { code, message, result } = res.data
  if (code == 200) {
    return Promise.resolve(result)
  } else if (!code) {
    return Promise.reject('接口调用异常！')
  } else {
    return Promise.reject(message)
  }
}
import axios from 'axios'
export function store(Vue, options) {
  const state = Vue.observable({
    selectedNode: {},
    cacheDevice: {},
    dataCache: {},
    breadcrumb: [],
    options
  })
  const mutations = {
    async setSelectedNode(node) {
      state.selectedNode = node
      const { category } = node
      if (category == 'group') {
        const { children } = node
        if (children.length > 0) {
          state.breadcrumb = children.map(item => {
            let { deviceId, deviceName, domainNamePath, domainPath } = item
            let nameList = domainNamePath.split('/')
            nameList.push(deviceName)
            let pathIds = domainPath.split('/')
            pathIds.push(deviceId)
            return {
              name: nameList,
              id: deviceId,
              pathIds
            }
          })
        } else {
          state.breadcrumb = []
        }
      } else {
        const { domainKVList, id, name, domainNamePath, domainPath, deviceId, deviceName } = node
        if (domainKVList) {
          state.breadcrumb = domainKVList.map(item => {
            let keys = Object.keys(item)
            return {
              name: item[keys[0]],
              id: keys[0]
            }
          })
        }
        if (domainNamePath) {
          let idList = domainPath.split('/')
          let nameList = domainNamePath.split('/')
          state.breadcrumb = idList.map((id, index) => {
            let name = nameList[index]
            return {
              name,
              id
            }
          })
        }
        if (category === 'device') {
          state.breadcrumb.push({
            id: id || deviceId,
            name: name || deviceName
          })
        }
      }
    },
    setCacheDomain(data) {
      state.cacheDevice = data
    },
    setCacheDevice(data) {
      state.cacheDevice = concatNode(state.cacheDevice, data)
    },
    getChildrenNode(nodeId) {
      return searchNode(state.cacheDevice, nodeId)
    },
    setDataCache({ key, params, data }) {
      if (!state.dataCache[key]) {
        state.dataCache[key] = {
          params: [],
          data: []
        }
      }
      const cacheParams = state.dataCache[key].params
      if (!cacheParams.some(item => equalsObject(item, params))) {
        state.dataCache[key].params.push(params)
        state.dataCache[key].data.push(data)
      }
    },
    getDataCacheByKey({ key, params }) {
      if (!state.dataCache[key]) return false
      let index = state.dataCache[key].params.findIndex(item => equalsObject(item, params))
      return index > -1 && state.dataCache[key].data[index]
    },
    async getRootDomain() {
      try {
        let cacheParams = { key: 'findRootDomain', params: {} }
        let rootDomain = this.getDataCacheByKey(cacheParams)
        if (!rootDomain) {
          // console.log('根域接口请求')
          const { deviceBaseUrl } = state.options
          const res = await axios.post(deviceBaseUrl + '/findRootDomain', {})
          const result = await handleError(res)
          result.level = 0
          result.status = 1
          result.root = true
          result.children = []
          this.setDataCache({ ...cacheParams, data: result })
          rootDomain = result
        } else {
          // console.log('根域缓存数据', rootDomain)
        }
        return rootDomain
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getNextLevelNodes(nodeId, level) {
      try {
        let cacheParams = { key: 'getNextLevelNodes', params: { nodeId } }
        let nextNode = this.getDataCacheByKey(cacheParams)
        if (!nextNode) {
          // console.log('下级接口请求')
          const { deviceBaseUrl } = state.options
          const res = await axios.post(deviceBaseUrl + '/getNextLevelNodes', { params: { nodeId } })
          const result = await handleError(res)
          result.forEach(item => {
            item.level = level + 1 || 0
            item.status = 1
            item.children = []
          })
          this.setDataCache({ ...cacheParams, data: result })
          nextNode = result
        } else {
          // console.log('下级缓存数据', nextNode)
        }
        return nextNode
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getPointAndKpiListByCondition(params) {
      try {
        let cacheParams = { key: 'getPointAndKpiListByCondition', params }
        let pointAndKpiList = this.getDataCacheByKey(cacheParams)
        if (!pointAndKpiList) {
          // console.log('下级接口请求')
          const { deviceBaseUrl } = state.options
          const res = await axios.post(deviceBaseUrl + '/getPointAndKpiListByCondition', { params })
          const result = await handleError(res)
          this.setDataCache({ ...cacheParams, data: result })
          pointAndKpiList = result
        } else {
          // console.log('下级缓存数据', pointAndKpiList)
        }
        return pointAndKpiList
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getDeviceListByConditionWithPage(params) {
      try {
        // let cacheParams = { key: 'getDeviceListByConditionWithPage', params }
        // let deviceList = this.getDataCacheByKey(cacheParams)
        // if (!deviceList) {
        //   // console.log('获取设备接口请求')
        //   const { deviceBaseUrl } = state.options
        //   const res = await axios.post(deviceBaseUrl + '/getDeviceListByConditionWithPage', {
        //     params
        //   })
        //   const result = await handleError(res)
        //   this.setDataCache({ ...cacheParams, data: result })
        //   deviceList = result
        // } else {
        //   // console.log('获取设备缓存数据', deviceList)
        // }
        const { deviceBaseUrl } = state.options
        const res = await axios.post(deviceBaseUrl + '/getDeviceListByConditionWithPage', {
          params
        })
        const result = await handleError(res)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 获取设备组列表
    async getDeviceGroupList(params) {
      try {
        const { groupBaseUrl } = state.options
        const res = await axios.post(groupBaseUrl + '/getDeviceGroupListByConditionWithPage', {
          params
        })
        const result = await handleError(res)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 获取设备组下关联设备
    async getDeviceListByDeviceGroupId(params) {
      try {
        const { groupBaseUrl } = state.options
        const res = await axios.post(groupBaseUrl + '/getDeviceListByDeviceGroupIdWithPage', {
          params
        })
        const result = await handleError(res)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 保存设备组（新增/修改）
    async saveDeviceGroup(params) {
      try {
        const { groupBaseUrl } = state.options
        const res = await axios.post(groupBaseUrl + '/saveDeviceGroup', {
          params
        })
        await handleError(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 生成唯一设备组编码
    async generateDeviceGroupCode() {
      try {
        const { groupBaseUrl } = state.options
        const res = await axios.post(groupBaseUrl + '/generateDeviceGroupCode', {})
        const result = await handleError(res)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 删除设备组、设备关联设备
    async deleteDeviceGroup(params) {
      try {
        const { groupBaseUrl } = state.options
        const res = await axios.post(groupBaseUrl + '/deleteDeviceGroup', { params })
        await handleError(res)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
  const commit = (fn, ...val) => {
    return mutations[fn](...val)
  }
  return {
    state,
    commit
  }
}

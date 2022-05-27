<template>
  <ul class="my-collection">
    <li
      v-for="(item, index) in myCollections"
      :key="index"
      :class="{ 'is-active': currentNodeId === item.deviceId }"
      @click="changeCurrentNodeId(item)"
    >
      {{ item.deviceName }}({{ item.deviceCode }})
    </li>
  </ul>
</template>
<script>
import axios from 'axios'
export default {
  data() {
    return {
      myCollections: []
    }
  },
  computed: {
    currentNodeId() {
      return ''
    }
  },
  created() {
    // this.getDeviceList()
  },
  methods: {
    getDeviceList() {
      axios.post('/service/LPDS01/getFavoriteDeviceList', {}).then(res => {
        console.log(7777, res)
      })
    },
    changeCurrentNodeId(item) {
      // this.$myStore.commit('setSelectedNode', item)
    }
  }
}
</script>
<style scoped>
.my-collection li {
  padding: 10px 0;
}
</style>

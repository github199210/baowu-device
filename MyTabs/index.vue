<template>
  <div class="mytabs">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'MyTabs',
  provide() {
    return {
      tabs: this
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.mytabs {
  width: 100%;
  display: flex;
  gap: 5px;
  overflow: auto;
  margin: 10px 0;
}
</style>

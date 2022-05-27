<template>
  <div class="tabitem" :class="{ is_active: tabs.value === name }">
    <div class="tab-label" @click="switchTab">{{ label }}</div>
    <div class="tab-content" v-show="tabs.value === name">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  inject: ['tabs'],
  props: {
    label: {
      type: String,
      reuqire: true
    },
    name: {
      type: String,
      require: true
    }
  },
  methods: {
    switchTab() {
      this.$parent.$emit('change', this.name)
    }
  }
}
</script>
<style lang="scss" scoped>
.tabitem {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  // text-align: center;
  // padding: 10px;
  border-radius: 5px 5px 0 0;
  background: transparent;
  color: #869098;
  cursor: pointer;
}
.tab-content {
  text-align: left;
  position: absolute;
  left: 0;
  right: 0;
  top: 50px;
}
.is_active {
  .tab-label {
    color: #3cd3a6 !important;
  }
}
.tab-label {
  white-space: nowrap;
  font-size: 18px;
}
</style>

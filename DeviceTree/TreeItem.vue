<template>
  <li>
    <div>
      <div class="item-flex" @click="handleSelect(model)">
        <i
          class="el-icon-s-opportunity"
          v-if="model.status"
          :style="{
            color: statusColor(model.status),
            'text-indent': 2 * model.level + 'em',
            'font-size': '16px'
          }"
        ></i>
        <span class="item-name" :class="{ is_active: isActive }" @click="changeCurrentNodeId">
          {{ model.name }}
          {{
            model.domainType && (model.deviceNum || model.deviceNum === 0)
              ? `( ${model.deviceNum} )`
              : ''
          }}
        </span>
        <i
          class="expand-icon el-icon-caret-top"
          :class="{ rotate180: isOpen }"
          v-if="model.domainType"
          @click="toggle"
        ></i>
      </div>
    </div>
    <ul class="collapse-transition animate-wrap" v-show="isOpen">
      <TreeItem v-for="(item, index) in childNode" :key="index" class="item" :model="item" />
    </ul>
  </li>
</template>
<script>
import mixin from '../mixins'
export default {
  name: 'TreeItem',
  mixins: [mixin],
  inject: ['deviceOptions'],
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isOpen: false,
      childNode: []
    }
  },
  created() {},
  computed: {
    currentNode() {
      return this.$deviceStore.state.selectedNode
    },
    isActive() {
      let breadcrumb = this.$deviceStore.state.breadcrumb
      let isGroup = breadcrumb.every(item => Array.isArray(item.name))
      if (isGroup) {
        return breadcrumb
          .map(b => b.pathIds)
          .flat()
          .includes(this.model.id)
      } else {
        return breadcrumb.map(item => item.id).includes(this.model.id)
      }
    }
  },
  methods: {
    async toggle() {
      try {
        this.isOpen = !this.isOpen
        if (this.isOpen) {
          this.childNode = await this.$deviceStore.commit(
            'getNextLevelNodes',
            this.model.id,
            this.model.level
          )
        }
      } catch (error) {
        this.$message.error(error)
      }
    },
    handleSelect(model) {},
    statusColor(status) {
      let color
      switch (status) {
        case 1:
          color = '#3cd2a5'
          break
        case 2:
          color = 'orange'
          break
        case 3:
          color = 'yellow'
          break
        default:
          color = 'green'
          break
      }
      return color
    },
    changeCurrentNodeId() {
      this.$parent.$emit('change', this.model)
      if (this.deviceOptions.showGroup && this.model.domainType) {
        this.toggle()
      } else {
        let category = this.model.domainType ? this.model.domainType : 'device'
        this.$deviceStore.commit('setSelectedNode', { category, ...this.model })
        this.dispatch('DeviceOptions', 'getCheckedNode', { category, ...this.model })
        this.dispatch('DeviceOptions', 'getBreadcrumb', this.$deviceStore.state.breadcrumb)
      }
    }
  },
  watch: {}
}
</script>
<style lang="scss" scoped>
@keyframes slideInLeft {
  from {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
    visibility: visible;
  }

  to {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}
.animate-wrap {
  animation-name: slideInLeft;
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
.item-flex {
  padding: 5px 1px 5px 0;
  display: flex;
  align-items: center;
  // justify-content: space-between;
  .is_active {
    color: #3cd3a6 !important;
  }
  .item-name {
    // margin-right: auto;
    flex: 1;
    margin-left: 5px;
    white-space: nowrap;
    color: #858c94;
  }
  .item-name:not(.is_active):hover {
    color: #fff;
  }
  .expand-icon {
    width: 50px;
    text-align: center;
    transition: transform 0.3s ease-in-out;
    color: #858c94;
  }
}
.item {
  // overflow: auto;
}
.open-icon {
  transform: rotate(90);
}
.rotate180 {
  transform: rotate(180deg);
}

.item-children {
  overflow: hidden;
  display: none;
}
.expanded {
  display: block;
}
.iconfont {
  display: flex;
  width: 20px;
  height: 20px;
  background: #fff;
  font-style: normal;
  color: #000;
  font-size: 20px;
}
</style>

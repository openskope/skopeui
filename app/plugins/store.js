import Vue from 'vue'
import { DataSets } from '@/store/datasets'
import { Messages } from '@/store/messages'
import { getModule } from 'vuex-module-decorators'

class API {
  constructor(instance) {
    this.instance = instance
  }

  get datasets() {
    return getModule(DataSets, this.instance.$store)
  }

  get messages() {
    return getModule(Messages, this.instance.$store)
  }
}

export default ({ store }, inject) => {
  inject('api', function () {
    return new API(this)
  })
}

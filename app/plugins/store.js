import { App } from '@/store/app'
import { DataSets } from '@/store/datasets'
import { Messages } from '@/store/messages'
import { getModule } from 'vuex-module-decorators'
import { DataSet } from '@/store/dataset'

export class API {
  constructor(store) {
    this.store = store
  }

  get app() {
    return getModule(App, this.store)
  }

  get datasets() {
    return getModule(DataSets, this.store)
  }

  get messages() {
    return getModule(Messages, this.store)
  }

  get dataset() {
    return getModule(DataSet, this.store)
  }
}

export default ({ store }, inject) => {
  inject('api', function () {
    return new API(store)
  })
}

import { App } from '@/store/modules/app'
import { DataSets } from '@/store/modules/datasets'
import { Messages } from '@/store/modules/messages'
import { getModule } from 'vuex-module-decorators'
import { DataSet } from '@/store/modules/dataset'
import { Analyze } from '@/store/modules/analyze'

export class API {
  constructor(store) {
    this.store = store
  }

  get analyze() {
    return getModule(Analyze, this.store)
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

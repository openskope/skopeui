import { App } from '@/store/modules/app'
import { DataSet } from '@/store/modules/dataset'
import { DataSets } from '@/store/modules/datasets'
import { Messages } from '@/store/modules/messages'

export const state = () => ({})

export const modules = {
  app: App,
  dataset: DataSet,
  datasets: DataSets,
  messages: Messages,
}

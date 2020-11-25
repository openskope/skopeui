import { App } from '@/store/app'
import { DataSet } from '@/store/dataset'
import { DataSets } from '@/store/datasets'
import { Messages } from '@/store/messages'

export const state = () => ({})

export const modules = {
  app: App,
  dataset: DataSet,
  datasets: DataSets,
  messages: Messages,
}

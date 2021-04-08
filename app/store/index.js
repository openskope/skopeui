import { App } from '@/store/modules/app'
import { Dataset } from '@/store/modules/dataset'
import { Datasets } from '@/store/modules/datasets'
import { Messages } from '@/store/modules/messages'
import { Analyze } from '@/store/modules/analyze'

export const state = () => ({})

export const modules = {
  analyze: Analyze,
  app: App,
  dataset: Dataset,
  datasets: Datasets,
  messages: Messages,
}

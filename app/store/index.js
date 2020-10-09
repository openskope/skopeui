import Vuex from 'vuex'
import { DataSets } from '~/store/datasets'
import { Messages } from '@/store/messages'

export const state = () => ({})

export const modules = {
  datasets: DataSets,
  messages: Messages,
}

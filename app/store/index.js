import { App } from "@/store/modules/app";
import { Dataset } from "@/store/modules/dataset";
import { Datasets } from "@/store/modules/datasets";
import { Messages } from "@/store/modules/messages";
import { Analysis } from "@/store/modules/analysis";

export const state = () => ({});

export const modules = {
  analysis: Analysis,
  app: App,
  dataset: Dataset,
  datasets: Datasets,
  messages: Messages,
};

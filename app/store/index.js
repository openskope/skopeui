import { Analysis } from "@/store/modules/analysis";
import { App } from "@/store/modules/app";
import { Dataset } from "@/store/modules/dataset";
import { Messages } from "@/store/modules/messages";
import { Metadata } from "@/store/modules/metadata";

export const state = () => ({});

export const modules = {
  analysis: Analysis,
  app: App,
  dataset: Dataset,
  messages: Messages,
  metadata: Metadata,
};

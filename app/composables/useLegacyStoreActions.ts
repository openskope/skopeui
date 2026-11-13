import { METADATA_ENDPOINT } from "../store/modules/constants";
import { requestJson } from "../utils/requestJson";
import { useExtractionStore } from "../stores/extraction";
import { extractYear } from "../store/stats";
import {
  datasetsFromMetadata,
  UnsupportedMetadataVersionError,
} from "../utils/metadataResponse";
import { useAnalysisStore } from "../stores/analysis";
import { useDatasetStore } from "../stores/dataset";
import { useMetadataStore } from "../stores/metadata";
import { usePersistenceStorage } from "./usePersistenceStorage";
import _ from "lodash";

export function useLegacyStoreActions() {
  const metadataStore = useMetadataStore();
  const datasetStore = useDatasetStore();
  const analysisStore = useAnalysisStore();
  const persistenceStorage = usePersistenceStorage();

  // Fetched on every page change, not cached, so a UI left open across an API
  // deploy notices a changed schema version on its next navigation (CUT-001).
  async function loadAllDatasetMetadata() {
    const response = await requestJson(METADATA_ENDPOINT);
    try {
      metadataStore.setAllDatasetMetadata(datasetsFromMetadata(response));
    } catch (error) {
      if (error instanceof UnsupportedMetadataVersionError) {
        metadataStore.setUpdateRequired();
      }
      throw error;
    }
  }

  async function initializeDataset(
    metadataId: string,
    variableId?: string | null,
  ) {
    // Already loaded (moving between its steps): don't wait for the metadata
    // request, which can sit behind a running extraction and held up the next
    // page. Still send it, so a changed API is noticed (CUT-001); a version
    // mismatch flags the update screen, and other failures can wait for the
    // next page.
    if (metadataId === (datasetStore.metadata as any)?.id) {
      loadAllDatasetMetadata().catch(() => undefined);
      return;
    }

    await loadAllDatasetMetadata();

    const datasetMetadata = metadataStore.find(metadataId);
    if (datasetMetadata == null) {
      if (typeof window !== "undefined") {
        alert(
          "Please try again later, we were unable to locate dataset metadata for " +
            metadataId,
        );
      }
      return;
    }

    datasetStore.setMetadata(datasetMetadata);

    // The variables arrive sorted by `order`, so the first is the fallback.
    const incomingVariableId =
      variableId ??
      datasetMetadata.default_variable ??
      datasetMetadata.variables[0]?.id;

    if (incomingVariableId != null) {
      datasetStore.setVariable(incomingVariableId);
    }

    if (typeof window !== "undefined") {
      initializeDatasetGeoJson();
    }
  }

  function initializeDatasetGeoJson() {
    if (datasetStore.hasGeoJson) {
      return;
    }
    const geoJson = persistenceStorage.get(datasetStore.geoJsonKey) || null;
    datasetStore.setGeoJson(geoJson);
  }

  // Results for one study area must not survive a change of area: drop the
  // plots, the statistics and the cached extractions.
  function clearResults() {
    useExtractionStore().clear();
    datasetStore.clearTimeSeries();
    analysisStore.clear();
  }

  function clearGeoJson() {
    persistenceStorage.remove(datasetStore.geoJsonKey);
    datasetStore.clearGeoJson();
    clearResults();
  }

  function saveGeoJson(geoJson: unknown) {
    persistenceStorage.set(datasetStore.geoJsonKey, geoJson);
    datasetStore.setGeoJson(geoJson);
    clearResults();

    if (!_.isEmpty(analysisStore.requestData)) {
      analysisStore.setGeoJson(geoJson);
    }
  }

  function loadRequestData(requestData: Record<string, any>) {
    datasetStore.setTemporalRange([
      extractYear(requestData.time_range.gte),
      extractYear(requestData.time_range.lte),
    ]);
    datasetStore.setGeoJson(requestData.selected_area);
    analysisStore.setRequestData(requestData);
  }

  return {
    loadAllDatasetMetadata,
    initializeDataset,
    initializeDatasetGeoJson,
    clearGeoJson,
    saveGeoJson,
    loadRequestData,
  };
}

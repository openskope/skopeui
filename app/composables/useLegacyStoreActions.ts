import { METADATA_ENDPOINT } from "../store/modules/constants";
import { requestJson } from "../utils/requestJson";
import { extractYear } from "../store/stats";
import {
  datasetsFromMetadata,
  UnsupportedMetadataVersionError,
} from "../utils/metadataResponse";
import { useAnalysisStore } from "../stores/analysis";
import { useDatasetStore } from "../stores/dataset";
import { useMetadataStore } from "../stores/metadata";
import { usePersistenceStorage } from "./usePersistenceStorage";

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
      const activeId = datasetStore.metadata?.id;
      if (activeId) datasetStore.setMetadata(metadataStore.find(activeId));
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
    if (metadataId === datasetStore.metadata?.id) {
      datasetStore.beginInitialization();
      if (variableId != null) datasetStore.setVariable(variableId);
      loadAllDatasetMetadata().catch(() => undefined);
      return;
    }

    // A different dataset must not display or submit the previous selection
    // while its metadata is loading.
    datasetStore.setMetadata(null);
    const isCurrent = datasetStore.beginInitialization();
    await loadAllDatasetMetadata();
    if (!isCurrent()) return;

    const datasetMetadata = metadataStore.find(metadataId);
    if (datasetMetadata == null) {
      datasetStore.setMetadata(null);
      if (typeof window !== "undefined") {
        alert(
          "Please try again later, we were unable to locate dataset metadata for " +
            metadataId,
        );
      }
      return;
    }

    datasetStore.setMetadata(datasetMetadata);

    if (variableId != null) datasetStore.setVariable(variableId);

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

  function clearGeoJson() {
    persistenceStorage.remove(datasetStore.geoJsonKey);
    datasetStore.clearGeoJson();
  }

  function saveGeoJson(geoJson: unknown) {
    persistenceStorage.set(datasetStore.geoJsonKey, geoJson);
    datasetStore.setGeoJson(geoJson);
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

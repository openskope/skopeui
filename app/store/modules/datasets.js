import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { ALL_DATA } from '@/store/data';

function matchesYearFilter(minYear, maxYear, dataset) {
  const dMinYear = parseInt(dataset.timespan.period.gte);
  const dMaxYear = parseInt(dataset.timespan.period.lte);

  if (dMaxYear < minYear) {
    return false;
  }
  return dMinYear <= maxYear;
}

function matchesVariableFilter(selectedVariableClasses, dataset) {
  if (selectedVariableClasses.length === 0) {
    return true;
  }
  for (const selectedVariableClass of selectedVariableClasses) {
    for (const variable of dataset.variables) {
      if (variable.class === selectedVariableClass) {
        return true;
      }
    }
  }
  return false;
}

function matchesQueryFilter(query, dataset) {
  const q = query.toLowerCase();
  return query.length > 0
    ? dataset.title.toLowerCase().includes(q) ||
        dataset.description.toLowerCase().includes(q)
    : true;
}

@Module({ stateFactory: true, name: 'datasets', namespaced: true })
class Datasets extends VuexModule {
  loading = false;
  all = [];
  filterCriteria = {
    selectedVariableClasses: [],
    yearStart: 1,
    yearEnd: 2019,
    query: '',
  };

  get filteredDatasets() {
    return this.all.filter((dataset) => {
      const selectedVariableClasses = this.filterCriteria
        .selectedVariableClasses;
      const minYear = this.filterCriteria.yearStart;
      const maxYear = this.filterCriteria.yearEnd;
      const query = this.filterCriteria.query || '';

      return (
        matchesYearFilter(minYear, maxYear, dataset) &&
        matchesQueryFilter(query, dataset) &&
        matchesVariableFilter(selectedVariableClasses, dataset)
      );
    });
  }

  @Action({ commit: 'load' })
  retrieveData() {
    if (this.loading) {
      console.debug('already loading - ignoring request');
    }
    return ALL_DATA;
  }

  @Action({ commit: 'applyFilterCriteria' })
  filter(filterCriteria) {
    return filterCriteria;
  }

  @Action
  loadAndSelectVariable(id) {
    if (this.all === undefined || this.all.length === 0) {
      this.load(ALL_DATA);
    }
    if (state.metadata) {
      this.context.commit('selectVariable', id);
    }
  }

  @Mutation
  load(data) {
    this.loading = true;
    // FIXME: eventually this should get loaded from the backend from an async call
    this.all = data;
    this.loading = false;
  }

  @Mutation
  applyFilterCriteria(filterCriteria) {
    this.filterCriteria = filterCriteria;
  }
}

export { Datasets };

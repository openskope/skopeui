<template>
  <v-navigation-drawer
    fixed
    app
  >
    <section class="sidebar">
      <!-- search form -->
      <form id="searchForm" class="sidebar-form" @submit.prevent>
        <div id="searchContainer" class="input-group">
          <span class="input-group-btn">
            <input
              id="search"
              type="text"
              name="search"
              class="search form-control"
              data-toggle="hideseek"
              placeholder="Search datatsets"
              data-list=".sidebar-menu"
            >
            <button id="search-btn" type="submit" name="search" class="btn btn-flat">
              <i class="fa fa-search" />
            </button>
          </span>
        </div>
      </form>
      <!-- end search form -->
      <v-spacer />
      <!-- sidebar sort -->
      <side-bar-sort />
      <!-- end sidebar sort -->
    </section>
  </v-navigation-drawer>
</template>

<script>
import SideBarSort from '../components/SideBarSort'

export default {
  name: 'SideBar',
  components: {
    SideBarSort
  },
  data() {
    return {
      fixed: false
    }
  }
}
</script>

<style scoped>
#searchForm {
  padding-left: 0em;
  padding-right: 0em;
}

#searchContainer {
  height: 100%;
  padding-bottom: 0em;
}

#search {
  width: 80%;
  float: right;
}

#search-btn {
  width: 20%;
}

.sidebar {
  padding-top: 30px;
}
</style>

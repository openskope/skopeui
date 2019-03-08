<template>
  <v-navigation-drawer
    fixed
    v-model="drawer"
    app
  >
    <section class="sidebar">
      <div class="title-panel">
        <p>SKOPE</p>
      </div>
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
      <!-- sidebar sort -->
      <!-- end sidebar sort -->
    </section>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'SideBar'
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
</style>

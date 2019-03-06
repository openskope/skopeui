<template>
  <aside class="main-sidebar">
    <section class="sidebar">
      <div class="title-panel">
        <p>SKOPE </p>
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
    </section>
  </aside>
</template>

<script>
export default {
  name: 'SideBar'
}
</script>

<style scoped>
</style>

<template>
  <aside class="main-sidebar">
    <section class="sidebar">
      <div class="title-panel">
        <p>SKOPE </p>
      </div>

      <!-- search form -->
      <form v-on:submit.prevent class="sidebar-form" id="searchForm">
        <div class="input-group" id="searchContainer">
      <span class="input-group-btn">
        <input type="text"
               name="search"
               id="search"
               class="search form-control"
               data-toggle="hideseek"
               placeholder="Search datatsets"
               data-list=".sidebar-menu">
        <button type="submit" name="search" id="search-btn" class="btn btn-flat">
          <i class="fa fa-search"></i>
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
    name: "SideBar"
  }
</script>

<style scoped>

</style>

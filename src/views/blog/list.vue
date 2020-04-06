<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="标题"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="分类"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in categoryList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        style="margin-left: 5px"
        @click="handleCreate"
      >
        新增
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      />
      <el-table-column
        label="标题"
        width="250"
        align="center"
      >
        <template slot-scope="{ row: { titleWrapper} }">
          <span v-html="titleWrapper" />
        </template>
      </el-table-column>
      <el-table-column
        prop="categoryText"
        width="100"
        align="center"
        label="分类"
      />
      <el-table-column
        prop="contentsWrapper"
        label="内容"
        style="width: 40%"
        align="center"
      />
      <el-table-column
        width="100"
        align="center"
        prop="createdate"
        label="创建日期"
      >
        <template slot-scope="{ row: { createDt }}">
          <span>{{ createDt | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        align="center"
        prop="updatedate"
        label="更新日期"
      >
        <template slot-scope="{ row: { updateDt }}">
          <span>{{ updateDt | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index'
import waves from '@/directive/waves/waves'
import { parseTime, htmlParse } from '@/utils'
import { listBlog, deleteBlog, getCategory } from '@/api/blog'

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '无'
    }
  },
  data() {
    return {
      tableKey: 0,
      listQuery: {},
      listLoading: true,
      categoryList: [],
      list: [],
      total: 0,
      defaultSort: {}
    }
  },
  created() {
    this.parseQuery()
  },
  mounted() {
    this.getList()
    this.getCategoryList()
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList()
      }
    }
  },
  methods: {
    parseQuery() {
      const query = Object.assign({}, this.$route.query)
      let sort = '+id'
      const listQuery = {
        page: 1,
        pageSize: 20,
        sort
      }
      if (query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      console.log(sortSymbol, sortColumn)
      this.defaultSort = {
        prop: sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }
      this.listQuery = { ...listQuery, ...query }
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    getList() {
      this.listLoading = true
      listBlog(this.listQuery).then(response => {
        const { list, count } = response.data
        this.list = list
        this.total = count
        this.listLoading = false
        this.list.forEach(blog => {
          blog.titleWrapper = this.wrapperKeyword('title', blog.title)
          blog.contentsWrapper = htmlParse(blog.contents).substr(0, 400)
        })
      })
    },
    getCategoryList() {
      getCategory().then(response => {
        this.categoryList = response.data
      })
    },
    refresh() {
      this.$router.push({
        path: '/blog/list',
        query: this.listQuery
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.refresh()
    },
    handleCreate() {
      this.$router.push('/blog/create')
    },
    wrapperKeyword(k, v) {
      function highlight(value) {
        return `<span style="color: #1890ff">${value}</span>`
      }

      if (!this.listQuery[k]) {
        return v
      } else {
        return v.replace(new RegExp(this.listQuery[k], 'ig'), v => highlight(v))
      }
    },
    handleUpdate(row) {
      console.log('handleUpdate', row)
      this.$router.push(`/blog/edit/${row.id}`)
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该博客，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBlog(row.id).then(response => {
          this.$notify({
            title: '成功',
            message: response.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.handleFilter()
        })
      })
    }
  }
}
</script>

<style></style>

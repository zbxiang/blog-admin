<template>
  <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
    <sticky :class-name="'sub-navbar'">
      <el-button
        v-loading="loading"
        type="success"
        @click="submitForm"
      >
        {{ isEdit ? '编辑博客' : '新增博客' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <el-col :span="24">
          <el-form-item prop="title" label="标题：">
            <el-input
              v-model="postForm.title"
              name="title"
              placeholder="标题"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="subtitle" label="概述：">
            <el-input
              v-model="postForm.subtitle"
              type="textarea"
              name="subtitle"
              placeholder="概述"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="categoryText" label="分类：">
            <el-input
              v-model="postForm.categoryText"
              name="categoryText"
              placeholder="分类"
              clearable
              @keyup.enter.native="isShow=true"
              @clear="isShow=false"
              @focus="isShow=true"
            />
          </el-form-item>
        </el-col>
        <el-col v-show="isShow" :span="24">
          <el-tag
            v-for="(item, index) in categoryTag"
            :key="index"
            :type="tagType===index?'':'success'"
            effect="dark"
            :disable-transitions="true"
            style="margin-right: 10px;"
            @click="handleClick(item, index)"
          >{{ item.label }}</el-tag>
        </el-col>
        <el-col :span="24" style="margin-top: 30px;">
          <el-form-item>
            <MarkdownEditor
              ref="editor"
              v-model="postForm.contents"
              height="600px"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import sticky from '@/components/Sticky'
import MarkdownEditor from '@/components/MarkdownEditor'
import { createBlog, updateBlog, getBlog, getCategory } from '@/api/blog'

const fields = {
  categoryText: '分类',
  title: '标题',
  subtitle: '概述'
}

export default {
  components: {
    sticky,
    MarkdownEditor
  },
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      postForm: {
        categoryText: '',
        title: '',
        subtitle: '',
        contents: '',
        updateType: 1
      },
      tag: {},
      tagType: -1,
      loading: false,
      isShow: false,
      categoryTag: [],
      categoryList: [],
      value: '',
      rules: {
        categoryText: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        subtitle: [{ validator: validateRequire }]
      }
    }
  },
  watch: {
    value(newValue, preValue) {
      if (newValue !== preValue && newValue !== this.postForm.categoryText) {
        this.postForm.categoryText = newValue
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params.id
      this.getBlogData(id)
    }
  },
  mounted() {
    this.getCategoryList()
  },
  methods: {
    getCategoryList() {
      getCategory().then(response => {
        this.categoryTag = response.data
        this.categoryList = response.data.map(item => { return item.label })
      })
    },
    handleClick(item, index) {
      this.tag = item
      this.value = item.label
      this.tagType = index
    },
    submitForm() {
      const onSuccess = (response) => {
        const { msg } = response
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.loading = false
      }

      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            this.postForm.contents = this.$refs.editor.getHtml()
            const blog = Object.assign({}, this.postForm)
            if (!this.isEdit) {
              createBlog(blog).then(response => {
                onSuccess(response)
                this.setDefault()
              }).catch(() => {
                this.loading = true
              })
            } else {
              updateBlog(blog).then(response => {
                onSuccess(response)
                setTimeout(() => {
                  this.$router.push('/blog/list')
                }, 2000)
              }).catch(() => {
                this.loading = false
              })
            }
          } else {
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({ message, type: 'error' })
            this.loading = false
          }
        })
      }
    },
    getBlogData(id) {
      getBlog(id).then(response => {
        this.setData(response.data)
      })
    },
    setDefault() {
      this.$refs.postForm.resetFields()
    },
    setData(data) {
      const {
        id,
        title,
        subtitle,
        contents,
        category,
        categoryText
      } = data
      this.postForm = {
        ...this.postForm,
        id,
        title,
        subtitle,
        category,
        categoryText,
        contents,
        updateType: 2
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .detail-container{
    padding: 10px 50px 20px;
    .el-tag{
      cursor: pointer;
    }
  }
  .form-container{
    .filter-container{
      margin-top: 30px;
      padding: 0 50px;
    }
  }
</style>

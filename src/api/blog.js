import request from '@/utils/request'

export function createBlog(blog) {
  return request({
    url: '/blog/create',
    method: 'post',
    data: blog
  })
}

export function updateBlog(blog) {
  return request({
    url: '/blog/update',
    method: 'post',
    data: blog
  })
}

export function getBlog(id) {
  return request({
    url: '/blog/get',
    method: 'get',
    params: { id }
  })
}

export function setCategory(category) {
  return request({
    url: '/blog/setCategory',
    method: 'post',
    data: category
  })
}

export function getCategory() {
  return request({
    url: '/blog/category',
    method: 'get'
  })
}

export function removeCategory(id) {
  return request({
    url: '/blog/removeCategory',
    method: 'get',
    params: { id }
  })
}

export function listBlog(params) {
  return request({
    url: '/blog/list',
    method: 'get',
    params
  })
}

export function deleteBlog(id) {
  return request({
    url: '/blog/delete',
    method: 'get',
    params: { id }
  })
}

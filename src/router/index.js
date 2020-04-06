import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    name: 'blog',
    path: '/blog',
    redirect: '/blog/create',
    component: Layout,
    meta: { title: '博客管理', icon: 'documentation', roles: ['admin'] },
    children: [
      {
        name: 'blogCreate',
        path: '/blog/create',
        component: () => import('@/views/blog/create'),
        meta: { title: '新增博客', icon: 'edit', roles: ['admin'] }
      },
      {
        name: 'blogEdit',
        path: '/blog/edit/:id',
        component: () => import('@/views/blog/edit'),
        hidden: true,
        meta: { title: '编辑博客', icon: 'edit', roles: ['admin'], activeMenu: '/blog/list' }
      },
      {
        name: 'blogList',
        path: '/blog/list',
        component: () => import('@/views/blog/list'),
        meta: { title: '博客列表', icon: 'edit', roles: ['admin'] }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

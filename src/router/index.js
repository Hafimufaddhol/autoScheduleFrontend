import { createRouter, createWebHistory } from 'vue-router'
import { MainLayout } from '../layouts'
import { Dashboard, Users, GuruView, KelasView, MapelView, KonfigurasiView, NotFound } from '../pages'
import { ClassEditorLayout, ClassInfoTab, ClassRuleTab, ClassJPMapelTab } from '../pages/kelas'
import LoginPage from '../pages/auth/Login.vue' // halaman login kamu
import { JadwalView, JadwalDetailView } from '../pages/jadwal'
// import { useAuth } from '../composables/useAuth'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      // {
      //   path: '',
      //   name: 'Dashboard',
      //   component: Dashboard
      // },
      {
        path: 'jadwal',
        name: 'Jadwal',
        component: JadwalView
      },
      {
        path: 'jadwal/:periode',
        name: 'JadwalDetail',
        component: JadwalDetailView
      },
      {
        path: 'guru',
        name: 'Guru',
        component: GuruView
      },
      {
        path: 'kelas',
        name: 'Kelas',
        component: KelasView
      },
      {
        path: 'kelas/:id',
        component: ClassEditorLayout,
        children: [
          {
            path: '',
            redirect: to => ({ name: 'KelasInfo', params: { id: to.params.id } })
          },
          {
            path: 'info',
            name: 'KelasInfo',
            component: ClassInfoTab
          },
          {
            path: 'aturan',
            name: 'KelasAturan',
            component: ClassRuleTab
          },
          {
            path: 'jp-mapel',
            name: 'KelasJPMapel',
            component: ClassJPMapelTab
          }
        ]
      },
      {
        path: 'mapel',
        name: 'Mapel',
        component: MapelView
      },
      {
        path: 'konfigurasi',
        name: 'Konfigurasi',
        component: KonfigurasiView
      },
      {
        path: 'users',
        name: 'Users',
        component: Users
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  await auth.ensureReady()

  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth !== false)

  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (!requiresAuth && to.name === 'Login' && auth.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router

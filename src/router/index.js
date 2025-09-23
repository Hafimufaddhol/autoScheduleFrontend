import { createRouter, createWebHistory } from 'vue-router'
import { MainLayout } from '../layouts'
import { Dashboard,Users} from '../pages'
// import {users} from 'pages/users/users.vue'

// const routes = [
//     {
//         path: '/', component: MainLayout, children: [
//             {
//                 path: '',
//                 name: 'Dashboard',
//                 component: Dashboard
//             },
//             // {
//             //     path: 'users',
//             //     name: 'Users',
//             //     component: Users
//             // },
//         ]
//     },
// ]
const routes = [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
        path:'/users',
        name:'users',
        component: Users
    }
  ]



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
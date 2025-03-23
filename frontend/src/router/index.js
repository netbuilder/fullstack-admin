import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import AdminView from '../views/AdminView.vue'
import TermekKartya from '../components/TermekKartya.vue'
import UjTermekForm from '../components/UjTermekForm.vue'
import TermekModositas from '../components/TermekModositas.vue'
import AdminUsers from '../components/AdminUsers.vue' 
import AdminTermekek from '../components/AdminTermekek.vue' 
import AdminStatisztikak from '../components/AdminStatisztikak.vue' 
import AdminTermekKartya from '../components/AdminTermekKartya.vue'
import TermekLista from '../components/TermekLista.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
        meta: { requiresAuth: true } //ez lesz a lényeges
  },
  {
    path: '/termekek',
    name: 'termekek',
    component: TermekLista,
        meta: { requiresAuth: true } //ez lesz a lényeges
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  {
    path: '/termekek/:id',
    name: 'termek-kartya',
    component: TermekKartya,
    meta: { requiresAuth: true }
  },
  {
    path: '/termekek/uj',
    name: 'uj-termek',
    component: UjTermekForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/termekek/:id/modositas',
    name: 'termek-modositas',
    component: TermekModositas,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/termekek',
    name: 'admin-termekek',
    component: AdminTermekek,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/termekek/:id',
    name: 'admin-termek-kartya',
    component: AdminTermekKartya,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/statisztikak',
    name: 'admin-statisztikak',
    component: AdminStatisztikak,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const loggedIn = localStorage.getItem('token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !loggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }

  if (requiresAdmin) {
    if (!loggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.szerepkor !== 'Admin') {
        next('/');
        return;
      }
    } catch (error) {
      console.error('Érvénytelen JWT token', error);
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }
  }

  next();
});

export default router
<template>
  <div class="container">
    <h1>Felhasználók</h1>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Felhasználónév</th>
          <th>Email</th>
          <th>Szerepkör</th>
          <th>Állapot</th>
          <th class="text-center">Szerepkör módosítása</th>
          <th class="text-center">Állapot módosítása</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.felhasznalonev }}</td>
          <td>{{ user.email }}</td>
          <td class="fw-bold" :class="user.szerepkor === 'User' ? 'text-success' : 'text-danger'">{{ user.szerepkor }}</td>
          <td class="fw-bold" :class="user.status === 1 ? 'text-success' : 'text-danger'">{{ user.status === 1 ? 'Aktív' : 'Inaktív' }}</td>
          <td class="text-center">
            <select
              class="form-select"
              v-model="user.szerepkor"
              @change="updateUserRole(user)"
              :disabled="user.felhasznalonev === currentUsername"
            >
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </td>
          <td class="text-center">
            <button
              class="btn btn-sm"
              :class="user.status === 1 ? 'btn-danger' : 'btn-success'"
              @click="toggleUserStatus(user)"
              :disabled="user.felhasznalonev === currentUsername"
            >
              {{ user.status === 1 ? 'Inaktiválás' : 'Aktiválás' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      currentUsername: localStorage.getItem('username') || '' 
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.users = response.data;
      } catch (error) {
        console.error(error);
        //alert('Hiba a felhasználók listázása során');
      }
    },
    async toggleUserStatus(user) {
      try {
        const token = localStorage.getItem('token');
        const newStatus = user.status === 1 ? 0 : 1;
        await axios.put(`http://localhost:3000/admin/users/${user.id}/status`, { status: newStatus }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.getUsers();
      } catch (error) {
        console.error(error);
        //alert('Hiba a felhasználó állapotának módosítása során');
      }
    },
    async updateUserRole(user) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/admin/users/${user.id}/role`, { szerepkor: user.szerepkor }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Felhasználó szerepköre sikeresen módosítva!');
      } catch (error) {
        console.error(error);
        alert('Hiba a felhasználó szerepkörének módosítása során');
      }
    }
  }
};
</script>
<template>
    <div class="container text-center">
      <h1>Adminisztrátori Felület</h1>
  
      <!-- Felhasználók listája -->
      <h2>Felhasználók</h2>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Felhasználónév</th>
            <th>Email</th>
            <th>Szerepkör</th>
            <th>Állapot</th>
            <th class="text-center">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.felhasznalonev }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.szerepkor }}</td>
            <td>{{ user.status === 1 ? 'Aktív' : 'Inaktív' }}</td>
            <td class="text-center">
              <button class="btn btn-sm w-100" :class="user.status === 1 ? 'btn-danger' : 'btn-warning'" @click="toggleUserStatus(user)">
                {{ user.status === 1 ? 'Inaktiválás' : 'Aktiválás' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Termékek listája -->
      <h2>Termékek</h2>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Név</th>
            <th>Leírás</th>
            <th>Ár</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="termek in termekek" :key="termek.id">
            <td>{{ termek.id }}</td>
            <td>{{ termek.nev }}</td>
            <td>{{ termek.leiras }}</td>
            <td>{{ termek.ar }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="blokkolTermeket(termek)">Blokkolás</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Statisztikák -->
      <h2>Statisztikák</h2>
      <p>Regisztrált felhasználók száma: {{ regisztraltFelhasznalokSzama }}</p>
      <p>Új termékek száma: {{ ujTermekekSzama }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        users: [],
        termekek: [],
        regisztraltFelhasznalokSzama: 0,
        ujTermekekSzama: 0
      };
    },
    mounted() {
      this.getAdminData();
    },
    methods: {
      async getAdminData() {
        try {
          const token = localStorage.getItem('token');
  
          // Felhasználók lekérdezése
          const usersResponse = await axios.get('http://localhost:3000/admin/users', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.users = usersResponse.data;
  
          // Termékek lekérdezése
          const termekekResponse = await axios.get('http://localhost:3000/admin/termekek', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.termekek = termekekResponse.data;
  
          // Statisztikák lekérdezése
          const statisztikakResponse = await axios.get('http://localhost:3000/admin/statisztikak', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.regisztraltFelhasznalokSzama = statisztikakResponse.data.regisztraltFelhasznalokSzama;
          this.ujTermekekSzama = statisztikakResponse.data.ujTermekekSzama;
  
        } catch (error) {
          console.error(error);
          alert('Hiba az adminisztrátori adatok lekérdezése során');
        }
      },
      async toggleUserStatus(user) {
        try {
          const token = localStorage.getItem('token');
          const newStatus = user.status === 1 ? 0 : 1; // Az új állapot (0 vagy 1)
          await axios.put(`http://localhost:3000/admin/users/${user.id}/status`, { status: newStatus }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          this.getAdminData();
        } catch (error) {
          console.error(error);
          alert('Hiba a felhasználó állapotának módosítása során');
        }
      },
      async blokkolTermeket(termek) {
          try {
              const token = localStorage.getItem('token');
              await axios.put(`http://localhost:3000/admin/termekek/${termek.id}/blokkol`, {}, {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              });
  
              this.getAdminData();
          } catch (error) {
              console.error(error);
              alert('Hiba a termék blokkolása során');
          }
      }
    }
  };
  </script>
<template>
  <div class="container">
    <h1>Statisztikák</h1>

    <div v-if="isDataLoaded">
      <div class="row">
        <div class="col-md-4">
          <h3>Regisztrált felhasználók száma</h3>
          <apexchart type="line" :options="chartOptionsRegisztraltFelhasznalok" :series="seriesRegisztraltFelhasznalok"></apexchart>
        </div>
        <div class="col-md-4">
          <h3>Új termékek száma</h3>
          <apexchart type="bar" :options="chartOptionsUjTermekek" :series="ujTermekekSeries"></apexchart>
        </div>
        <div class="col-md-4">
          <h3>Aktív termékek száma</h3>
          <apexchart type="line" :options="chartOptionsAktivTermekek" :series="aktivTermekekSeries"></apexchart>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Betöltés...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      seriesRegisztraltFelhasznalok: [],
      chartOptionsRegisztraltFelhasznalok: {
        chart: {
          type: 'line',
          toolbar: { show: false }
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: 'Felhasználók száma'
          }
        }
      },
      ujTermekekSeries: [],
      chartOptionsUjTermekek: {
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: 'Termékek száma'
          }
        }
      },
      aktivTermekekSeries: [],
      chartOptionsAktivTermekek: {
        chart: {
          type: 'line',
          toolbar: { show: false }
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: 'Termékek száma'
          }
        }
      },
      isDataLoaded: false,
    };
  },
  mounted() {
    this.getStatisztikak();
  },
  methods: {
    async getStatisztikak() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/admin/statisztikak', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.seriesRegisztraltFelhasznalok = [{
          name: 'Felhasználók',
          data: response.data.regisztraltFelhasznalok.map(item => parseInt(item.szam))
        }];
        this.chartOptionsRegisztraltFelhasznalok.xaxis.categories = response.data.regisztraltFelhasznalok.map(item => item.datum);

        this.ujTermekekSeries = [{
          name: 'Termékek',
          data: response.data.ujTermekek.map(item => parseInt(item.szam))
        }];
        this.chartOptionsUjTermekek.xaxis.categories = response.data.ujTermekek.map(item => item.datum);

        this.aktivTermekekSeries = [{
          name: 'Termékek',
          data: response.data.aktivTermekek.map(item => parseInt(item.szam))
        }];
        this.chartOptionsAktivTermekek.xaxis.categories = response.data.aktivTermekek.map(item => item.datum);

        this.isDataLoaded = true;
      } catch (error) {
        console.error(error);
       // alert('Hiba a statisztikák lekérdezése során');
      }
    }
  }
};
</script>
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">NS Route Planner</h1>
        <p class="text-gray-600">Find the best route for your journey</p>
      </div>

      <!-- Search Form -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <form @submit.prevent="searchRoute" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="from" class="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div class="relative">
                  <MapPinIcon class="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="from"
                    v-model="fromLocation"
                    type="text"
                    placeholder="Station name or address"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label for="to" class="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div class="relative">
                  <MapPinIcon class="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="to"
                    v-model="toLocation"
                    type="text"
                    placeholder="Station name or address"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  id="date"
                  v-model="travelDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex-1">
                <label for="time" class="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  id="time"
                  v-model="travelTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex-1">
                <label for="timeType" class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  id="timeType"
                  v-model="timeType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="departure">Departure</option>
                  <option value="arrival">Arrival</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              <SearchIcon v-if="!loading" class="inline-block w-5 h-5 mr-2" />
              <LoaderIcon v-else class="inline-block w-5 h-5 mr-2 animate-spin" />
              {{ loading ? 'Searching...' : 'Find Route' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="max-w-2xl mx-auto mb-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <AlertCircleIcon class="h-5 w-5 text-red-400 mr-2" />
            <p class="text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="routes.length > 0" class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Journey Options</h2>
        <div class="space-y-4">
          <div
            v-for="(route, index) in routes"
            :key="index"
            class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-200"
          >
            <!-- Route Summary -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="text-lg font-semibold text-gray-900">
                  {{ route.departureTime }} → {{ route.arrivalTime }}
                </div>
                <div class="text-sm text-gray-600">
                  Duration: {{ route.duration }}
                </div>
                <div v-if="route.transfers > 0" class="text-sm text-gray-600">
                  {{ route.transfers }} transfer{{ route.transfers > 1 ? 's' : '' }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">€{{ route.price }}</div>
                <div class="text-sm text-gray-500">{{ route.travelClass }}</div>
              </div>
            </div>

            <!-- Journey Steps -->
            <div class="space-y-3">
              <div
                v-for="(step, stepIndex) in route.steps"
                :key="stepIndex"
                class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <!-- Transport Icon -->
                <div class="flex-shrink-0">
                  <TrainIcon v-if="step.mode === 'train'" class="h-6 w-6 text-blue-600" />
                  <BusIcon v-else-if="step.mode === 'bus'" class="h-6 w-6 text-green-600" />
                  <TramIcon v-else-if="step.mode === 'tram'" class="h-6 w-6 text-yellow-600" />
                  <FootprintsIcon v-else-if="step.mode === 'walk'" class="h-6 w-6 text-gray-600" />
                  <BikeIcon v-else-if="step.mode === 'bike'" class="h-6 w-6 text-orange-600" />
                  <CarIcon v-else class="h-6 w-6 text-purple-600" />
                </div>

                <!-- Step Details -->
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-medium">{{ step.from }}</span>
                      <ArrowRightIcon class="inline-block h-4 w-4 mx-2 text-gray-400" />
                      <span class="font-medium">{{ step.to }}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ step.departureTime }} - {{ step.arrivalTime }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    <span v-if="step.line" class="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                      {{ step.line }}
                    </span>
                    <span v-if="step.platform" class="mr-2">Platform {{ step.platform }}</span>
                    <span>{{ step.duration }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div v-if="route.notes" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-start">
                <InfoIcon class="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <p class="text-yellow-800 text-sm">{{ route.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searched && !loading" class="max-w-2xl mx-auto text-center">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <SearchIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
          <p class="text-gray-600">Try adjusting your search criteria or check the station names.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  SearchIcon,
  MapPinIcon,
  TrainIcon,
  BusIcon,
  FootprintsIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  InfoIcon,
  LoaderIcon,
  BikeIcon,
  CarIcon
} from 'lucide-vue-next'

// Custom Tram Icon component since it's not in lucide
const TramIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
      <rect x="4" y="6" width="16" height="10" rx="2"/>
      <path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
      <circle cx="8" cy="18" r="2"/>
      <circle cx="16" cy="18" r="2"/>
      <path d="M8 16h8"/>
      <path d="M12 6v4"/>
    </svg>
  `
}

// Reactive data
const fromLocation = ref('')
const toLocation = ref('')
const travelDate = ref('')
const travelTime = ref('')
const timeType = ref('departure')
const loading = ref(false)
const error = ref('')
const routes = ref([])
const searched = ref(false)

// Initialize with current date and time
onMounted(() => {
  const now = new Date()
  travelDate.value = now.toISOString().split('T')[0]
  travelTime.value = now.toTimeString().slice(0, 5)
})

// Mock NS API function (replace with actual API integration)
const searchNSRoute = async (from, to, date, time, timeType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock response - replace with actual NS API call
  return [
    {
      departureTime: '14:32',
      arrivalTime: '16:45',
      duration: '2h 13m',
      transfers: 1,
      price: '18.90',
      travelClass: '2nd class',
      steps: [
        {
          mode: 'walk',
          from: from,
          to: 'Amsterdam Centraal',
          departureTime: '14:32',
          arrivalTime: '14:38',
          duration: '6 min',
          line: null,
          platform: null
        },
        {
          mode: 'train',
          from: 'Amsterdam Centraal',
          to: 'Utrecht Centraal',
          departureTime: '14:42',
          arrivalTime: '15:12',
          duration: '30 min',
          line: 'IC 3100',
          platform: '5b'
        },
        {
          mode: 'train',
          from: 'Utrecht Centraal',
          to: to,
          departureTime: '15:18',
          arrivalTime: '16:42',
          duration: '1h 24m',
          line: 'IC 800',
          platform: '7a'
        },
        {
          mode: 'walk',
          from: to + ' Station',
          to: to,
          departureTime: '16:42',
          arrivalTime: '16:45',
          duration: '3 min',
          line: null,
          platform: null
        }
      ],
      notes: 'Check for any service disruptions before traveling.'
    },
    {
      departureTime: '14:47',
      arrivalTime: '17:12',
      duration: '2h 25m',
      transfers: 2,
      price: '18.90',
      travelClass: '2nd class',
      steps: [
        {
          mode: 'bus',
          from: from,
          to: 'Amsterdam Zuid',
          departureTime: '14:47',
          arrivalTime: '15:05',
          duration: '18 min',
          line: 'Bus 15',
          platform: null
        },
        {
          mode: 'train',
          from: 'Amsterdam Zuid',
          to: 'Den Haag Centraal',
          departureTime: '15:12',
          arrivalTime: '16:28',
          duration: '1h 16m',
          line: 'IC 2100',
          platform: '3'
        },
        {
          mode: 'tram',
          from: 'Den Haag Centraal',
          to: to,
          departureTime: '16:35',
          arrivalTime: '17:12',
          duration: '37 min',
          line: 'Tram 9',
          platform: null
        }
      ],
      notes: null
    }
  ]
}

// Search function
const searchRoute = async () => {
  if (!fromLocation.value.trim() || !toLocation.value.trim()) {
    error.value = 'Please enter both departure and destination locations.'
    return
  }

  loading.value = true
  error.value = ''
  routes.value = []
  searched.value = true

  try {
    // In a real implementation, you would:
    // 1. Validate and potentially geocode addresses
    // 2. Call the actual NS API with proper authentication
    // 3. Handle API errors and edge cases
    
    const results = await searchNSRoute(
      fromLocation.value,
      toLocation.value,
      travelDate.value,
      travelTime.value,
      timeType.value
    )
    
    routes.value = results
  } catch (err) {
    error.value = 'Failed to fetch route information. Please try again later.'
    console.error('Route search error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

button, input, select {
  transition: all 0.2s ease-in-out;
}

input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

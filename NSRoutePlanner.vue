<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">NS Route Planner</h1>
        <p class="text-gray-600">Find the best route for your journey in the Netherlands</p>
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
                    placeholder="Station name (e.g., Amsterdam Centraal)"
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
                    placeholder="Station name (e.g., Utrecht Centraal)"
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
                <div v-if="route.price" class="text-lg font-bold text-blue-600">€{{ route.price }}</div>
                <div v-if="route.travelClass" class="text-sm text-gray-500">{{ route.travelClass }}</div>
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
                  <TrainIcon v-if="step.mode === 'TRAIN'" class="h-6 w-6 text-blue-600" />
                  <BusIcon v-else-if="step.mode === 'BUS'" class="h-6 w-6 text-green-600" />
                  <TramIcon v-else-if="step.mode === 'TRAM'" class="h-6 w-6 text-yellow-600" />
                  <FootprintsIcon v-else-if="step.mode === 'WALK'" class="h-6 w-6 text-gray-600" />
                  <BikeIcon v-else-if="step.mode === 'BIKE'" class="h-6 w-6 text-orange-600" />
                  <CarIcon v-else-if="step.mode === 'CAR'" class="h-6 w-6 text-purple-600" />
                  <TrainIcon v-else class="h-6 w-6 text-gray-600" />
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

// NS API configuration
const NS_API_BASE = 'https://gateway.apiportal.ns.nl/reisinformatie-api'
const NS_API_KEY = import.meta.env.VITE_NS_API_KEY || process.env.NS_API_KEY

// Helper function to format time from ISO string
const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

// Helper function to calculate duration between two times
const calculateDuration = (start, end) => {
  if (!start || !end) return ''
  const startTime = new Date(start)
  const endTime = new Date(end)
  const diffMs = endTime - startTime
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Helper function to find station by name
const findStationByName = async (stationName) => {
  try {
    const response = await fetch(`${NS_API_BASE}/api/v2/stations?q=${encodeURIComponent(stationName)}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': NS_API_KEY,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Station search failed: ${response.status}`)
    }
    
    const data = await response.json()
    const stations = data.payload || []
    
    // Find exact match or closest match
    const exactMatch = stations.find(station => 
      station.namen?.lang?.toLowerCase() === stationName.toLowerCase() ||
      station.namen?.middel?.toLowerCase() === stationName.toLowerCase() ||
      station.namen?.kort?.toLowerCase() === stationName.toLowerCase()
    )
    
    return exactMatch || stations[0] || null
  } catch (err) {
    console.error('Station search error:', err)
    return null
  }
}

// Main NS API function for route planning
const searchNSRoute = async (from, to, date, time, timeType) => {
  try {
    // First, find the stations
    const [fromStation, toStation] = await Promise.all([
      findStationByName(from),
      findStationByName(to)
    ])
    
    if (!fromStation) {
      throw new Error(`Station "${from}" not found. Please check the station name.`)
    }
    
    if (!toStation) {
      throw new Error(`Station "${to}" not found. Please check the station name.`)
    }
    
    // Prepare the datetime parameter
    const dateTime = new Date(`${date}T${time}:00`)
    const isoDateTime = dateTime.toISOString()
    
    // Build the API URL
    const params = new URLSearchParams({
      fromStation: fromStation.code || fromStation.UICCode,
      toStation: toStation.code || toStation.UICCode,
      dateTime: isoDateTime,
      searchForArrival: timeType === 'arrival' ? 'true' : 'false',
      lang: 'en'
    })
    
    const response = await fetch(`${NS_API_BASE}/api/v3/trips?${params}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': NS_API_KEY,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API authentication failed. Please check your NS API key.')
      } else if (response.status === 404) {
        throw new Error('No routes found between these stations.')
      } else {
        throw new Error(`API request failed: ${response.status}`)
      }
    }
    
    const data = await response.json()
    const travelAdvices = Array.isArray(data) ? data : [data]
    
    // Transform the API response to our format
    const transformedRoutes = []
    
    for (const advice of travelAdvices) {
      if (advice.trips && advice.trips.length > 0) {
        for (const trip of advice.trips) {
          const legs = trip.legs || []
          const firstLeg = legs[0]
          const lastLeg = legs[legs.length - 1]
          
          if (!firstLeg || !lastLeg) continue
          
          const route = {
            departureTime: formatTime(firstLeg.origin?.plannedDateTime || firstLeg.origin?.actualDateTime),
            arrivalTime: formatTime(lastLeg.destination?.plannedDateTime || lastLeg.destination?.actualDateTime),
            duration: calculateDuration(
              firstLeg.origin?.plannedDateTime || firstLeg.origin?.actualDateTime,
              lastLeg.destination?.plannedDateTime || lastLeg.destination?.actualDateTime
            ),
            transfers: trip.transfers || 0,
            price: trip.fares && trip.fares.length > 0 ? (trip.fares[0].priceInCents / 100).toFixed(2) : null,
            travelClass: trip.fares && trip.fares.length > 0 ? 
              (trip.fares[0].travelClass === 'SECOND_CLASS' ? '2nd class' : '1st class') : null,
            steps: [],
            notes: trip.messages && trip.messages.length > 0 ? trip.messages[0].text : null
          }
          
          // Transform legs to steps
          for (const leg of legs) {
            const step = {
              mode: leg.product?.type || leg.travelType || 'WALK',
              from: leg.origin?.name || '',
              to: leg.destination?.name || '',
              departureTime: formatTime(leg.origin?.plannedDateTime || leg.origin?.actualDateTime),
              arrivalTime: formatTime(leg.destination?.plannedDateTime || leg.destination?.actualDateTime),
              duration: calculateDuration(
                leg.origin?.plannedDateTime || leg.origin?.actualDateTime,
                leg.destination?.plannedDateTime || leg.destination?.actualDateTime
              ),
              line: leg.product?.displayName || leg.product?.number || null,
              platform: leg.origin?.plannedTrack || leg.origin?.actualTrack || null
            }
            
            route.steps.push(step)
          }
          
          transformedRoutes.push(route)
        }
      }
    }
    
    return transformedRoutes
  } catch (err) {
    console.error('NS API Error:', err)
    throw err
  }
}

// Search function
const searchRoute = async () => {
  if (!fromLocation.value.trim() || !toLocation.value.trim()) {
    error.value = 'Please enter both departure and destination locations.'
    return
  }
  
  if (!NS_API_KEY) {
    error.value = 'NS API key is not configured. Please check your environment variables.'
    return
  }

  loading.value = true
  error.value = ''
  routes.value = []
  searched.value = true

  try {
    const results = await searchNSRoute(
      fromLocation.value,
      toLocation.value,
      travelDate.value,
      travelTime.value,
      timeType.value
    )
    
    routes.value = results
    
    if (results.length === 0) {
      error.value = 'No routes found. Please check your station names and try again.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch route information. Please try again later.'
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

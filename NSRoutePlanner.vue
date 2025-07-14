<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">NS Route Planner</h1>
        <p class="text-gray-600">Plan your journey across the Netherlands</p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="from" class="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              id="from"
              v-model="fromStation"
              type="text"
              placeholder="e.g., Amsterdam Centraal"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="searchRoutes"
            />
          </div>
          <div>
            <label for="to" class="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              id="to"
              v-model="toStation"
              type="text"
              placeholder="e.g., Utrecht Centraal"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="searchRoutes"
            />
          </div>
        </div>
        
        <div class="flex justify-center">
          <button
            @click="searchRoutes"
            :disabled="loading || !fromStation.trim() || !toStation.trim()"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Search class="w-4 h-4" />
            {{ loading ? 'Searching...' : 'Search Routes' }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 text-red-800">
          <AlertCircle class="w-5 h-5" />
          <span class="font-medium">Error</span>
        </div>
        <p class="text-red-700 mt-1">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Finding the best routes...</p>
      </div>

      <!-- Results -->
      <div v-if="routes.length > 0 && !loading" class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Available Routes</h2>
        
        <div
          v-for="(route, index) in routes"
          :key="index"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <!-- Route Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <span>{{ formatTime(route.departureTime) }}</span>
                <ArrowRight class="w-4 h-4 text-gray-400" />
                <span>{{ formatTime(route.arrivalTime) }}</span>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                Duration: {{ route.duration }} • {{ route.transfers }} transfer{{ route.transfers !== 1 ? 's' : '' }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-green-600">€{{ route.price }}</div>
              <div class="text-sm text-gray-500">2nd class</div>
            </div>
          </div>

          <!-- Route Steps -->
          <div class="space-y-3">
            <div
              v-for="(step, stepIndex) in route.steps"
              :key="stepIndex"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <!-- Transport Icon -->
              <div class="flex-shrink-0">
                <Train v-if="step.type === 'train'" class="w-6 h-6 text-blue-600" />
                <Bus v-else-if="step.type === 'bus'" class="w-6 h-6 text-green-600" />
                <Zap v-else-if="step.type === 'tram'" class="w-6 h-6 text-yellow-600" />
                <MapPin v-else class="w-6 h-6 text-gray-600" />
              </div>

              <!-- Step Details -->
              <div class="flex-grow">
                <div class="font-medium text-gray-900">{{ step.line }}</div>
                <div class="text-sm text-gray-600">
                  {{ step.from }} → {{ step.to }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatTime(step.departureTime) }} - {{ formatTime(step.arrivalTime) }}
                  <span v-if="step.platform" class="ml-2">Platform {{ step.platform }}</span>
                  <span v-if="step.delay" class="ml-2 text-red-600">+{{ step.delay }}min</span>
                </div>
              </div>

              <!-- Duration -->
              <div class="text-sm text-gray-500 text-right">
                {{ step.duration }}
              </div>
            </div>
          </div>

          <!-- Route Status -->
          <div v-if="route.status && route.status !== 'NORMAL'" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center gap-2 text-yellow-800">
              <AlertTriangle class="w-4 h-4" />
              <span class="font-medium">{{ getStatusText(route.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="searched && routes.length === 0 && !loading && !error" class="text-center py-8">
        <MapPin class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
        <p class="text-gray-600">Try different stations or check your spelling.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, ArrowRight, Train, Bus, Zap, MapPin, AlertCircle, AlertTriangle } from 'lucide-vue-next'

// Reactive state
const fromStation = ref('')
const toStation = ref('')
const routes = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)

// NS API configuration
const NS_API_BASE = 'https://gateway.apiportal.ns.nl/reisinformatie-api'
const API_KEY = import.meta.env.VITE_NS_API_KEY

// API functions
async function findStation(stationName) {
  try {
    const response = await fetch(`${NS_API_BASE}/api/v2/stations?q=${encodeURIComponent(stationName)}&limit=1`, {
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY
      }
    })
    
    if (!response.ok) {
      throw new Error(`Station search failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.payload && data.payload.length > 0) {
      return data.payload[0].code || data.payload[0].UICCode
    }
    
    throw new Error(`Station "${stationName}" not found`)
  } catch (err) {
    console.error('Station search error:', err)
    throw err
  }
}

async function getRoutes(fromCode, toCode) {
  try {
    const response = await fetch(`${NS_API_BASE}/api/v3/trips?fromStation=${fromCode}&toStation=${toCode}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY
      }
    })
    
    if (!response.ok) {
      throw new Error(`Route search failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.length > 0 && data[0].trips) {
      return data[0].trips
    }
    
    return []
  } catch (err) {
    console.error('Route search error:', err)
    throw err
  }
}

// Transform NS API data to our format
function transformRoute(trip) {
  const legs = trip.legs || []
  const steps = []
  
  legs.forEach(leg => {
    if (leg.product && leg.product.type !== 'WALK') {
      steps.push({
        type: getTransportType(leg.product.type),
        line: leg.product.displayName || leg.name || 'Unknown',
        from: leg.origin?.name || 'Unknown',
        to: leg.destination?.name || 'Unknown',
        departureTime: leg.origin?.plannedDateTime || leg.origin?.actualDateTime,
        arrivalTime: leg.destination?.plannedDateTime || leg.destination?.actualDateTime,
        platform: leg.origin?.plannedTrack || leg.origin?.actualTrack,
        delay: calculateDelay(leg.origin?.plannedDateTime, leg.origin?.actualDateTime),
        duration: formatDuration(leg.plannedDurationInMinutes)
      })
    }
  })
  
  const firstLeg = legs[0]
  const lastLeg = legs[legs.length - 1]
  
  return {
    departureTime: firstLeg?.origin?.plannedDateTime || firstLeg?.origin?.actualDateTime,
    arrivalTime: lastLeg?.destination?.plannedDateTime || lastLeg?.destination?.actualDateTime,
    duration: formatDuration(trip.plannedDurationInMinutes),
    transfers: trip.transfers || 0,
    price: formatPrice(trip.fares?.[0]?.priceInCents || trip.productFare?.priceInCents),
    steps: steps,
    status: trip.status
  }
}

function getTransportType(nsType) {
  switch (nsType?.toUpperCase()) {
    case 'TRAIN': return 'train'
    case 'BUS': return 'bus'
    case 'TRAM': return 'tram'
    case 'METRO': return 'tram'
    default: return 'train'
  }
}

function calculateDelay(planned, actual) {
  if (!planned || !actual) return null
  
  const plannedTime = new Date(planned)
  const actualTime = new Date(actual)
  const diffMinutes = Math.round((actualTime - plannedTime) / (1000 * 60))
  
  return diffMinutes > 0 ? diffMinutes : null
}

function formatPrice(priceInCents) {
  if (!priceInCents) return '0.00'
  return (priceInCents / 100).toFixed(2)
}

function formatDuration(minutes) {
  if (!minutes) return '0m'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return '--:--'
  
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return '--:--'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'CANCELLED': return 'Cancelled'
    case 'CHANGE_NOT_POSSIBLE': return 'Transfer not possible'
    case 'ALTERNATIVE_TRANSPORT': return 'Alternative transport'
    case 'DISRUPTION': return 'Disruption'
    case 'MAINTENANCE': return 'Maintenance'
    case 'DELAYED': return 'Delayed'
    default: return 'Service notice'
  }
}

// Main search function
async function searchRoutes() {
  if (!fromStation.value.trim() || !toStation.value.trim()) {
    error.value = 'Please enter both departure and destination stations'
    return
  }

  if (!API_KEY) {
    error.value = 'NS API key not configured. Please check your environment variables.'
    return
  }

  loading.value = true
  error.value = ''
  routes.value = []
  searched.value = true

  try {
    // Find station codes
    const [fromCode, toCode] = await Promise.all([
      findStation(fromStation.value.trim()),
      findStation(toStation.value.trim())
    ])

    // Get routes
    const trips = await getRoutes(fromCode, toCode)
    
    if (trips.length === 0) {
      routes.value = []
    } else {
      routes.value = trips.slice(0, 5).map(transformRoute)
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.message || 'Failed to search routes. Please try again.'
  } finally {
    loading.value = false
  }
}

// Initialize with example data
onMounted(() => {
  // Set example stations
  fromStation.value = 'Amsterdam Centraal'
  toStation.value = 'Utrecht Centraal'
})
</script>

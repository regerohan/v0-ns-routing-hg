<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-h4 font-weight-bold mb-2">NS Route Planner</h1>
          <p class="text-subtitle-1 text-medium-emphasis">Plan your journey across the Netherlands</p>
        </div>

        <!-- Search Form -->
        <v-card class="mb-6">
          <v-card-item>
            <v-card-title>Find Your Route</v-card-title>
            <v-card-subtitle>Enter your departure and destination stations.</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  label="From"
                  id="from"
                  v-model="fromStation"
                  type="text"
                  placeholder="e.g., Amsterdam Centraal"
                  @keyup.enter="searchRoutes"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="To"
                  id="to"
                  v-model="toStation"
                  type="text"
                  placeholder="e.g., Utrecht Centraal"
                  @keyup.enter="searchRoutes"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <div class="d-flex justify-center mt-4">
              <v-btn
                @click="searchRoutes"
                :disabled="loading || !fromStation.trim() || !toStation.trim()"
                color="primary"
                size="large"
              >
                <v-icon start>mdi-magnify</v-icon>
                {{ loading ? 'Searching...' : 'Search Routes' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Error Message -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-6"
          icon="mdi-alert-circle"
        >
          <span class="font-weight-medium">Error:</span>
          {{ error }}
        </v-alert>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            width="6"
          ></v-progress-circular>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">Finding the best routes...</p>
        </div>

        <!-- Results -->
        <div v-if="routes.length > 0 && !loading" class="space-y-4">
          <h2 class="text-h5 font-weight-bold mb-4">Available Routes</h2>
          
          <v-card
            v-for="(route, index) in routes"
            :key="index"
            class="mb-4"
          >
            <v-card-item>
              <div class="d-flex justify-space-between align-center">
                <v-card-title class="text-h6 font-weight-semibold">
                  {{ formatTime(route.departureTime) }} <v-icon size="small">mdi-arrow-right</v-icon> {{ formatTime(route.arrivalTime) }}
                </v-card-title>
                <div class="text-h5 font-weight-bold text-primary">€{{ route.price }}</div>
              </div>
            </v-card-item>
            <v-card-text>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Duration: {{ route.duration }} • {{ route.transfers }} transfer{{ route.transfers !== 1 ? 's' : '' }} • 2nd class
              </p>

              <!-- Route Steps -->
              <div class="space-y-3">
                <v-card
                  v-for="(step, stepIndex) in route.steps"
                  :key="stepIndex"
                  class="mb-2"
                  flat
                  variant="outlined"
                >
                  <v-card-text class="d-flex align-center gap-4 pa-3">
                    <!-- Transport Icon -->
                    <div class="flex-shrink-0">
                      <v-icon v-if="step.type === 'train'" color="primary">mdi-train</v-icon>
                      <v-icon v-else-if="step.type === 'bus'" color="green">mdi-bus</v-icon>
                      <v-icon v-else-if="step.type === 'tram'" color="yellow-darken-2">mdi-tram</v-icon>
                      <v-icon v-else>mdi-map-marker</v-icon>
                    </div>

                    <!-- Step Details -->
                    <div class="flex-grow-1">
                      <div class="font-weight-medium">{{ step.line }}</div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ step.from }} → {{ step.to }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ formatTime(step.departureTime) }} - {{ formatTime(step.arrivalTime) }}
                        <span v-if="step.platform" class="ml-2">Platform {{ step.platform }}</span>
                        <span v-if="step.delay" class="ml-2 text-error">+{{ step.delay }}min</span>
                      </div>
                    </div>

                    <!-- Duration -->
                    <div class="text-body-2 text-medium-emphasis text-right">
                      {{ step.duration }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Route Status -->
              <v-alert
                v-if="route.status && route.status !== 'NORMAL'"
                type="warning"
                class="mt-4"
                icon="mdi-alert-triangle"
              >
                <span class="font-weight-medium">{{ getStatusText(route.status) }}</span>
              </v-alert>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Results -->
        <div v-if="searched && routes.length === 0 && !loading && !error" class="text-center py-8">
          <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-map-marker</v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">No routes found</h3>
          <p class="text-subtitle-1 text-medium-emphasis">Try different stations or check your spelling.</p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Removed Lucide icons and Shadcn component imports
// import { Search, ArrowRight, Train, Bus, Zap, MapPin, AlertCircle, AlertTriangle } from 'lucide-vue-next'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    console.log('Raw data from getRoutes:', data)
    
    if (data && data.trips) {
      return data.trips
    }
    
    return []
  } catch (err) {
    console.error('Route search error:', err)
    throw err
  }
}

// Transform NS API data to our format
function transformRoute(trip) {
  console.log('Transforming trip:', trip)
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
  
  const transformed = {
    departureTime: firstLeg?.origin?.plannedDateTime || firstLeg?.origin?.actualDateTime,
    arrivalTime: lastLeg?.destination?.plannedDateTime || lastLeg?.destination?.actualDateTime,
    duration: formatDuration(trip.plannedDurationInMinutes),
    transfers: trip.transfers || 0,
    price: formatPrice(trip.fares?.[0]?.priceInCents || trip.productFare?.priceInCents),
    steps: steps,
    status: trip.status
  }
  console.log('Transformed route:', transformed)
  return transformed
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
    console.log('Trips received:', trips)
    
    if (trips.length === 0) {
      routes.value = []
    } else {
      routes.value = trips.slice(0, 5).map(transformRoute)
    }
    console.log('Final routes.value:', routes.value)
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

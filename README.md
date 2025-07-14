# NS Route Planner

A modern Vue 3 web application for planning train journeys across the Netherlands using the official NS (Nederlandse Spoorwegen) API.

## Features

- 🚂 **Real-time Route Planning** - Get live journey information using the official NS API
- 💰 **Actual Ticket Prices and Fare Information** - Get pricing details for your journey
- ⏰ **Live Departure Times and Delay Information** - Plan for departure or arrival times
- 🚌 **Multi-modal Transport** - See trains, buses, trams, and walking directions
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔄 **Real-time Updates and Service Disruptions** - Stay informed about any service issues

## Getting Started

### Prerequisites

- Node.js 18 or higher
- NS API key from [NS API Portal](https://apiportal.ns.nl/)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/ns-route-planner.git
   cd ns-route-planner
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create a `.env.local` file and add your NS API key**
   \`\`\`env
   VITE_NS_API_KEY=your_ns_api_key_here
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open [http://localhost:5173](http://localhost:5173) in your browser**

### Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## Live Demo

Visit the live application: [NS Route Planner](https://your-username.github.io/ns-route-planner/)

## Usage

1. **Enter Journey Details**:
   - From: Enter departure station (e.g., "Amsterdam Centraal")
   - To: Enter destination station (e.g., "Utrecht Centraal")
   - Click "Search Routes" to find available journeys

2. **View Results**:
   - See multiple route options
   - Check journey duration and transfers
   - View step-by-step directions
   - See fare information

3. **Journey Details**:
   - Transport modes with icons
   - Platform information
   - Real-time delays
   - Service disruptions

## API Integration

This app integrates with the official NS Reisinformatie API to provide:

- **Trip Planning** (`/api/v3/trips`) - Complete journey planning with transfers
- **Station Search** (`/api/v2/stations`) - Find stations by name
- **Real-time Data** - Live departure times and delays
- **Fare Information** - Ticket prices and travel classes
- **Service Disruptions** (`/api/v3/disruptions`) - Information about service disruptions

## Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Build Tool**: Vite
- **Deployment**: GitHub Pages
- **API**: NS Reisinformatie API

## API Endpoints Used

- `GET /api/v2/stations` - Station information and search
- `GET /api/v3/trips` - Travel advice and route planning
- `GET /api/v3/price` - Fare information
- `GET /api/v3/disruptions` - Service disruptions

## Deployment

The app automatically deploys to GitHub Pages when you push to the main branch. Make sure to:

1. **Set up the NS API secret** in your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Add a new secret named `NS_API` with your NS API key

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NS (Nederlandse Spoorwegen)](https://www.ns.nl/) for providing the API
- [Vue.js](https://vuejs.org/) for the reactive framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the beautiful icons

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/ns-route-planner/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Note**: This application requires a valid NS API key to function. The API key should be kept secure and not exposed in client-side code.

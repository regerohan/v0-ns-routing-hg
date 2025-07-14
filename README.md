# NS Route Planner

A Vue 3 web application for finding the best routes in the Netherlands using the NS (Nederlandse Spoorwegen) API.

## Features

- 🚂 Find optimal routes between stations or addresses
- 🕐 Schedule planning with departure/arrival times
- 🚌 Multi-modal transport support (train, bus, tram, walking)
- 📱 Responsive design for mobile and desktop
- ⚡ Fast and lightweight Vue 3 application
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/ns-routing.git
cd ns-routing
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. Every push to the `main` branch will trigger a new deployment.

### Manual Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## NS API Integration

To use the real NS API:

1. Register at the [NS API Developer Portal](https://apiportal.ns.nl/)
2. Obtain your API key
3. Replace the mock `searchNSRoute` function in `NSRoutePlanner.vue` with actual API calls
4. Handle CORS by using a backend proxy or serverless functions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NS API](https://apiportal.ns.nl/) for providing public transport data
- [Vue.js](https://vuejs.org/) for the reactive framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons
\`\`\`

Create a license file:

```text file="LICENSE"
MIT License

Copyright (c) 2024 NS Route Planner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

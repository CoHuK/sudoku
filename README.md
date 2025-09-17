# Sudoku Game 🧩

A modern, responsive Sudoku game built with JavaScript, Node.js, and deployed on AWS infrastructure.

## 🎮 Demo Project

This is a demonstration project showcasing modern web development practices and cloud deployment using:

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express
- **Cloud Infrastructure**: AWS EC2, AWS Elastic Beanstalk
- **Containerization**: Docker & Docker Hub
- **CDN & SSL**: Cloudflare

## 🎯 Features

- **Two Difficulty Modes**: Easy and Normal
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Instant feedback on number placement
- **Visual Feedback**: Color-coded cells for errors, success, and selection
- **Modern UI**: Gradient backgrounds, smooth animations, and intuitive controls
- **Auto-solve Detection**: Automatically detects when puzzle is completed

## 🚀 Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Sudoku
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open your browser**

   Navigate to `http://localhost:3000`

### Docker Deployment

```bash
# Build and run with Docker
docker build -t sudoku-game .
docker run -d -p 80:3000 --name sudoku-container sudoku-game

# Or use Docker Compose
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS Elastic Beanstalk (Recommended)

```bash
# Deploy to AWS
npm run cloud-deploy
```

This script will:

1. Build the Docker image
2. Push to Docker Hub
3. Deploy to AWS Elastic Beanstalk

### Manual AWS Deployment

```bash
# Initialize EB (first time only)
eb init

# Create environment
eb create sudoku-production --single

# Deploy updates
eb deploy
```

## 🌐 Live Demo

- **Production URL**: [https://sudoku.strongin.qa](https://sudoku.strongin.qa)
- **AWS EB URL**: Available after deployment

## 🛠️ Technology Stack

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, animations, responsive design
- **JavaScript (ES6+)**: Modern JavaScript features, async/await
- **Progressive Web App**: Mobile-optimized input handling

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Static File Serving**: Frontend asset delivery

### Infrastructure

- **Docker**: Containerization
- **AWS EC2**: Virtual servers
- **AWS Elastic Beanstalk**: Platform-as-a-Service
- **Docker Hub**: Container registry
- **Cloudflare**: CDN, SSL, and DNS management

## 📁 Project Structure

```text
Sudoku/
├── backend/
│   └── server.js          # Express server
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── script.js          # Game logic and UI
│   └── style.css          # Styling and responsive design
├── cloud_deploy.sh        # Cloud deployment script
├── deploy.sh              # Local deployment script
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── Dockerrun.aws.json     # AWS EB configuration
├── package.json           # Node.js dependencies and scripts
└── README.md              # This file
```

## 🎮 How to Play

1. **Select Difficulty**: Choose between Easy or Normal mode
2. **Fill the Grid**: Click on empty cells and enter numbers 1-9
3. **Follow Sudoku Rules**:

   - Each row must contain numbers 1-9 without repetition
   - Each column must contain numbers 1-9 without repetition
   - Each 3x3 box must contain numbers 1-9 without repetition
4. **Get Feedback**: The game provides real-time validation
5. **Complete the Puzzle**: Fill all cells correctly to win!

## 🔧 Development Scripts

```bash
npm start              # Start the development server
npm run cloud-deploy   # Deploy to AWS cloud infrastructure
```

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices:

- Touch-friendly interface
- Mobile-optimized number input
- Responsive grid layout
- Swipe and tap interactions

## 🚀 Deployment Architecture

```text
Internet → Cloudflare CDN → AWS Elastic Beanstalk → EC2 Instance → Docker Container
```

- **Cloudflare**: Provides CDN, SSL termination, and DDoS protection
- **AWS EB**: Manages application deployment and scaling
- **EC2**: Runs the containerized application
- **Docker**: Ensures consistent deployment across environments

## 💰 Cost

This project is designed to run **completely free** for the first year (6 months, if you have a new AWS free-tier):

- **AWS Free Tier**: t2.micro EC2 instance
- **Cloudflare Free Plan**: CDN and SSL
- **Docker Hub**: Free public repositories

## 🤝 Contributing

This is a demo project, but contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [https://sudoku.strongin.qa](https://sudoku.strongin.qa)
- **AWS Elastic Beanstalk**: [AWS Console](https://console.aws.amazon.com/elasticbeanstalk/)
- **Docker Hub**: [Container Registry](https://hub.docker.com/)
- **Cloudflare**: [DNS Management](https://dash.cloudflare.com/)

---

## Built with ❤️ using modern web technologies and cloud infrastructure

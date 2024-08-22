# Comprehensive Web Content Analyzer

## Overview

The Comprehensive Web Content Analyzer is a powerful tool that combines web scraping with AI-powered analysis to extract and interpret content from web pages. It utilizes Puppeteer for web scraping and OpenAI's GPT-4 Vision model for intelligent content analysis based on user queries.

## Features

- Web page scraping with Puppeteer
- AI-powered content analysis using GPT-4 Vision
- Query-based content extraction
- User-friendly React frontend
- Express.js backend with API rate limiting

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (usually comes with Node.js)
- An OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/comprehensive-web-content-analyzer.git
   cd comprehensive-web-content-analyzer
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the `backend` directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`.

4. Enter a URL and a query in the provided input fields.

5. Click "Analyze Website" to initiate the analysis.

6. View the structured results displayed on the page.

## Configuration

You can adjust the following configurations:

- Port number: Change the `PORT` variable in `backend/server.js`
- Rate limiting: Modify the `apiLimiter` settings in `backend/server.js`
- GPT-4 Vision parameters: Adjust the `max_tokens` and other parameters in the `analyzeWithGPT4Vision` function in `backend/server.js`

## Contributing

Contributions to the Comprehensive Web Content Analyzer are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

If you want to contact the maintainer of this project, please email [your-email@example.com](mailto:your-email@example.com).

## Acknowledgements

- [OpenAI](https://openai.com/) for the GPT-4 Vision model
- [Puppeteer](https://pptr.dev/) for web scraping capabilities
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend server
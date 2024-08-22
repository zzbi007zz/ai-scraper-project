require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: 'sk-svcacct-Ti6Ym6GAlvFBw4kOkck6kkZKhy93653ZDyJ5tKLzZG4OxT3BlbkFJPzABkrVuGLJEN4XHsDs1aK7otFyPqmHNTsJ6_g59kMEaQA',
    baseURL: 'https://api.openai.com/v1',
});

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/scrape', apiLimiter);

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
fs.mkdir(screenshotsDir, { recursive: true }).catch(console.error);

async function captureScreenshot(page, screenshotPath) {
    await page.screenshot({
        path: screenshotPath,
        fullPage: true,
    });
    console.log(`Screenshot saved to ${screenshotPath}`);
}

async function scrapeWebsite(url, query) {
    let browser;
    try {
        console.log(`Starting scrape for URL: ${url} with query: ${query}`);
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        const page = await browser.newPage();

        // Set a default viewport size
        await page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
        });

        console.log(`Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 120000
        });

        // Ensure the page is fully loaded
        await page.evaluate(() => new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        }));

        // Get the page dimensions
        const dimensions = await page.evaluate(() => {
            return {
                width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            };
        });

        // Set the viewport to match the page dimensions
        await page.setViewport(dimensions);

        const screenshotPath = path.join(screenshotsDir, `screenshot_${Date.now()}.jpg`);
        console.log(`Capturing screenshot to ${screenshotPath}...`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });
        console.log('Screenshot captured successfully');

        console.log('Analyzing screenshot...');
        const analysis = await analyzeWithGPT4Vision(screenshotPath, query);

        return {
            url,
            screenshotPath,
            analysis
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function analyzeWithGPT4Vision(screenshotPath, query) {
    try {
        const imageBuffer = await fs.readFile(screenshotPath);
        const base64Image = imageBuffer.toString('base64');

        console.log('Sending image to OpenAI API for analysis...');
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant specialized in analyzing web page screenshots and extracting relevant information. Your task is to examine the provided screenshot and return all content that matches or is relevant to the user's query. Please follow these guidelines:

                    1. Carefully analyze all visible text in the screenshot.
                    2. Focus on finding information that is directly related to or answers the user's query.
                    3. Extract and report all relevant text, including headings, paragraphs, list items, and any other textual content.
                    4. If there are relevant images, describe them briefly if they pertain to the query.
                    5. If tables are present and relevant to the query, describe their content.
                    6. Provide context for the extracted information when necessary.
                    7. If the query is about the structure or layout of the page, describe relevant aspects of the page's organization.
                    8. If no information relevant to the query is found, state this clearly.
                    9. Organize your response in a clear, structured manner.
                    10. Be thorough but avoid including irrelevant information.

                    Return your response as a JSON object with the following structure:
                    {
                        "summary": "A brief summary of the findings",
                        "sections": [
                        {
                            "title": "Section Title",
                            "content": "Section content..."
                        },
                        ...
                    ],
                    "relevantImages": [
                        "Description of relevant image 1",
                        ...
                    ],
                    "tables": [
                        "Description of relevant table 1",
                        ...
                    ]
                    }

                    IMPORTANT: Return ONLY the JSON object, without any additional text or code block formatting.`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            }
                        },
                        {
                            type: "text",
                            text: `Analyze this screenshot and provide all content that is relevant to the following query: "${query}". Extract and report all matching or relevant information from the image, the result should clear strictly follow the user request such as user request a list the result should return a list.`
                        }
                    ]
                }
            ],
            max_tokens: 4096,
        });
        console.log('Analysis completed successfully');
        
        let content = response.choices[0].message.content;
        
        // Remove any potential code block formatting
        content = content.replace(/```json\n?|\n?```/g, '').trim();
        
        // Attempt to parse the JSON
        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            // If parsing fails, return the raw content
            return { error: "Failed to parse JSON", rawContent: content };
        }
    } catch (error) {
        console.error("Error in GPT-4 Vision analysis:", error);
        throw error;
    }
}
app.post('/scrape', async (req, res) => {
    const { url, query } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        console.log(`Received scrape request for URL: ${url} with query: ${query}`);
        const result = await scrapeWebsite(url, query);
        res.json(result);
    } catch (error) {
        console.error('Error in scrape route:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
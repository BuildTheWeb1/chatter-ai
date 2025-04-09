import cors from "cors";
import express from "express";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your React app
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Demo endpoint for testing
app.post("/api/chat", (req, res) => {
	const { message } = req.body;
	const demoResponse = `Demo response to: "${message}"`;
	res.json({ response: demoResponse });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

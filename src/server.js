import express from 'express';
import cors from 'cors';
import { fetchAllDependabotPRs } from './github'
import { scheduleDailySummary } from './scheduler';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get('/api/prs', async(req, res) => {
    try {
        const prs = await fetchAllDependabotPRs();
        res.json(prs);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    scheduleDailySummary();
})
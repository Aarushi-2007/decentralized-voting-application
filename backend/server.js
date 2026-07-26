const express= require('express');
const cors= require('cors');
const communityRoutes= require('./routes/communityRoutes');

require('dotenv').config();

const app= express();
const db= require('./db');

app.use(express.json());
app.use(
    cors({
        origin:"https://decentralized-voting-application-lovat.vercel.app",
        credentials: true,
    })
);

app.use('/api/communities', communityRoutes);

const PORT= process.env.PORT;
app.listen(PORT, ()=> {
    console.log(`Listening on PORT ${PORT}`)
})
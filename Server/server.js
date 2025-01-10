
const express = require('express');

const app = express();

app.use(express.json());
app.get("/",(req,res)=>{
    res.send({message:"Hello this is backend"})
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
var refreshImage = false;

var planetIndex = 1;

app.use(cors());
app.use(express.static("uploads"));

const uploadFolder = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        if (planetIndex > 5) {
            planetIndex = 1;
        }
        cb(null, "latest" + planetIndex + path.extname(file.originalname)); 
        planetIndex++;
    }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
});
app.get('/update',(req, res) => {
    refreshImage = true; 
});

app.get('/update2', (req, res) => {
    res.json({ success: refreshImage });
});


app.get("/latest5", (req, res) => {
    res.sendFile(path.join(uploadFolder, "latest5.png"));
});
app.get("/latest1", (req, res) => {
    res.sendFile(path.join(uploadFolder, "latest1.png"));   
});
app.get("/latest2", (req, res) => {
    res.sendFile(path.join(uploadFolder, "latest2.png"));
});
app.get("/latest3", (req, res) => {
    res.sendFile(path.join(uploadFolder, "latest3.png"));
});
app.get("/latest4", (req, res) => {
    res.sendFile(path.join(uploadFolder, "latest4.png"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
